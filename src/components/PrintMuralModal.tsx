import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Cake, Calendar, Sparkles, Palette, Check, Gift, Crown, Info } from 'lucide-react';
import { Employee } from '../lib/api';

interface PrintMuralModalProps {
  employees: Employee[];
  initialMonth: string;
  onClose: () => void;
}

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

type ColorTheme = 'violet' | 'pink' | 'teal' | 'emerald';

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  lightBg: string;
  border: string;
  badge: string;
}

const themeConfigs: Record<ColorTheme, ThemeConfig> = {
  violet: {
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#6d28d9',
    gradient: 'from-brand-600 via-brand-500 to-indigo-600',
    lightBg: 'bg-brand-50/50',
    border: 'border-brand-100',
    badge: 'bg-brand-50 text-brand-700 border-brand-200/50',
  },
  pink: {
    primary: '#db2777',
    secondary: '#ec4899',
    accent: '#be185d',
    gradient: 'from-pink-600 via-pink-500 to-rose-500',
    lightBg: 'bg-pink-50/30',
    border: 'border-pink-100',
    badge: 'bg-pink-50 text-pink-700 border-pink-200/30',
  },
  teal: {
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#0f766e',
    gradient: 'from-teal-600 via-teal-500 to-cyan-600',
    lightBg: 'bg-teal-50/30',
    border: 'border-teal-100',
    badge: 'bg-teal-50 text-teal-700 border-teal-200/30',
  },
  emerald: {
    primary: '#059669',
    secondary: '#10b981',
    accent: '#047857',
    gradient: 'from-emerald-600 via-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50/30',
    border: 'border-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/30',
  },
};

// SVG Guirnalda / Bunting Flags
const BuntingFlags = ({ themeColor }: { themeColor: string }) => (
  <svg 
    className="absolute top-5 left-8 right-8 w-[calc(100%-4rem)] h-12 pointer-events-none overflow-visible z-20 opacity-90" 
    viewBox="0 0 600 40" 
    preserveAspectRatio="none"
  >
    {/* Bunting cord line */}
    <path d="M 0 6 Q 150 22 300 14 Q 450 6 600 10" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3 3" />
    
    {/* Bunting flags along the cord */}
    <polygon points="25,9 50,9 37.5,32" fill={`${themeColor}`} />
    <polygon points="70,11 95,12 82.5,35" fill="#f43f5e" />
    <polygon points="115,13 140,15 127.5,37" fill="#06b6d4" />
    <polygon points="160,15 185,16 172.5,38" fill="#eab308" />
    <polygon points="205,16 230,16 217.5,38" fill={`${themeColor}dd`} />
    <polygon points="250,16 275,15 262.5,37" fill="#ec4899" />
    <polygon points="295,14 320,13 307.5,35" fill="#06b6d4" />
    <polygon points="340,13 365,11 352.5,33" fill="#eab308" />
    <polygon points="385,11 410,10 397.5,32" fill={`${themeColor}`} />
    <polygon points="430,9 455,8 442.5,30" fill="#f43f5e" />
    <polygon points="475,8 500,7 487.5,29" fill="#ec4899" />
    <polygon points="520,8 545,8 532.5,30" fill="#06b6d4" />
    <polygon points="565,9 590,10 577.5,32" fill="#eab308" />
  </svg>
);

// SVG Balloons background
const FloatingBalloons = ({ themeColor }: { themeColor: string }) => (
  <>
    {/* Left Cluster */}
    <div className="absolute top-[12%] left-10 pointer-events-none opacity-20 z-0 transform -rotate-12 select-none no-print-item">
      <svg width="70" height="110" viewBox="0 0 70 110">
        <ellipse cx="25" cy="35" rx="16" ry="21" fill={themeColor} />
        <polygon points="25,56 22,60 28,60" fill={themeColor} />
        <path d="M 25 60 Q 20 78 30 95" fill="none" stroke="#64748b" strokeWidth="1" />
        
        <ellipse cx="40" cy="45" rx="15" ry="20" fill="#f43f5e" />
        <polygon points="40,65 37,69 43,69" fill="#f43f5e" />
        <path d="M 40 69 Q 43 85 35 102" fill="none" stroke="#64748b" strokeWidth="1" />
      </svg>
    </div>

    {/* Right Cluster */}
    <div className="absolute top-[12%] right-10 pointer-events-none opacity-20 z-0 transform rotate-12 select-none no-print-item">
      <svg width="70" height="110" viewBox="0 0 70 110">
        <ellipse cx="45" cy="35" rx="16" ry="21" fill={themeColor} />
        <polygon points="45,56 42,60 48,60" fill={themeColor} />
        <path d="M 45 60 Q 48 78 38 95" fill="none" stroke="#64748b" strokeWidth="1" />
        
        <ellipse cx="30" cy="45" rx="15" ry="20" fill="#06b6d4" />
        <polygon points="30,65 27,69 33,69" fill="#06b6d4" />
        <path d="M 30 69 Q 27 85 35 102" fill="none" stroke="#64748b" strokeWidth="1" />
      </svg>
    </div>
  </>
);

