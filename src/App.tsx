import { useState, useEffect } from 'react';
import { Users, ClipboardList, Menu, X, LayoutDashboard, UserCheck, Calendar, Briefcase, LogOut, Cake, Settings, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeManagement from './components/EmployeeManagement';
import PermissionForm from './components/PermissionForm';
import AttendanceProcessor from './components/AttendanceProcessor';
import ScheduleManagement from './components/ScheduleManagement';
import AreaManagement from './components/AreaManagement';
import BirthdayManagement from './components/BirthdayManagement';
import Login from './components/Login';
import ChangePasswordModal from './components/ChangePasswordModal';
import ProfileModal from './components/ProfileModal';
import SettingsManagement from './components/SettingsManagement';
import SendBirthdayEmailModal from './components/employee/SendBirthdayEmailModal';
import { api } from './lib/api';

type Tab = 'dashboard' | 'employees' | 'permissions' | 'reports' | 'schedules' | 'areas' | 'birthdays' | 'settings';

function App() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [stats, setStats] = useState({ employees: 0, areas: 0, schedules: 0, permissions: 0 });
    const [loadingStats, setLoadingStats] = useState(false);
    const [birthdayEmployees, setBirthdayEmployees] = useState<any[]>([]);
    const [selectedEmployeeForEmail, setSelectedEmployeeForEmail] = useState<any | null>(null);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const [emps, areasData, scheds, perms] = await Promise.all([
                api.getEmployees(),
                api.getAreas(),
                api.getSchedules(),
                api.getPermissions()
            ]);
            setStats({
                employees: emps.length,
                areas: areasData.length,
                schedules: scheds.length,
                permissions: perms.length
            });

            // Calculate birthday celebrants of the current month
            const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const birthColabs = emps
                .filter(emp => !!emp.birthday)
                .map(emp => {
                    const cleanBday = emp.birthday.substring(0, 10);
                    const parts = cleanBday.split('-');
                    const bMonth = parts[1];
                    const bDay = Number(parts[2]);

                    let nextBirthday = new Date(Date.UTC(today.getFullYear(), Number(bMonth) - 1, bDay));
                    if (nextBirthday < today) {
                        nextBirthday.setUTCFullYear(today.getFullYear() + 1);
                    }
                    const diffTime = nextBirthday.getTime() - today.getTime();
                    const daysToBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    return {
                        ...emp,
                        birthMonth: bMonth,
                        birthDay: bDay,
                        daysToBirthday
                    };
                })
                .filter(emp => emp.birthMonth === currentMonthStr)
                .sort((a, b) => a.birthDay - b.birthDay);

            setBirthdayEmployees(birthColabs);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, activeTab]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleLogout = () => {
        setUser(null);
        setActiveTab('dashboard');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Tablero', icon: LayoutDashboard, color: 'from-brand-600 to-indigo-700' },
        { id: 'employees', label: 'Empleados', icon: Users, color: 'from-blue-500 to-indigo-600' },
        { id: 'birthdays', label: 'Cumpleaños', icon: Cake, color: 'from-pink-500 to-rose-600' },
        { id: 'areas', label: 'Áreas', icon: Briefcase, color: 'from-cyan-500 to-blue-600', roles: ['master'] },
        { id: 'schedules', label: 'Horarios', icon: Calendar, color: 'from-purple-500 to-indigo-600', roles: ['master'] },
        { id: 'permissions', label: 'Permisos', icon: ClipboardList, color: 'from-amber-500 to-orange-600' },
        { id: 'reports', label: 'Reportes / Odoo', icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
        { id: 'settings', label: 'Ajustes', icon: Settings, color: 'from-slate-600 to-slate-800', roles: ['master', 'admin'] },
    ].filter(item => !item.roles || item.roles.includes(user?.role));    const Dashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Empleados Activos', value: loadingStats ? '...' : stats.employees.toString(), icon: Users, color: 'text-brand-600', bg: 'bg-brand-50', tab: 'employees' },
                    { label: 'Áreas Definidas', value: loadingStats ? '...' : stats.areas.toString(), icon: Briefcase, color: 'text-cyan-600', bg: 'bg-cyan-50', tab: 'areas', roles: ['master'] },
                    { label: 'Plantillas de Horarios', value: loadingStats ? '...' : stats.schedules.toString(), icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', tab: 'schedules', roles: ['master'] },
                    { label: 'Permisos del Mes', value: loadingStats ? '...' : stats.permissions.toString(), icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'permissions' },
                ].filter(stat => !stat.roles || stat.roles.includes(user?.role)).map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4, scale: 1.01 }}
                        onClick={() => setActiveTab(stat.tab as Tab)}
                        className="glass-card-hover p-6 cursor-pointer group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} opacity-20 rounded-bl-3xl group-hover:scale-110 transition-transform duration-300`} />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-3.5 ${stat.bg} ${stat.color} rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 text-white shadow-xl shadow-indigo-950/10 border border-slate-800 group">
                        <div className="absolute -right-6 -bottom-10 p-4 text-white/5 group-hover:scale-105 group-hover:rotate-3 transition-all duration-700 pointer-events-none">
                            <UserCheck size={240} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white via-indigo-100 to-brand-200 bg-clip-text text-transparent">¡Bienvenido al Panel JASANA!</h3>
                            <p className="text-slate-300 font-normal mb-8 max-w-lg leading-relaxed text-sm">
                                Prepara tus reportes de nómina procesando los archivos de Odoo de forma automática. Cruza la información con horarios personalizados y permisos autorizados en segundos.
                            </p>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className="relative overflow-hidden bg-white text-slate-900 hover:bg-slate-50 hover:shadow-xl hover:shadow-white/5 active:scale-[0.98] transition-all duration-200 px-6 py-3 rounded-xl font-semibold shadow-md text-xs uppercase tracking-wider"
                            >
                                Iniciar Procesamiento Odoo
                            </button>
                        </div>
                    </div>

                    {/* Cumpleañeros del Mes Widget */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                                    <Cake size={20} className="text-pink-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Cumpleañeros del Mes</h3>
                                    <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider mt-0.5">
                                        Celebrados en {new Date().toLocaleString('es-MX', { month: 'long' })}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-pink-650 bg-pink-50/50 px-2.5 py-1 rounded-md border border-pink-100/30">
                                {birthdayEmployees.length} {birthdayEmployees.length === 1 ? 'cumple' : 'cumples'}
                            </span>
                        </div>

                        {birthdayEmployees.length === 0 ? (
                            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200/60">
                                <Cake size={24} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">No hay cumpleaños este mes</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {birthdayEmployees.map((emp) => {
                                    const isToday = emp.daysToBirthday === 0 || emp.daysToBirthday === 365;
                                    const isTomorrow = emp.daysToBirthday === 1;

                                    return (
                                        <div 
                                            key={emp.id}
                                            className={`p-4 rounded-xl border flex items-center justify-between hover:shadow-sm transition-all duration-200 bg-white relative overflow-hidden group ${
                                                isToday ? 'border-amber-400 shadow-md shadow-amber-500/5' : 'border-slate-200/75'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Avatar */}
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                                                    isToday 
                                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                                                        : 'bg-brand-500'
                                                }`}>
                                                    {emp.full_name.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-800 truncate uppercase leading-snug tracking-tight">
                                                        {emp.full_name}
                                                    </h4>
                                                    <p className="text-[9px] font-normal text-slate-400 truncate mt-0.5">
                                                        {emp.position || 'Colaborador'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded">
                                                            Día {emp.birthDay}
                                                        </span>
                                                        {isToday ? (
                                                            <span className="text-[8px] font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 px-1.5 py-0.5 rounded shadow-sm animate-pulse uppercase">
                                                                ¡Hoy! 🎂
                                                            </span>
                                                        ) : isTomorrow ? (
                                                            <span className="text-[8px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5 rounded shadow-sm uppercase">
                                                                Mañana 🥳
                                                            </span>
                                                        ) : (
                                                            <span className="text-[8px] font-bold text-slate-450 uppercase">
                                                                En {emp.daysToBirthday} {emp.daysToBirthday === 1 ? 'día' : 'días'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedEmployeeForEmail(emp)}
                                                title={`Enviar felicitación a ${emp.full_name}`}
                                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all border border-transparent shrink-0"
                                            >
                                                <Mail size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-md">
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
                        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            Estado del Sistema
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
                                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Base de Datos</span>
                                <span className="text-emerald-400 font-semibold">Conectado</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
                                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Servidor API</span>
                                <span className="text-emerald-400 font-semibold">Activo</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Seguridad</span>
                                <span className="text-brand-400 font-semibold">Protegido SSL</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2">Tip del Día</p>
                        <p className="text-slate-600 font-normal italic text-xs leading-relaxed">"Recuerda que puedes asignar horarios y áreas a varios empleados al mismo tiempo usando la función de configuración masiva."</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    if (!user) {
        return <Login onLogin={setUser} />;
    }

    if (user.must_change_password) {
        return <ChangePasswordModal user={user} onPasswordChanged={setUser} />;
    }

    return (
        <div className="flex h-screen overflow-hidden font-sans bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside
                className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col z-50 relative
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
        `}
            >
                <div className={`absolute inset-y-4 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-2xl overflow-hidden flex flex-col shadow-sm transition-all duration-300 ${isSidebarOpen ? 'inset-x-4' : 'inset-x-2'}`}>
                    <div className={`flex items-center h-20 transition-all duration-300 ${isSidebarOpen ? 'px-6' : 'px-0 justify-center'}`}>
                        <AnimatePresence mode="wait">
                            {isSidebarOpen ? (
                                <motion.div
                                    key="logo-open"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <img src="/logo_square.png" alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="font-bold tracking-tight text-xl text-slate-800">JASANA</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="logo-closed"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="w-8 h-8 flex items-center justify-center"
                                >
                                    <img src="/logo_square.png" alt="Logo" className="w-full h-full object-contain" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {isSidebarOpen && (
                        <div className="px-6 -mt-3 mb-2 animate-in fade-in duration-300">
                            <p className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase leading-none">
                                &copy; CLERDEVS 2026
                            </p>
                            <p className="text-[8px] font-bold text-brand-500/80 tracking-wider uppercase mt-1 leading-none">
                                v3.05.3
                            </p>
                        </div>
                    )}

                    <motion.nav
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={`flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1 transition-all duration-300 ${isSidebarOpen ? 'px-3' : 'px-1.5'}`}
                    >
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`w-full flex items-center rounded-xl transition-all duration-200 group relative
                                        ${isSidebarOpen ? 'px-4 py-2.5 gap-3 justify-start' : 'p-3 justify-center'}
                                        ${isActive
                                            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/15'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    title={!isSidebarOpen ? item.label : ''}
                                >
                                    <Icon
                                        size={isSidebarOpen ? 18 : 22}
                                        className={`transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                                    />
                                    {isSidebarOpen && (
                                        <span className={`font-semibold tracking-tight text-xs ${isActive ? 'text-white' : ''}`}>
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && isSidebarOpen && (
                                        <motion.div
                                            layoutId="activePill"
                                            className="ml-auto w-1 h-1 rounded-full bg-white"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </motion.nav>

                    <div className="p-3 pb-6 space-y-1.5">
                        <button
                            onClick={handleLogout}
                            className="w-full h-10 bg-rose-50/50 flex items-center justify-center rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all active:scale-95 group"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={16} />
                        </button>

                        <button
                            onClick={toggleSidebar}
                            className="w-full h-10 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95 group"
                        >
                            <motion.div animate={{ rotate: isSidebarOpen ? 0 : 180 }}>
                                {isSidebarOpen ? <X size={16} /> : <Menu size={18} />}
                            </motion.div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden h-full relative">
                <header className="h-20 flex items-center justify-between px-8 z-20">
                    <div className="flex flex-col">
                        <motion.h2
                            key={activeTab}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-extrabold text-slate-900 tracking-tight text-gradient-slate"
                        >
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </motion.h2>
                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mt-0.5">
                            Jasana / {activeTab}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-slate-700 text-xs font-semibold tracking-tight">
                                {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-brand-600 text-[9px] font-semibold uppercase tracking-wider animate-pulse">
                                Sistema En Línea
                            </span>
                        </div>
                        <div
                            onClick={() => {
                                if (user.role === 'master' || user.role === 'admin') {
                                    setIsProfileOpen(true);
                                }
                            }}
                            className="h-10 px-4 rounded-xl bg-slate-900 flex items-center gap-3 text-white font-medium shadow-sm group cursor-pointer transition-all hover:bg-slate-800"
                            title="Editar Perfil"
                        >
                            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold">
                                {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[11px] text-white font-medium tracking-tight">{user.employee_name}</span>
                                <span className="text-[9px] text-brand-400 font-semibold uppercase tracking-wider mt-0.5">{user.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {activeTab === 'dashboard' && <Dashboard />}
                                {activeTab === 'employees' && <EmployeeManagement currentUser={user} />}
                                {activeTab === 'birthdays' && <BirthdayManagement />}
                                {activeTab === 'areas' && <AreaManagement />}
                                {activeTab === 'schedules' && <ScheduleManagement />}
                                {activeTab === 'permissions' && <PermissionForm />}
                                {activeTab === 'reports' && <AttendanceProcessor />}
                                {activeTab === 'settings' && <SettingsManagement currentUser={user} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden bg-[#F8FAFC]" />

            {/* Profile Modal */}
            <AnimatePresence>
                {isProfileOpen && (
                    <ProfileModal
                        key="profile-modal"
                        user={user}
                        onClose={() => setIsProfileOpen(false)}
                        onProfileUpdated={setUser}
                    />
                )}
            </AnimatePresence>
            {/* Send Birthday Email Modal */}
            {selectedEmployeeForEmail && (
                <SendBirthdayEmailModal
                    employee={selectedEmployeeForEmail}
                    onClose={() => setSelectedEmployeeForEmail(null)}
                />
            )}
        </div>
    );
}

export default App;
