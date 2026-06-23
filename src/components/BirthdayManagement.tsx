import { useState, useEffect } from 'react';
import { Cake, Calendar, Mail, Search, RefreshCw, Filter, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { api, Employee } from '../lib/api';
import { toast } from 'sonner';
import SendBirthdayEmailModal from './employee/SendBirthdayEmailModal';
import PrintMuralModal from './PrintMuralModal';

interface BirthdayInfo {
  nextBirthday: Date;
  age: number;
  daysToBirthday: number;
  zodiacSign: string;
}


export default function BirthdayManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('todos');
  const [selectedEmployeeForEmail, setSelectedEmployeeForEmail] = useState<Employee | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBirthdays = async () => {
    setSyncing(true);
    const toastId = toast.loading('Sincronizando cumpleaños con Odoo...');
    try {
      const res = await api.syncBirthdays();
      toast.success(res.message, { id: toastId });
      await loadEmployees();
    } catch (error: any) {
      console.error('Error syncing birthdays:', error);
      toast.error(error.message || 'Error al sincronizar con Odoo', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const toggleMonthCollapse = (monthValue: string) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [monthValue]: prev[monthValue] === false ? true : false
    }));
  };

  const getBirthdayInfo = (birthdayStr: string | null | undefined, zodiacSignFromOdoo?: string | null): BirthdayInfo | null => {
    if (!birthdayStr) return null;
    
    const cleanBirthdayStr = birthdayStr.substring(0, 10);
    const parts = cleanBirthdayStr.split('-');
    if (parts.length < 3) return null;
    
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    
    const birthDate = new Date(Date.UTC(year, month - 1, day));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextBirthday = new Date(Date.UTC(today.getFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate()));
    
    if (nextBirthday < today) {
      nextBirthday.setUTCFullYear(today.getFullYear() + 1);
    }

    const age = nextBirthday.getUTCFullYear() - birthDate.getUTCFullYear();

    const diffTime = nextBirthday.getTime() - today.getTime();
    const daysToBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let zodiacSign = zodiacSignFromOdoo || '';
    if (!zodiacSign) {
      const d = birthDate.getUTCDate();
      const m = birthDate.getUTCMonth() + 1;

      if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) zodiacSign = '♈ Aries';
      else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) zodiacSign = '♉ Tauro';
      else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) zodiacSign = '♊ Géminis';
      else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) zodiacSign = '♋ Cáncer';
      else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) zodiacSign = '♌ Leo';
      else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) zodiacSign = '♍ Virgo';
      else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) zodiacSign = '♎ Libra';
      else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) zodiacSign = '♏ Escorpio';
      else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) zodiacSign = '♐ Sagitario';
      else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) zodiacSign = '♑ Capricornio';
      else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) zodiacSign = '♒ Acuario';
      else zodiacSign = '♓ Piscis';
    }

    return { nextBirthday, age, daysToBirthday, zodiacSign };
  };

  const getAvatarStyle = (name: string) => {
    const colors = [
      'bg-[#45a29e] text-white', 
      'bg-emerald-500 text-white', 
      'bg-indigo-600 text-white', 
      'bg-pink-500 text-white', 
      'bg-purple-500 text-white', 
      'bg-rose-500 text-white', 
      'bg-cyan-500 text-white', 
      'bg-amber-600 text-white', 
      'bg-violet-600 text-white', 
      'bg-blue-500 text-white', 
      'bg-orange-500 text-white', 
      'bg-lime-600 text-white', 
      'bg-[#8c6b4f] text-white', 
      'bg-[#b58900] text-white', 
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const monthsList = [
    { value: '01', name: 'Enero' },
    { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' },
    { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' },
    { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' },
    { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' },
    { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' },
    { value: '12', name: 'Diciembre' },
  ];

  const getDaysLeftBadge = (days: number) => {
    if (days === 0 || days === 365) {
      return (
        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-semibold px-2.5 py-1 rounded-md shadow-sm animate-pulse uppercase shrink-0">
          ¡Hoy! 🎂
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-semibold px-2.5 py-1 rounded-md shadow-sm uppercase shrink-0">
          ¡Mañana! 🥳
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="bg-amber-50 text-amber-700 text-[9px] font-semibold px-2.5 py-1 rounded-md shrink-0 uppercase border border-amber-200/30">
          En {days} días 🔥
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-semibold px-2.5 py-1 rounded-md shrink-0 uppercase border border-indigo-100/30">
          En {days} días ✨
        </span>
      );
    }
    return (
      <span className="bg-slate-50 text-slate-500 text-[9px] font-semibold px-2.5 py-1 rounded-md shrink-0 uppercase border border-slate-200/50">
        En {days} días
      </span>
    );
  };

  const processedEmployees = employees
    .filter(emp => !!emp.birthday)
    .map(emp => {
      const cleanBday = emp.birthday ? emp.birthday.substring(0, 10) : '';
      const info = getBirthdayInfo(cleanBday, emp.zodiac_sign);
      const birthMonth = cleanBday ? cleanBday.split('-')[1] : '';
      return {
        ...emp,
        birthday: cleanBday,
        birthdayInfo: info,
        birthMonth
      };
    })
    .filter(emp => {
      const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (emp.position || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMonth = selectedMonth === 'todos' || emp.birthMonth === selectedMonth;
      return matchesSearch && matchesMonth && emp.birthdayInfo !== null;
    });

  // Group employees by month for the board columns
  const groupedByMonth = monthsList.reduce((acc, month) => {
    const list = processedEmployees.filter(emp => emp.birthMonth === month.value);
    
    // Sort chronologically inside each month
    list.sort((a, b) => {
      const dayA = a.birthday ? Number(a.birthday.split('-')[2]) : 0;
      const dayB = b.birthday ? Number(b.birthday.split('-')[2]) : 0;
      return dayA - dayB;
    });
    
    if (list.length > 0 || selectedMonth !== 'todos') {
      acc.push({
        ...month,
        employees: list
      });
    }
    return acc;
  }, [] as any[]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header and Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-1 text-pretty">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Calendario de Cumpleaños
          </h2>
          <p className="text-slate-500 font-normal text-sm">
            Sincroniza y visualiza los aniversarios del personal y felicítalos en su día.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre o puesto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Month selector */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
            >
              <option value="todos">Todos los meses</option>
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Print Mural Button */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all text-xs font-semibold"
          >
            <Printer size={16} />
            <span>Imprimir Mural</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={handleSyncBirthdays}
            disabled={syncing}
            className="flex items-center gap-2 btn-premium px-4 py-2.5 rounded-xl shadow-sm active:scale-95 disabled:opacity-75 text-xs"
          >
            {syncing ? <RefreshCw className="animate-spin" size={16} /> : <Cake size={16} />}
            <span className="font-semibold">Sincronizar Odoo</span>
          </button>

        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <RefreshCw className="animate-spin text-brand-600" size={32} />
          <p className="text-slate-500 font-semibold text-sm">Cargando directorio de cumpleaños...</p>
        </div>
      ) : processedEmployees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-500">
            <Cake size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No se encontraron cumpleaños</h3>
          <p className="text-slate-500 font-normal text-sm leading-relaxed">
            No hay empleados con fecha de nacimiento cargada en este filtro. Intenta pulsar el botón de <strong>Sincronizar Odoo</strong> para importar los datos de cumpleaños desde tu instancia de Odoo de forma automática.
          </p>
        </div>
      ) : (
        /* Horizontal Board Scroll Layout */
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin custom-scrollbar min-h-[500px] items-stretch">
          {groupedByMonth.map((group: any) => {
            const isCollapsed = collapsedMonths[group.value] !== false;

            /* Collapsed Month Column State */
            if (isCollapsed) {
              return (
                <div 
                  key={group.value}
                  onClick={() => toggleMonthCollapse(group.value)}
                  className="w-14 min-w-[56px] shrink-0 bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 snap-start group select-none"
                >
                  <div className="flex flex-col items-center gap-3 w-full">
                    <span className="text-[10px] font-semibold text-pink-600 bg-pink-50/50 px-1.5 py-0.5 rounded-md">
                      {group.employees.length}
                    </span>
                    <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase py-4 [writing-mode:vertical-lr] rotate-180">
                      {group.name}
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-slate-500 transition-colors p-1 hover:bg-white rounded-full">
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            }

            /* Expanded Month Column State */
            return (
              <div 
                key={group.value} 
                className="w-72 min-w-[288px] shrink-0 flex flex-col snap-start"
              >
                {/* Column Header */}
                <div className="glass-card px-4 py-2.5 flex items-center justify-between border border-slate-200/60 bg-white/40 shadow-sm rounded-xl select-none mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{group.name}</span>
                    <span className="text-[10px] font-semibold text-pink-600 bg-pink-50/50 px-2 py-0.5 rounded-md border border-pink-100/30">
                      {group.employees.length} {group.employees.length === 1 ? 'cumple' : 'cumples'}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleMonthCollapse(group.value)}
                    title="Colapsar mes"
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>

                {/* Column Cards Container (Vertical Scroll within Column) */}
                <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1 pb-3 max-h-[460px]">
                  {group.employees.map((emp: any) => {
                    const parts = emp.birthday.split('-');
                    const day = parts[2];
                    const month = parts[1];
                    const year = parts[0];
                    const formattedBirthday = `${day}/${month}/${year}`;

                    return (
                      <div 
                        key={emp.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:translate-y-[-1px] transition-all duration-200 flex flex-col group relative overflow-hidden"
                      >
                        
                        {/* Avatar & Basic Info */}
                        <div className="flex gap-3 items-start">
                          
                          {/* Avatar */}
                          <div className={`w-10 h-10 ${getAvatarStyle(emp.full_name)} rounded-xl flex items-center justify-center font-bold text-lg shadow-inner shrink-0`}>
                            {emp.full_name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-bold text-slate-800 leading-snug tracking-tight truncate group-hover:text-brand-600 transition-colors uppercase">
                              {emp.full_name}
                            </h4>
                            <p className="text-[10px] font-normal text-slate-450 mt-0.5 truncate">
                              {emp.position || 'Sin puesto definido'}
                            </p>

                            {/* Birthdate & Zodiac */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-slate-500 font-medium text-[10px]">
                              <span className="flex items-center gap-1 shrink-0 bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-200/60">
                                <Calendar size={10} className="text-slate-400" />
                                {formattedBirthday}
                              </span>
                              
                              {emp.birthdayInfo?.zodiacSign && (
                                <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md font-semibold shrink-0 border border-orange-100/30">
                                  {emp.birthdayInfo.zodiacSign}
                                </span>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Footer: Age badge & Prominent Countdown Badge */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                          
                          <div className="flex items-center gap-1.5">
                            <span className="bg-teal-600 text-white text-[9px] font-semibold px-2.5 py-0.5 rounded-md">
                              {emp.birthdayInfo?.age} años
                            </span>
                            
                            <button
                              onClick={() => setSelectedEmployeeForEmail(emp)}
                              title={`Enviar correo de felicitación a ${emp.private_email || emp.work_email || 'empleado'}`}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            >
                              <Mail size={13} />
                            </button>
                          </div>

                          {/* Countdown badge */}
                          {emp.birthdayInfo && getDaysLeftBadge(emp.birthdayInfo.daysToBirthday)}

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render send email modal when an employee is selected */}
      {selectedEmployeeForEmail && (
        <SendBirthdayEmailModal
          employee={selectedEmployeeForEmail}
          onClose={() => setSelectedEmployeeForEmail(null)}
        />
      )}

      {/* Render printable mural modal */}
      {isPrintModalOpen && (
        <PrintMuralModal
          employees={employees}
          initialMonth={selectedMonth}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

    </div>
  );
}