// Confetti background scatter for high premium look without clashing
const ConfettiBackground = ({ themeColor }: { themeColor: string }) => (
  <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.07] select-none">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Scattered particles */}
      <circle cx="10%" cy="18%" r="3" fill={themeColor} />
      <circle cx="90%" cy="15%" r="4" fill="#f43f5e" />
      <circle cx="86%" cy="28%" r="3" fill="#06b6d4" />
      <circle cx="14%" cy="32%" r="3.5" fill="#eab308" />
      <circle cx="7%" cy="56%" r="4" fill="#ec4899" />
      <circle cx="93%" cy="62%" r="3" fill={themeColor} />
      <circle cx="12%" cy="76%" r="3.5" fill="#06b6d4" />
      <circle cx="88%" cy="82%" r="4" fill="#eab308" />
      
      {/* Delicate Sparkle Stars */}
      <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" transform="translate(100, 160) scale(0.6)" fill={themeColor} />
      <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" transform="translate(540, 220) scale(0.5)" fill="#f43f5e" />
      <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" transform="translate(60, 480) scale(0.5)" fill="#06b6d4" />
      <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" transform="translate(580, 460) scale(0.6)" fill="#eab308" />
    </svg>
  </div>
);

// SVG Hanging Stars and Sparkles in top corners
const HangingCornerDecor = ({ themeColor }: { themeColor: string }) => (
  <>
    {/* Top Left corner decoration */}
    <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-10 opacity-85 select-none">
      <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-10 10 Q 30 15 50 50 Q 60 70 40 100" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeDasharray="2 2" />
        <line x1="40" y1="0" x2="40" y2="45" stroke="#cbd5e1" strokeWidth="1.2" />
        <path d="M 40 45 L 43 51 L 50 52 L 45 57 L 46 64 L 40 60 L 34 64 L 35 57 L 30 52 L 37 51 Z" fill={themeColor} />
        <line x1="75" y1="0" x2="75" y2="30" stroke="#cbd5e1" strokeWidth="1.2" />
        <path d="M 75 30 L 77 34 L 82 35 L 78 39 L 79 44 L 75 41 L 71 44 L 72 39 L 68 35 L 73 34 Z" fill="#eab308" />
        <line x1="15" y1="0" x2="15" y2="60" stroke="#cbd5e1" strokeWidth="1.2" />
        <ellipse cx="15" cy="65" rx="5" ry="7" fill="#f43f5e" />
        <path d="M 15 72 L 14 74 L 16 74 Z" fill="#f43f5e" />
        <circle cx="28" cy="24" r="2" fill="#38bdf8" />
        <circle cx="95" cy="20" r="2.5" fill="#f43f5e" />
        <circle cx="58" cy="80" r="1.5" fill="#eab308" />
      </svg>
    </div>

    {/* Top Right corner decoration */}
    <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-10 opacity-85 select-none transform scale-x-[-1]">
      <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-10 10 Q 30 15 50 50 Q 60 70 40 100" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeDasharray="2 2" />
        <line x1="40" y1="0" x2="40" y2="45" stroke="#cbd5e1" strokeWidth="1.2" />
        <path d="M 40 45 L 43 51 L 50 52 L 45 57 L 46 64 L 40 60 L 34 64 L 35 57 L 30 52 L 37 51 Z" fill={themeColor} />
        <line x1="75" y1="0" x2="75" y2="30" stroke="#cbd5e1" strokeWidth="1.2" />
        <path d="M 75 30 L 77 34 L 82 35 L 78 39 L 79 44 L 75 41 L 71 44 L 72 39 L 68 35 L 73 34 Z" fill="#ec4899" />
        <line x1="15" y1="0" x2="15" y2="60" stroke="#cbd5e1" strokeWidth="1.2" />
        <ellipse cx="15" cy="65" rx="5" ry="7" fill="#06b6d4" />
        <path d="M 15 72 L 14 74 L 16 74 Z" fill="#06b6d4" />
        <circle cx="28" cy="24" r="2" fill="#38bdf8" />
        <circle cx="95" cy="20" r="2.5" fill="#f43f5e" />
        <circle cx="58" cy="80" r="1.5" fill="#eab308" />
      </svg>
    </div>
  </>
);

