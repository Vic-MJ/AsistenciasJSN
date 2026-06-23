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
  const defaults = { entry_time: '09:00', exit_time: '18:00', breakfast_start_time: '10:00', breakfast_end_time: '10:30', lunch_start_time: '14:00', lunch_end_time: '15:00', tolerance_minutes: 15 };
  const config = employeeData ? { ...defaults, entry_time: employeeData.entry_time || defaults.entry_time, exit_time: employeeData.exit_time || defaults.exit_time, breakfast_start_time: employeeData.breakfast_start_time || defaults.breakfast_start_time, breakfast_end_time: employeeData.breakfast_end_time || defaults.breakfast_end_time, lunch_start_time: employeeData.lunch_start_time || defaults.lunch_start_time, lunch_end_time: employeeData.lunch_end_time || defaults.lunch_end_time, tolerance_minutes: employeeData.tolerance_minutes ?? defaults.tolerance_minutes } : defaults;
  return { horario: `DE ${config.entry_time} A ${config.exit_time} HRS`, horaSalidaNormal: config.exit_time, ...config };
};

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

const formatTime = (date: Date | null): string => {
  if (!date) return '';
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatDate = (date: Date): string => `${DIAS_SEMANA[date.getDay()].charAt(0).toUpperCase() + DIAS_SEMANA[date.getDay()].slice(1)}, ${date.getDate()}`;

export async function generateAttendanceReport(
  attendanceRecords: AttendanceRecord[],
  employees: Employee[],
  permissions: Permission[],
  logoDataUrl: string,
  startDateInput: string,
  endDateInput: string,
  globalObservations: GlobalObservation[],
  autoExit = false
) {
  const workbook = new ExcelJS.Workbook();
  const employeeMap = new Map(employees.map(emp => [normalizeText(emp.full_name), emp]));
  const uniqueEmployees = Array.from(new Set(attendanceRecords.map(r => r.empleado))).sort((a, b) => a.localeCompare(b));

  const fecha_inicio = new Date(startDateInput + 'T00:00:00');
  fecha_inicio.setDate(fecha_inicio.getDate() - (fecha_inicio.getDay() - 5 + 7) % 7);

  const fecha_fin = new Date(endDateInput + 'T23:59:59');
  fecha_fin.setDate(fecha_fin.getDate() + (4 - fecha_fin.getDay() + 7) % 7);

  for (let empIndex = 0; empIndex < uniqueEmployees.length; empIndex++) {
    const empleadoNombre = uniqueEmployees[empIndex];
    const empRecords = attendanceRecords.filter(r => r.empleado === empleadoNombre);
    const employeeData = employeeMap.get(normalizeText(empleadoNombre));
    const employeeNumber = employeeData?.no_empleado || employeeData?.employee_number || (empIndex + 1).toString();
    const scheduleInfo = getScheduleInfo(employeeData);

    const registro_dias = new Map<string, { Entrada: Date; Salida: Date }[]>();
    empRecords.forEach(rec => {
      if (rec.entrada) {
        const dateKey = `${rec.entrada.getFullYear()}-${(rec.entrada.getMonth() + 1).toString().padStart(2, '0')}-${rec.entrada.getDate().toString().padStart(2, '0')}`;
        if (!registro_dias.has(dateKey)) registro_dias.set(dateKey, []);
        registro_dias.get(dateKey)!.push({ Entrada: rec.entrada, Salida: rec.salida });
      }
    });

    const worksheet = workbook.addWorksheet(empleadoNombre.substring(0, 31));
    worksheet.columns = [{ width: 13 }, { width: 9.5 }, { width: 9.5 }, { width: 9.5 }, { width: 9.5 }, { width: 9.5 }, { width: 9.5 }, { width: 21 }];

    if (logoDataUrl) {
      const imageId = workbook.addImage({ base64: logoDataUrl, extension: 'png' });
      worksheet.addImage(imageId, { tl: { col: 7, row: 0 }, ext: { width: 120, height: 45 } });
    }

    const headerFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFCCC0DA' } };
    const highlightFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFE699' } };
    const faltaFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFC7CE' } };
    const permisoFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD9E1F2' } };
    const thinBorder = { top: { style: 'thin' as const }, left: { style: 'thin' as const }, bottom: { style: 'thin' as const }, right: { style: 'thin' as const } };

    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1'); titleCell.value = 'REGISTRO DE ENTRADAS Y SALIDAS'; titleCell.font = { bold: true, size: 14 }; titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = 'NO. NÓMINA'; row2.getCell(1).font = { bold: true }; row2.getCell(1).fill = headerFill; row2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row2.getCell(2).value = employeeNumber; row2.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row2.getCell(3).value = 'NOMBRE'; row2.getCell(3).font = { bold: true }; row2.getCell(3).fill = headerFill; row2.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('D2:G2'); row2.getCell(4).value = empleadoNombre; row2.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };

    const row3 = worksheet.getRow(3);
    worksheet.mergeCells('A3:B3'); row3.getCell(1).value = 'DEL'; row3.getCell(1).font = { bold: true }; row3.getCell(1).fill = headerFill; row3.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('C3:D3'); row3.getCell(3).value = fecha_inicio.toLocaleDateString('es-MX'); row3.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('E3:F3'); row3.getCell(5).value = 'AL'; row3.getCell(5).font = { bold: true }; row3.getCell(5).fill = headerFill; row3.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('G3:H3'); row3.getCell(7).value = fecha_fin.toLocaleDateString('es-MX'); row3.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };

    const row4 = worksheet.getRow(4);
    worksheet.mergeCells('A4:D4'); row4.getCell(1).value = 'HORARIO'; row4.getCell(1).font = { bold: true }; row4.getCell(1).fill = headerFill; row4.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('E4:H4'); row4.getCell(5).value = scheduleInfo.horario; row4.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

    const row6 = worksheet.getRow(6), row7 = worksheet.getRow(7);
    row6.values = ['DIA', 'ENTRADA', 'DESAYUNO', '', 'COMIDA', '', 'SALIDA', 'OBSERVACIONES']; worksheet.mergeCells('C6:D6'); worksheet.mergeCells('E6:F6');
    row7.values = ['', '', 'SALIDA', 'ENTRADA', 'SALIDA', 'ENTRADA', '', ''];
    [row6, row7].forEach(row => { for (let col = 1; col <= 8; col++) { const cell = row.getCell(col); cell.font = { bold: true }; cell.fill = headerFill; cell.border = thinBorder; cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; } });

    let retardos = 0, faltas = 0, minutosExtra = 0, minutosRetardo = 0, currentRowIndex = 8;
    const current = new Date(fecha_inicio);
    while (current <= fecha_fin) {
      const dateKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
      const dayRecs = registro_dias.get(dateKey) || [];
      let entrada: Date | null = null, sD: Date | null = null, eD: Date | null = null, sC: Date | null = null, eC: Date | null = null, salida: Date | null = null, observacion = '';

      if (dayRecs.length > 0) {
        const events = dayRecs.flatMap(r => [r.Entrada, r.Salida]).filter(e => e && !isNaN(e.getTime())).sort((a, b) => a.getTime() - b.getTime());
        const unique = []; if (events.length > 0) { unique.push(events[0]); for (let i = 1; i < events.length; i++) if ((events[i].getTime() - events[i - 1].getTime()) / 60000 > 2) unique.push(events[i]); }
        if (current.getDay() === 6 || current.getDay() === 0) { if (unique.length >= 1) entrada = unique[0]; if (unique.length >= 2) salida = unique[unique.length - 1]; }
        else {
          const targets = [timeToMinutes(scheduleInfo.entry_time), timeToMinutes(scheduleInfo.breakfast_start_time), timeToMinutes(scheduleInfo.breakfast_end_time), timeToMinutes(scheduleInfo.lunch_start_time), timeToMinutes(scheduleInfo.lunch_end_time), timeToMinutes(scheduleInfo.horaSalidaNormal)];
          const punchMins = unique.map(e => timeToMinutes(formatTime(e)));
          const dp = Array(punchMins.length + 1).fill(0).map(() => Array(targets.length + 1).fill(Infinity)), parent = Array(punchMins.length + 1).fill(0).map(() => Array(targets.length + 1).fill(-1));
          dp[0][0] = 0;
          for (let i = 0; i <= punchMins.length; i++) {
            for (let j = 0; j <= targets.length; j++) {
              if (dp[i][j] === Infinity) continue;
              if (j < targets.length && dp[i][j + 1] > dp[i][j]) { dp[i][j + 1] = dp[i][j]; parent[i][j + 1] = 0; }
              if (i < punchMins.length && j < targets.length) {
                const diff = Math.abs(punchMins[i] - targets[j]), cost = diff > 240 ? diff * 2 : diff;
                if (dp[i + 1][j + 1] > dp[i][j] + cost) { dp[i + 1][j + 1] = dp[i][j] + cost; parent[i + 1][j + 1] = 1; }
              }
            }
          }
          let cI = punchMins.length, cJ = targets.length; const assign: (number | null)[] = Array(targets.length).fill(null);
          while (cI > 0 || cJ > 0) { if (cI > 0 && cJ > 0 && parent[cI][cJ] === 1) { assign[cJ - 1] = cI - 1; cI--; cJ--; } else if (cJ > 0 && parent[cI][cJ] === 0) cJ--; else if (cI > 0) cI--; else break; }
          if (assign[0] !== null) entrada = unique[assign[0]]; if (assign[1] !== null) sD = unique[assign[1]]; if (assign[2] !== null) eD = unique[assign[2]]; if (assign[3] !== null) sC = unique[assign[3]]; if (assign[4] !== null) eC = unique[assign[4]]; if (assign[5] !== null) salida = unique[assign[5]];
        }
        if (!salida && entrada) {
          if (autoExit) {
            const [h, m] = scheduleInfo.exit_time.split(':').map(Number);
            salida = new Date(current);
            salida.setHours(h, m, 0, 0);
          } else {
            salida = entrada;
          }
        }
        if (entrada) { const m = timeToMinutes(formatTime(entrada)), l = timeToMinutes(scheduleInfo.entry_time) + scheduleInfo.tolerance_minutes; if (m > l) { observacion = 'RETARDO'; retardos++; minutosRetardo += m - l; } }
        if (salida && entrada) { const sM = timeToMinutes(formatTime(salida)), eM = timeToMinutes(formatTime(entrada)); let ex = current.getDay() === 6 || current.getDay() === 0 ? sM - eM : sM - timeToMinutes(scheduleInfo.horaSalidaNormal); if (ex > 0) minutosExtra += ex; }
      }

      const perm = employeeData ? permissions.find(p => {
        if (p.employee_id !== employeeData.id) return false;
        const pDate = typeof p.permission_date === 'string' ? p.permission_date.split('T')[0] : new Date(p.permission_date).toISOString().split('T')[0];
        return pDate === dateKey;
      }) : null;
      const matchingObs = globalObservations.filter(o => o.date === dateKey);

      if (perm) observacion = 'PERMISO';
      else if (matchingObs.length > 0) observacion = matchingObs.map(o => o.text).join(' / ');
      else if (dayRecs.length === 0 && current.getDay() >= 1 && current.getDay() <= 5) { observacion = 'FALTA'; faltas++; }

      const dataRow = worksheet.getRow(currentRowIndex); dataRow.values = [formatDate(current), formatTime(entrada), formatTime(sD), formatTime(eD), formatTime(sC), formatTime(eC), formatTime(salida), observacion];
      for (let col = 1; col <= 8; col++) {
        const c = dataRow.getCell(col);
        c.border = thinBorder;
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        if (observacion === 'PERMISO' && col === 8) c.fill = permisoFill;
        else if (observacion === 'FALTA') c.fill = faltaFill;
        else if (observacion === 'RETARDO' && col === 2) c.fill = highlightFill;
      }
      currentRowIndex++; current.setDate(current.getDate() + 1);
    }
    const resRow = worksheet.getRow(currentRowIndex + 1);
    const sumMinutosRetardo = `${minutosRetardo} min`;
    resRow.values = ['Retardos', retardos, sumMinutosRetardo, 'Faltas', faltas, '', 'Hrs.Extra:', minutosExtra > 60 ? `${Math.floor(minutosExtra / 60)}:${(minutosExtra % 60).toString().padStart(2, '0')}` : '0:00'];
    for (let col = 1; col <= 8; col++) { const c = resRow.getCell(col); c.font = { bold: true }; c.border = thinBorder; c.alignment = { horizontal: 'center', vertical: 'middle' }; }
    const fIdx = currentRowIndex + 6;
    const nRow = worksheet.getRow(fIdx + 1);
    worksheet.mergeCells(`C${fIdx + 1}:F${fIdx + 1}`);
    for (let col = 3; col <= 6; col++) {
      nRow.getCell(col).border = { top: { style: 'medium' } };
    }
    nRow.getCell(3).value = empleadoNombre;
    nRow.getCell(3).font = { bold: true, size: 11 };
    nRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    const dRow = worksheet.getRow(fIdx + 2);
    worksheet.mergeCells(`C${fIdx + 2}:F${fIdx + 2}`);
    dRow.getCell(3).value = employeeData?.department || '';
    dRow.getCell(3).font = { italic: true, size: 10 };
    dRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
  }
  const buffer = await workbook.xlsx.writeBuffer();
  const today = new Date();
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `ASISTENCIAS_JASANA_${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}.xlsx`);
}
