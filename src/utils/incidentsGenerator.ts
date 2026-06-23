import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Employee, Permission } from '../lib/api';
import { GlobalObservation } from '../components/attendance/GlobalObservationForm';

interface AttendanceRecord {
    empleado: string;
    entrada: Date;
    salida: Date;
    horasTrabajadas: string;
    horasExtra: string;
    departamento: string;
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const normalizeText = (text: string): string => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

const getScheduleInfo = (employeeData?: Employee) => {
    const defaults = { entry_time: '09:00', exit_time: '18:00', tolerance_minutes: 15 };
    return employeeData ? { ...defaults, entry_time: employeeData.entry_time || defaults.entry_time, exit_time: employeeData.exit_time || defaults.exit_time, tolerance_minutes: employeeData.tolerance_minutes ?? defaults.tolerance_minutes } : defaults;
};

const formatDate = (date: Date): string => `${DIAS_SEMANA[date.getDay()].charAt(0).toUpperCase() + DIAS_SEMANA[date.getDay()].slice(1)}, ${date.getDate()} de ${date.toLocaleString('es-MX', { month: 'long' })} ${date.getFullYear()}`;

const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
};

export async function generateIncidentsReport(
    attendanceRecords: AttendanceRecord[],
    employees: Employee[],
    permissions: Permission[],
    startDateInput: string,
    endDateInput: string,
    globalObservations: GlobalObservation[]
) {
    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet('Resumen de Incidencias');
    const detailsSheet = workbook.addWorksheet('Detalle de Incidencias');

    const employeeMap = new Map(employees.map(emp => [normalizeText(emp.full_name), emp]));
    const uniqueEmployees = [...new Set(attendanceRecords.map(r => r.empleado))].sort((a, b) => a.localeCompare(b));

    const globalStart = new Date(startDateInput + 'T00:00:00');
    globalStart.setDate(globalStart.getDate() - (globalStart.getDay() - 5 + 7) % 7);

    const globalEnd = new Date(endDateInput + 'T23:59:59');
    globalEnd.setDate(globalEnd.getDate() + (4 - globalEnd.getDay() + 7) % 7);

    detailsSheet.columns = [{ header: 'No. Empleado', key: 'no', width: 12 }, { header: 'Nombre', key: 'nombre', width: 30 }, { header: 'Departamento', key: 'depto', width: 20 }, { header: 'Fecha', key: 'fecha', width: 30 }, { header: 'Tipo Incidencia', key: 'tipo', width: 15 }, { header: 'Detalle', key: 'detalle', width: 50 }, { header: 'Justificación', key: 'justif', width: 30 }];
    detailsSheet.getRow(1).font = { bold: true }; detailsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCC0DA' } };

    summarySheet.columns = [{ header: 'No.', key: 'no', width: 10 }, { header: 'Nombre', key: 'nombre', width: 35 }, { header: 'Departamento', key: 'depto', width: 25 }, { header: 'Retardos', key: 'retardos', width: 12 }, { header: 'Faltas', key: 'faltas', width: 12 }, { header: 'Día de la falta', key: 'diaFalta', width: 40 }];
    summarySheet.getRow(1).font = { bold: true }; summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCC0DA' } };

    for (const empleadoNombre of uniqueEmployees) {
        const empRecords = attendanceRecords.filter(r => r.empleado === empleadoNombre);
        const employeeData = employeeMap.get(normalizeText(empleadoNombre));
        const employeeNumber = employeeData?.no_empleado || employeeData?.employee_number || 'N/A';
        const departamento = empRecords[0]?.departamento || employeeData?.department || ''; 
        const scheduleInfo = getScheduleInfo(employeeData);

        const registro_dias = new Map<string, Date[]>();
        empRecords.forEach(rec => {
            if (rec.entrada) {
                const dateKey = `${rec.entrada.getFullYear()}-${(rec.entrada.getMonth() + 1).toString().padStart(2, '0')}-${rec.entrada.getDate().toString().padStart(2, '0')}`;
                if (!registro_dias.has(dateKey)) registro_dias.set(dateKey, []);
                registro_dias.get(dateKey)!.push(rec.entrada);
            }
        });

        let countFaltas = 0, countRetardos = 0; const diasFalta: string[] = [];
        const current = new Date(globalStart);
        while (current <= globalEnd) {
            const dateKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
            const entries = registro_dias.get(dateKey);
            const perm = employeeData ? permissions.find(p => {
                if (p.employee_id !== employeeData.id) return false;
                const pDate = typeof p.permission_date === 'string' ? p.permission_date.split('T')[0] : new Date(p.permission_date).toISOString().split('T')[0];
                return pDate === dateKey;
            }) : null;
            const matchingObs = globalObservations.filter(o => o.date === dateKey);
            const dayGlobalObs = matchingObs.length > 0 ? matchingObs.map(o => o.text).join(' / ') : null;

            if (entries && entries.length > 0) {
                entries.sort((a, b) => a.getTime() - b.getTime());
                const first = entries[0], m = first.getHours() * 3600 + first.getMinutes() * 60;
                const limit = timeToSeconds(scheduleInfo.entry_time) + (scheduleInfo.tolerance_minutes * 60);
                if (m > limit) {
                    const justification = perm ? `Permiso: ${perm.permission_type}` : (dayGlobalObs || '');
                    if (!justification) {
                        countRetardos++;
                        const diff = m - limit, h = Math.floor(diff / 3600), min = Math.floor((diff % 3600) / 60);
                        detailsSheet.addRow({ no: employeeNumber, nombre: empleadoNombre, depto: departamento, fecha: formatDate(current), tipo: 'RETARDO', detalle: `Entrada: ${first.getHours().toString().padStart(2, '0')}:${first.getMinutes().toString().padStart(2, '0')} - Retraso: ${h > 0 ? h + 'h ' : ''}${min}m`, justif: '' });
                    }
                }
            } else if (current.getDay() !== 0 && current.getDay() !== 6 && !perm && !dayGlobalObs) {
                countFaltas++; diasFalta.push(`${DIAS_SEMANA[current.getDay()].charAt(0).toUpperCase() + DIAS_SEMANA[current.getDay()].slice(1)} ${current.getDate()}`);
                detailsSheet.addRow({ no: employeeNumber, nombre: empleadoNombre, depto: departamento, fecha: formatDate(current), tipo: 'FALTA', detalle: 'No registró asistencia', justif: '' });
            }
            current.setDate(current.getDate() + 1);
        }
        summarySheet.addRow({ no: employeeNumber, nombre: empleadoNombre, depto: departamento, retardos: countRetardos, faltas: countFaltas, diaFalta: diasFalta.join(', ') });
    }
    const today = new Date(), buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `INCIDENCIAS_JASANA_${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}.xlsx`);
}