// Festive bottom decorations (birthday cake on left, gift box on right)
const FestiveCornerIcons = ({ themeColor }: { themeColor: string }) => (
  <>
    {/* Bottom Left: Cute Birthday Cake */}
    <div className="absolute bottom-6 left-6 pointer-events-none opacity-80 z-10 w-16 h-16 select-none flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 6 42 L 42 42 Q 44 42 44 43 Q 44 44 42 44 L 6 44 Q 4 44 4 43 Q 4 42 6 42 Z" fill="#94a3b8" />
        <rect x="8" y="24" width="32" height="18" rx="2" fill={themeColor} />
        <path d="M 8 24 Q 12 28 16 24 Q 20 28 24 24 Q 28 28 32 24 Q 36 28 40 24 L 40 28 L 8 28 Z" fill="#ffffff" opacity="0.6" />
        <circle cx="16" cy="33" r="2" fill="#ffffff" opacity="0.8" />
        <circle cx="32" cy="33" r="2" fill="#ffffff" opacity="0.8" />
        <rect x="18" y="14" width="3" height="10" fill="#cbd5e1" />
        <rect x="27" y="14" width="3" height="10" fill="#cbd5e1" />
        <path d="M 19.5 7 C 20.5 10 20.5 13 19.5 14 C 18.5 13 18.5 10 19.5 7 Z" fill="#f59e0b" />
        <path d="M 28.5 7 C 29.5 10 29.5 13 28.5 14 C 27.5 13 27.5 10 28.5 7 Z" fill="#f59e0b" />
      </svg>
    </div>

    {/* Bottom Right: Cute Gift Box */}
    <div className="absolute bottom-6 right-6 pointer-events-none opacity-80 z-10 w-16 h-16 select-none flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="20" width="28" height="22" rx="2" fill="#ec4899" />
        <rect x="7" y="15" width="34" height="6" rx="1.5" fill="#f43f5e" />
        <rect x="22" y="15" width="4" height="27" fill="#eab308" />
        <rect x="7" y="28" width="34" height="4" fill="#eab308" />
        <path d="M 24 15 Q 16 7 21 11 Z" fill="#eab308" />
        <path d="M 24 15 Q 32 7 27 11 Z" fill="#eab308" />
      </svg>
    </div>
  </>
);

// Elegant double line border/frame for certificate/mural finish
const FestiveBorderRibbon = ({ themeColor }: { themeColor: string }) => (
  <div 
    className="absolute inset-4 pointer-events-none z-10 border-2 border-dashed rounded-[1rem] opacity-80"
    style={{ borderColor: themeColor + '30' }}
  >
    <div 
      className="absolute inset-1 border rounded-[0.85rem] opacity-50"
      style={{ borderColor: themeColor + '15' }}
    />
    
    {/* Corner ornaments using Tailwind absolute positioning */}
    <div className="absolute -top-2.5 -left-2.5 w-5 h-5 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" fill={themeColor}>
        <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" />
      </svg>
    </div>
    <div className="absolute -top-2.5 -right-2.5 w-5 h-5 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" fill={themeColor}>
        <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" />
      </svg>
    </div>
    <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" fill={themeColor}>
        <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" />
      </svg>
    </div>
    <div className="absolute -bottom-2.5 -right-2.5 w-5 h-5 flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20" fill={themeColor}>
        <path d="M 10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" />
      </svg>
    </div>
  </div>
);

// SVG Hanging Streamers/Serpentinas for side borders
const HangingStreamers = ({ themeColor }: { themeColor: string }) => (
  <>
    {/* Left Streamer */}
    <div className="absolute top-10 left-3.5 bottom-10 w-4 pointer-events-none z-10 opacity-[0.15] select-none no-print-item">
      <svg className="w-full h-full" viewBox="0 0 16 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 8 0 C 0 20 16 40 8 60 C 0 80 16 100 8 120 C 0 140 16 160 8 180 C 0 200 16 220 8 240 C 0 260 16 280 8 300 C 0 320 16 340 8 360 C 0 380 16 400 8 420" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="60" r="3" fill="#f43f5e" />
        <circle cx="8" cy="180" r="3" fill="#eab308" />
        <circle cx="8" cy="300" r="3" fill="#06b6d4" />
      </svg>
    </div>
    {/* Right Streamer */}
    <div className="absolute top-10 right-3.5 bottom-10 w-4 pointer-events-none z-10 opacity-[0.15] select-none no-print-item transform scale-x-[-1]">
      <svg className="w-full h-full" viewBox="0 0 16 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 8 0 C 0 20 16 40 8 60 C 0 80 16 100 8 120 C 0 140 16 160 8 180 C 0 200 16 220 8 240 C 0 260 16 280 8 300 C 0 320 16 340 8 360 C 0 380 16 400 8 420" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="120" r="3" fill="#f43f5e" />
        <circle cx="8" cy="240" r="3" fill="#eab308" />
        <circle cx="8" cy="360" r="3" fill="#06b6d4" />
      </svg>
    </div>
  </>
);

export default function PrintMuralModal({ employees, initialMonth, onClose }: PrintMuralModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialMonth === 'todos' 
      ? String(new Date().getMonth() + 1).padStart(2, '0') 
      : initialMonth
  );
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>('violet');
  const [showZodiac, setShowZodiac] = useState<boolean>(true);
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [showBunting, setShowBunting] = useState<boolean>(true);
  const [showBalloons, setShowBalloons] = useState<boolean>(true);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [showCornerDecor, setShowCornerDecor] = useState<boolean>(true);
  const [showCornerIcons, setShowCornerIcons] = useState<boolean>(true);
  const [showBorderFrame, setShowBorderFrame] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(true);
  const [showRibbonHeader, setShowRibbonHeader] = useState<boolean>(true);
  const [showCardHighlights, setShowCardHighlights] = useState<boolean>(true);
  const [showStreamers, setShowStreamers] = useState<boolean>(true);
  const [headlineText, setHeadlineText] = useState<string>('Celebrando la vida de nuestro gran equipo');

  const monthName = monthsList.find(m => m.value === selectedMonth)?.name || '';

  const getBirthdayInfo = (birthdayStr: string | null | undefined, zodiacSignFromOdoo?: string | null) => {
    if (!birthdayStr) return null;
    
    const cleanBirthdayStr = birthdayStr.substring(0, 10);
    const parts = cleanBirthdayStr.split('-');
    if (parts.length < 3) return null;
    
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    const birthDate = new Date(Date.UTC(year, month - 1, day));

    let zodiacSign = zodiacSignFromOdoo || '';
    if (!zodiacSign) {
      const d = birthDate.getUTCDate();
      const m = birthDate.getUTCMonth() + 1;

      if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) zodiacSign = 'Aries';
      else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) zodiacSign = 'Tauro';
      else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) zodiacSign = 'Géminis';
      else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) zodiacSign = 'Cáncer';
      else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) zodiacSign = 'Leo';
      else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) zodiacSign = 'Virgo';
      else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) zodiacSign = 'Libra';
      else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) zodiacSign = 'Escorpio';
      else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) zodiacSign = 'Sagitario';
      else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) zodiacSign = 'Capricornio';
      else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) zodiacSign = 'Acuario';
      else zodiacSign = 'Piscis';
    }

    return { day, zodiacSign };
  };

  const filteredEmployees = employees
    .filter(emp => {
      if (!emp.birthday) return false;
      const cleanBday = emp.birthday.substring(0, 10);
      const birthMonth = cleanBday.split('-')[1];
      return birthMonth === selectedMonth;
    })
    .map(emp => {
      const info = getBirthdayInfo(emp.birthday, emp.zodiac_sign);
      return {
        ...emp,
        day: info?.day || 0,
        zodiacSign: info?.zodiacSign || ''
      };
    })
    .sort((a, b) => a.day - b.day);

  // Check if birthday is today
  const isBirthdayToday = (dayNum: number): boolean => {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    return dayNum === todayDay && selectedMonth === todayMonth;
  };

  // Get unique zodiac signs present in this month's birthdays list
  const getZodiacSignsSummary = () => {
    const signs = filteredEmployees
      .map(emp => {
        if (!emp.zodiacSign) return '';
        const name = emp.zodiacSign.replace(/[^\w]/g, '').trim().toLowerCase();
        let emoji = '✨';
        if (name.includes('aries')) emoji = '♈';
        else if (name.includes('tauro')) emoji = '♉';
        else if (name.includes('geminis') || name.includes('géminis')) emoji = '♊';
        else if (name.includes('cancer') || name.includes('cáncer')) emoji = '♋';
        else if (name.includes('leo')) emoji = '♌';
        else if (name.includes('virgo')) emoji = '♍';
        else if (name.includes('libra')) emoji = '♎';
        else if (name.includes('escorpio') || name.includes('escorpion')) emoji = '♏';
        else if (name.includes('sagitario')) emoji = '♐';
        else if (name.includes('capricornio')) emoji = '♑';
        else if (name.includes('acuario')) emoji = '♒';
        else if (name.includes('piscis')) emoji = '♓';
        
        return `${emoji} ${emp.zodiacSign}`;
      })
      .filter(Boolean);
    const uniqueSigns = Array.from(new Set(signs));
    return uniqueSigns.slice(0, 3).join(', '); 
  };

  const getLayoutConfig = (count: number) => {
    if (count <= 3) {
      return {
        gridClass: 'grid-cols-1 max-w-xl mx-auto w-full gap-6',
        cardClass: 'p-6 gap-5 rounded-[1.5rem] border-2 shadow-sm',
        dayClass: 'w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 shadow-sm',
        dayLabelClass: 'text-[9px] tracking-wider mb-0.5 uppercase opacity-85',
        dayNumClass: 'text-2xl font-bold leading-none',
        nameClass: 'text-[17px] font-bold tracking-tight text-slate-800 leading-snug uppercase',
        posClass: 'text-[11px] font-medium text-slate-400 uppercase tracking-wide truncate mt-1',
        deptClass: 'text-[11px] font-semibold uppercase tracking-wider mt-1 truncate',
        zodiacClass: 'absolute -bottom-2 -right-2 text-[32px] select-none pointer-events-none transform rotate-12 opacity-15 scale-125',
        todayBadgeClass: 'absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[8px] font-semibold px-3 py-1 rounded-bl-lg uppercase tracking-wider shadow-sm z-10'
      };
    } else if (count <= 6) {
      return {
        gridClass: 'grid-cols-2 gap-5 max-w-2xl mx-auto w-full',
        cardClass: 'p-4.5 gap-4 rounded-2xl border-[1.5px]',
        dayClass: 'w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 shadow-sm',
        dayLabelClass: 'text-[8px] tracking-wide uppercase opacity-85',
        dayNumClass: 'text-xl font-bold leading-none',
        nameClass: 'text-[14px] font-bold tracking-tight text-slate-800 leading-snug uppercase',
        posClass: 'text-[9.5px] font-medium text-slate-400 uppercase tracking-wide truncate mt-0.5',
        deptClass: 'text-[9.5px] font-semibold uppercase tracking-wider mt-0.5 truncate',
        zodiacClass: 'absolute -bottom-1 -right-1 text-[26px] select-none pointer-events-none transform rotate-12 opacity-12 scale-115',
        todayBadgeClass: 'absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[7.5px] font-semibold px-2.5 py-0.5 rounded-bl-md uppercase tracking-wider shadow-sm z-10'
      };
    } else if (count <= 9) {
      return {
        gridClass: 'grid-cols-2 gap-3.5 w-full',
        cardClass: 'p-3.5 gap-3 rounded-2xl border shadow-sm',
        dayClass: 'w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 shadow-sm',
        dayLabelClass: 'text-[8px] uppercase opacity-85',
        dayNumClass: 'text-base font-bold leading-none',
        nameClass: 'text-[12.5px] font-bold tracking-tight text-slate-800 leading-snug uppercase',
        posClass: 'text-[8.5px] font-medium text-slate-400 uppercase tracking-wide truncate mt-0.5',
        deptClass: 'text-[8.5px] font-semibold uppercase tracking-wider mt-0.5 truncate',
        zodiacClass: 'absolute -bottom-1 -right-1 text-[22px] select-none pointer-events-none transform rotate-12 opacity-10 scale-100',
        todayBadgeClass: 'absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[7px] font-semibold px-2 py-0.5 rounded-bl-md uppercase tracking-wider shadow-sm z-10'
      };
    } else {
      // 10 or more - very compact 3 column grid to avoid overflow on A4
      return {
        gridClass: 'grid-cols-3 gap-3 w-full',
        cardClass: 'p-3 gap-2.5 rounded-xl border',
        dayClass: 'w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 shadow-sm',
        dayLabelClass: 'text-[7px] uppercase opacity-85',
        dayNumClass: 'text-sm font-bold leading-none',
        nameClass: 'text-[11px] font-bold tracking-tight text-slate-800 leading-snug uppercase truncate',
        posClass: 'text-[8px] font-medium text-slate-400 uppercase tracking-wide truncate mt-0.5',
        deptClass: 'text-[8px] font-semibold uppercase tracking-wider mt-0.5 truncate',
        zodiacClass: 'absolute -bottom-1 -right-1 text-[18px] select-none pointer-events-none transform rotate-12 opacity-8 scale-90',
        todayBadgeClass: 'absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[6.5px] font-semibold px-2 py-0.5 rounded-bl-md uppercase tracking-wider shadow-sm z-10'
      };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeTheme = themeConfigs[selectedTheme];
  const layout = getLayoutConfig(filteredEmployees.length);

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 md:p-8 overflow-y-auto no-print-overlay">
      
      {/* Dynamic style for print layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          margin: 0;
          size: portrait;
        }

        @media print {
          /* Hide everything in the body except our portal container */
          body > *:not(.no-print-overlay) {
            display: none !important;
          }
          
          /* Override portal container overlay styles for print */
          .no-print-overlay {
            position: static !important;
            display: block !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            width: auto !important;
            height: auto !important;
          }

          /* Override Main Window container styles for print */
          .print-mural-container {
            position: static !important;
            display: block !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            max-height: none !important;
            width: auto !important;
            height: auto !important;
          }

          /* Override Preview Pane styles for print */
          .print-mural-preview-pane {
            position: static !important;
            display: block !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            width: auto !important;
            height: auto !important;
          }

          /* Override Paper Container styles for print */
          .print-mural-paper-container {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
            width: auto !important;
            height: auto !important;
          }
          
          .no-print {
            display: none !important;
          }

          .print-mural-wrapper {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: none !important;
            height: 100vh !important;
            max-height: none !important;
            aspect-ratio: auto !important;
            background: white !important;
            color: #0f172a !important;
            padding: 1.5cm 1.5cm 1.2cm 1.5cm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Force high contrast for text */
          .text-slate-800 {
            color: #1e293b !important;
          }
          .text-slate-500 {
            color: #64748b !important;
          }

          /* Disable text gradient clipping during print to prevent solid bars in PDFs */
          .print-mural-wrapper h2 {
            background: none !important;
            -webkit-background-clip: border-box !important;
            background-clip: border-box !important;
            color: ${activeTheme.primary} !important;
          }
        }
      `}} />

      {/* Main Overlay Window */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col lg:flex-row overflow-hidden max-h-[92vh] print-mural-container">
        
        {/* Left Side: Customization Sidebar */}
        <div className="w-full lg:w-96 bg-slate-950 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col gap-4 overflow-y-auto shrink-0 select-none no-print">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-violet-400 animate-pulse" />
              <span>Mural de Cumpleaños</span>
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            Diseña e imprime un cartel de felicitaciones personalizado con los cumpleañeros del mes para colocarlo en el mural de la empresa.
          </p>

          <hr className="border-slate-800/80" />

          {/* Month Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Mes del Mural</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-10 pr-6 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer appearance-none"
              >
                {monthsList.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title Text */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Eslogan del Cartel</label>
            <input
              type="text"
              value={headlineText}
              onChange={(e) => setHeadlineText(e.target.value)}
              placeholder="Ej. ¡Feliz Cumpleaños!"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>

          {/* Theme Palette */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Palette size={13} />
              <span>Estilo de Color</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(themeConfigs) as ColorTheme[]).map((theme) => {
                const cfg = themeConfigs[theme];
                const isActive = selectedTheme === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    style={{ backgroundColor: cfg.primary }}
                    className={`h-9 rounded-xl transition-all relative flex items-center justify-center border-2 ${
                      isActive ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={theme}
                  >
                    {isActive && <Check size={14} className="text-white drop-shadow-md font-semibold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-2 pt-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Decoraciones y Datos</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showBunting}
                onChange={(e) => setShowBunting(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Guirnalda (Banderines)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showBalloons}
                onChange={(e) => setShowBalloons(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Globos de Fondo</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Resumen Estadístico</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showZodiac}
                onChange={(e) => setShowZodiac(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Signos Zodiacales</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Logotipo de Empresa</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showBorderFrame}
                onChange={(e) => setShowBorderFrame(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Marco Elegante (Borde)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showCornerDecor}
                onChange={(e) => setShowCornerDecor(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Colgantes en Esquinas</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showCornerIcons}
                onChange={(e) => setShowCornerIcons(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Pastel y Regalo (Abajo)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showConfetti}
                onChange={(e) => setShowConfetti(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Lluvia de Confeti/Estrellas</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showRibbonHeader}
                onChange={(e) => setShowRibbonHeader(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Cinta de Encabezado</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showCardHighlights}
                onChange={(e) => setShowCardHighlights(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Destacados en Tarjetas</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showStreamers}
                onChange={(e) => setShowStreamers(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Mostrar Serpentinas Laterales</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <button
              onClick={handlePrint}
              disabled={filteredEmployees.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold uppercase tracking-wider text-xs py-2.5 rounded-xl shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              <Printer size={15} />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all"
            >
              Cerrar Vista
            </button>
          </div>
        </div>

        {/* Right Side: Mural Preview */}
        <div className="flex-1 bg-slate-900 p-6 flex flex-col overflow-y-auto print-mural-preview-pane">
          <div className="text-center mb-4 flex items-center justify-center gap-2.5 no-print">
            <span className="bg-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-700/50">
              Vista Previa del Cartel (A4 / Carta)
            </span>
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
              <Info size={12} />
              <span>Diseño adaptativo inteligente según el número de festejados</span>
            </div>
          </div>

          {/* Sheet container representing paper */}
          <div className="flex-1 flex justify-center items-start min-h-[550px] print-mural-paper-container">
            
            {/* The actual poster that will be printed */}
            <div 
              id="printable-mural" 
              className="print-mural-wrapper bg-white text-slate-900 w-full max-w-[650px] aspect-[1/1.414] shadow-2xl rounded-[1.5rem] border border-slate-200 p-8 flex flex-col justify-between relative overflow-hidden select-none"
            >
              
              {/* BORDER FRAME */}
              {showBorderFrame && <FestiveBorderRibbon themeColor={activeTheme.primary} />}

              {/* CONFETTI BACKGROUND */}
              {showConfetti && <ConfettiBackground themeColor={activeTheme.primary} />}

              {/* STREAMERS BACKGROUND */}
              {showStreamers && <HangingStreamers themeColor={activeTheme.primary} />}

              {/* GUIRNALDA (BUNTING) */}
              {showBunting && <BuntingFlags themeColor={activeTheme.primary} />}

              {/* BALLOONS BACKGROUND */}
              {showBalloons && <FloatingBalloons themeColor={activeTheme.primary} />}

              {/* HANGING CORNER DECORATIONS */}
              {showCornerDecor && <HangingCornerDecor themeColor={activeTheme.primary} />}

              {/* FESTIVE CORNER ICONS */}
              {showCornerIcons && <FestiveCornerIcons themeColor={activeTheme.primary} />}

              {/* Poster Header */}
              <div className="relative z-10 text-center space-y-3 pt-6">
                
                {showLogo && (
                  <div className="flex justify-center mb-1 select-none">
                    <img 
                      src="/logo.png" 
                      alt="Logo Empresa" 
                      className="h-9 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/logo_square.png";
                      }} 
                    />
                  </div>
                )}

                <div className="inline-block mt-1">
                  <span 
                    className="text-[10px] font-black uppercase tracking-[0.3em] px-3.5 py-1 rounded-full border shadow-sm"
                    style={{ 
                      color: activeTheme.primary, 
                      backgroundColor: activeTheme.primary + '08',
                      borderColor: activeTheme.primary + '20'
                    }}
                  >
                    Mural del Mes
                  </span>
                </div>

                {showRibbonHeader ? (
                  <div className="relative w-full max-w-[340px] mx-auto my-3 flex justify-center items-center">
                    <svg className="w-full h-14 overflow-visible" viewBox="0 0 320 50">
                      {/* Ribbon left shadow */}
                      <path d="M 20 14 L 5 28 L 20 42 L 35 42 L 23 28 L 35 14 Z" fill={activeTheme.accent} opacity="0.95" />
                      <path d="M 35 14 L 23 28 L 35 28 Z" fill="#000000" opacity="0.2" />
                      {/* Ribbon right shadow */}
                      <path d="M 300 14 L 315 28 L 300 42 L 285 42 L 297 28 L 285 14 Z" fill={activeTheme.accent} opacity="0.95" />
                      <path d="M 285 14 L 297 28 L 285 28 Z" fill="#000000" opacity="0.2" />
                      {/* Ribbon fold shadow left */}
                      <polygon points="38,42 38,48 48,42" fill="#000000" opacity="0.3" />
                      {/* Ribbon fold shadow right */}
                      <polygon points="282,42 282,48 272,42" fill="#000000" opacity="0.3" />
                      {/* Ribbon body */}
                      <rect x="36" y="8" width="248" height="34" rx="4" fill={activeTheme.primary} />
                      <rect x="39" y="11" width="242" height="28" rx="2" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
                    </svg>
                    <span className="absolute text-base font-black tracking-[0.25em] text-white uppercase text-center w-full z-10 pb-1.5 drop-shadow-sm">
                      {monthName}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tighter text-slate-700 leading-none uppercase">
                      Cumpleañeros de
                    </h1>
                    <h2 
                      className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r"
                      style={{ 
                        backgroundImage: `linear-gradient(to right, ${activeTheme.primary}, ${activeTheme.secondary})`
                      }}
                    >
                      {monthName.toUpperCase()}
                    </h2>
                  </div>
                )}

                {headlineText && (
                  <p className="text-slate-500 font-bold text-xs max-w-sm mx-auto italic leading-normal px-4">
                    "{headlineText}"
                  </p>
                )}

                {/* Elegant separator line */}
                <div className="flex items-center justify-center gap-2.5 py-1">
                  <div className="h-[1.5px] w-10 rounded-full" style={{ backgroundColor: activeTheme.primary + '20' }} />
                  <Cake size={15} style={{ color: activeTheme.primary }} />
                  <div className="h-[1.5px] w-10 rounded-full" style={{ backgroundColor: activeTheme.primary + '20' }} />
                </div>
              </div>

              {/* Poster Body / Grid of birthday cards (DYNAMICALLY ADAPTED) */}
              <div className="flex-1 my-5 relative z-10 flex flex-col justify-center">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-dashed border-slate-200">
                      <Cake size={24} />
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wide">
                      No hay cumpleaños registrados en {monthName}
                    </p>
                  </div>
                ) : (
                  <div className={`grid ${layout.gridClass}`}>
                    {filteredEmployees.map((emp) => {
                      const isToday = isBirthdayToday(emp.day);

                      return (
                        <div 
                          key={emp.id}
                          className={`${layout.cardClass} border transition-all flex items-center relative overflow-hidden ${
                            isToday ? 'scale-[1.02] shadow-lg shadow-amber-500/10' : ''
                          }`}
                          style={{ 
                            borderColor: isToday ? '#fbbf24' : activeTheme.primary + '18',
                            borderLeft: showCardHighlights ? `5px solid ${isToday ? '#d97706' : activeTheme.primary}` : undefined,
                            background: isToday 
                              ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' 
                              : '#ffffff'
                          }}
                        >
                          {/* Card Highlight Emoji Background */}
                          {showCardHighlights && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-2xl opacity-[0.08] select-none pointer-events-none z-0">
                              {isToday ? '👑' : ['🎈', '🎁', '🧁', '🥳'][emp.day % 4]}
                            </div>
                          )}
                          {/* TODAY INDICATOR BADGE */}
                          {isToday && (
                            <div className={layout.todayBadgeClass} style={{ zIndex: 30 }}>
                              <div className="flex items-center gap-0.5">
                                <Crown size={9} />
                                <span>Hoy</span>
                              </div>
                            </div>
                          )}

                          {/* Day Circular/Square Indicator */}
                          <div 
                            className={layout.dayClass}
                            style={{ 
                              background: isToday 
                                ? 'linear-gradient(135deg, #d97706, #fbbf24)' 
                                : `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`,
                              zIndex: 10
                            }}
                          >
                            <span className={layout.dayLabelClass}>Día</span>
                            <span className={layout.dayNumClass}>{emp.day}</span>
                          </div>

                          {/* Employee Name and Info */}
                          <div className="min-w-0 flex-1 relative" style={{ zIndex: 10 }}>
                            <h4 className={layout.nameClass}>
                              {emp.full_name}
                            </h4>
                            <p className={layout.posClass}>
                              {emp.position || 'Puesto no definido'}
                            </p>
                            <p className={layout.deptClass} style={{ color: isToday ? '#b45309' : activeTheme.primary }}>
                              {emp.area_name || emp.department || 'Área General'}
                            </p>
                          </div>

                          {/* Zodiac Indicator */}
                          {showZodiac && emp.zodiacSign && (
                            <div 
                              className={layout.zodiacClass}
                              title={emp.zodiacSign}
                            >
                              {emp.zodiacSign.split(' ')[0]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MONTHLY STATISTICAL BANNER */}
              {showStats && filteredEmployees.length > 0 && (
                <div 
                  className="relative z-10 border rounded-2xl p-3 flex flex-row items-center justify-center gap-6 text-center shadow-sm select-none mb-3 max-w-xl mx-auto w-full"
                  style={{ 
                    borderColor: activeTheme.primary + '18',
                    backgroundColor: activeTheme.primary + '03'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: activeTheme.primary + '10' }}>
                      <Crown size={14} style={{ color: activeTheme.primary }} />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Celebrados</span>
                      <span className="text-xs font-black text-slate-700 leading-tight">
                        {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Colaborador' : 'Colaboradores'}
                      </span>
                    </div>
                  </div>

                  {showZodiac && getZodiacSignsSummary() && (
                    <>
                      {/* Vertical Divider */}
                      <div className="h-7 w-[1.5px] bg-slate-200/60 shrink-0 self-center" />
                      
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Sparkles size={14} className="text-orange-500" />
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Astrología</span>
                          <span className="text-[10px] font-bold text-slate-600 leading-tight">{getZodiacSignsSummary()}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Horizontal visual anchor: Gift icon */}
                  <div className="hidden sm:flex items-center gap-2 border-l border-slate-200/60 pl-6 self-center">
                    <Gift size={13} style={{ color: activeTheme.primary }} />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">¡Gran Mes!</span>
                  </div>
                </div>
              )}

              {/* Poster Footer */}
              <div className="relative z-10 text-center pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] font-black text-slate-400 tracking-wider uppercase">
                <span className="flex items-center gap-1">
                  <Sparkles size={10} style={{ color: activeTheme.primary }} />
                  Textil JSN &copy; {new Date().getFullYear()}
                </span>
                <span>¡Muchas Felicidades! 🎉</span>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>,
    document.body
  );
}
