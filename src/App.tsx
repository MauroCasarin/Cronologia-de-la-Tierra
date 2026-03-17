import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Globe, 
  Mountain, 
  Microscope, 
  Sun, 
  Wind, 
  Dna, 
  Network, 
  Trees, 
  Bone, 
  Flower2, 
  User,
  History,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Smartphone
} from 'lucide-react';

// --- DATOS DE LA CRONOLOGÍA ---
const TIMELINE_EVENTS = [
  { ma: 4600, title: "Formación de la Tierra", icon: Globe, color: "#ef4444", description: "La Tierra se forma a partir del disco de acreción solar.", longDescription: "Hace unos 4.600 millones de años, el sistema solar era una nube de polvo y gas. La gravedad colapsó el material sobre sí mismo, formando el sol. El resto del material se agrupó formando los planetas. La Tierra primitiva era una bola de roca fundida constantemente bombardeada por meteoritos." },
  { ma: 4000, title: "Rocas más antiguas", icon: Mountain, color: "#cbd5e1", description: "Se forman las primeras rocas sólidas conocidas.", longDescription: "A medida que la Tierra se enfriaba, la superficie fundida comenzó a solidificarse formando una corteza terrestre primitiva. Las rocas más antiguas que se conservan en la actualidad (como el cinturón de rocas verdes de Nuvvuagittuq) datan de esta época, marcando el inicio de la geología terrestre estable." },
  { ma: 3800, title: "Fósiles procariontes", icon: Microscope, color: "#60a5fa", description: "Aparecen las primeras formas de vida simples (bacterias).", longDescription: "Aparecen los primeros organismos vivos conocidos: los procariotas. Eran células simples sin núcleo, principalmente bacterias y arqueas que vivían en los océanos primitivos, obteniendo energía de fuentes hidrotermales en un ambiente sin oxígeno." },
  { ma: 3500, title: "Org. fotosintéticos", icon: Sun, color: "#fde047", description: "Cianobacterias comienzan a realizar la fotosíntesis.", longDescription: "Aparecen las cianobacterias, los primeros organismos capaces de realizar la fotosíntesis. Utilizaban la luz solar, el agua y el dióxido de carbono para producir energía, liberando oxígeno como subproducto, un proceso que cambiaría el planeta para siempre." },
  { ma: 2200, title: "Oxígeno libre", icon: Wind, color: "#67e8f9", description: "Gran Oxidación: el oxígeno se acumula en la atmósfera.", longDescription: "El oxígeno producido por las cianobacterias finalmente satura los océanos y comienza a acumularse en la atmósfera. Esto causó la extinción de muchos organismos anaeróbicos (para los que el oxígeno era tóxico), pero allanó el camino para la vida aeróbica compleja." },
  { ma: 2000, title: "Fósiles eucariontes", icon: Dna, color: "#c084fc", description: "Aparecen células más complejas con núcleo.", longDescription: "Surgen células más grandes y complejas con un núcleo definido y orgánulos internos. Esto ocurrió cuando una célula procariota engulló a otra, formando una relación simbiótica. Son los bloques de construcción de todos los animales, plantas y hongos." },
  { ma: 1000, title: "Fósiles pluricelulares", icon: Network, color: "#f472b6", description: "Organismos formados por múltiples células.", longDescription: "La vida da un salto evolutivo clave cuando las células individuales comienzan a agruparse y cooperar, formando organismos multicelulares. Esto permitió la especialización celular y el desarrollo de formas de vida mucho más grandes y complejas." },
  { ma: 450, title: "Plantas en tierra firme", icon: Trees, color: "#4ade80", description: "Las plantas colonizan los continentes.", longDescription: "La vida coloniza la tierra firme. Pequeñas plantas no vasculares, similares a los musgos actuales, comienzan a crecer en las zonas húmedas costeras. Esto inició la transformación de los continentes áridos en ecosistemas verdes, alterando el clima global." },
  { ma: 230, title: "Era de los dinosaurios", icon: Bone, color: "#fb7185", description: "Aparición y dominio de los dinosaurios.", longDescription: "Tras la extinción masiva del Pérmico-Triásico, los reptiles arcosaurios evolucionan dando lugar a los primeros dinosaurios. Rápidamente se diversificaron para dominar los ecosistemas terrestres durante las eras Jurásica y Cretácica." },
  { ma: 130, title: "Plantas con flores", icon: Flower2, color: "#e879f9", description: "Evolución de las angiospermas (plantas con flores).", longDescription: "Aparecen las angiospermas, las plantas con flores. Su evolución revolucionó los ecosistemas terrestres al establecer relaciones simbióticas con insectos polinizadores, lo que llevó a una explosión de diversidad tanto en plantas como en animales." },
  { ma: 2, title: "Primer Homo", icon: User, color: "#ffffff", description: "Aparición del género Homo.", longDescription: "Aparece el género Homo en África. Se caracterizan por un cerebro más grande, postura bípeda erguida y la capacidad de fabricar y utilizar herramientas de piedra, marcando el inicio de la evolución humana y la era Paleolítica." },
  { ma: 0, title: "Presente", icon: Globe, color: "#38bdf8", description: "La actualidad.", longDescription: "La era del Holoceno y el Antropoceno. El Homo sapiens domina el planeta, desarrollando civilizaciones complejas, tecnología avanzada y alterando significativamente los ecosistemas globales y el clima de la Tierra." }
];

const MAX_MA = 4600;

export default function App() {
  const [currentMa, setCurrentMa] = useState(MAX_MA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [needsSensorPermission, setNeedsSensorPermission] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 150 });
  const backgroundX = useTransform(smoothMouseX, [-1, 1], ['-3%', '3%']);
  const backgroundY = useTransform(smoothMouseY, [-1, 1], ['-3%', '3%']);
  const planetX = useTransform(smoothMouseX, [-1, 1], ['15px', '-15px']);
  const planetY = useTransform(smoothMouseY, [-1, 1], ['15px', '-15px']);
  const clockX = useTransform(smoothMouseX, [-1, 1], ['5px', '-5px']);
  const clockY = useTransform(smoothMouseY, [-1, 1], ['5px', '-5px']);
  const innerTextX = useTransform(smoothMouseX, [-1, 1], ['25px', '-25px']);
  const innerTextY = useTransform(smoothMouseY, [-1, 1], ['25px', '-25px']);

  useEffect(() => {
    if (typeof (DeviceOrientationEvent as any) !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsSensorPermission(true);
    }
  }, []);

  const requestSensorAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setNeedsSensorPermission(false);
        }
      } catch (error) {
        console.error("Error requesting sensor access:", error);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = Math.max(-1, Math.min(1, e.gamma / 45));
        const y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (!needsSensorPermission) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [mouseX, mouseY, needsSensorPermission]);

  const activeEvent = useMemo(() => {
    return TIMELINE_EVENTS.slice().reverse().find(e => currentMa <= e.ma) || TIMELINE_EVENTS[0];
  }, [currentMa]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeEvent]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentMa((prev) => {
          if (prev <= 0) {
            setIsPlaying(false);
            return 0;
          }
          let speed = 8; 
          if (prev <= 600) speed = 2; 
          if (prev <= 15) speed = 0.08; 
          return Math.max(0, prev - speed);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const progressFraction = (MAX_MA - currentMa) / MAX_MA;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressFraction * circumference;

  const ActiveIcon = activeEvent.icon;

  return (
    <div className="h-[100dvh] text-slate-800 font-sans flex flex-col overflow-hidden selection:bg-blue-200 relative bg-slate-950">
      
      <motion.div 
        className="absolute inset-[-5%] w-[110%] h-[110%] z-0 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          x: backgroundX,
          y: backgroundY
        }}
      />

      <header className="py-2 px-4 bg-white/85 backdrop-blur-md border-b border-white/20 shrink-0 z-10 shadow-sm flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-0.5">
            Cronología de la Tierra
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-medium">
            Toda la historia de nuestro planeta en millones de años.
          </p>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2 md:gap-4">
          {needsSensorPermission && (
            <button 
              onClick={requestSensorAccess}
              className="animate-pulse bg-blue-500/20 text-blue-600 border border-blue-500/30 px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 hover:bg-blue-500/30 transition-colors"
            >
              <Smartphone size={14} />
              Activar 3D
            </button>
          )}
          <div className="text-xl md:text-2xl font-black font-mono tracking-tighter text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
            {Math.round(currentMa)} <span className="text-xs md:text-sm font-sans font-bold text-blue-400">Ma</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden z-10">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 shrink-0 lg:shrink bg-black/20 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden relative">
          <div className="relative w-full max-w-[320px] md:max-w-[450px] aspect-square flex items-center justify-center mt-4 lg:mt-0">
            <motion.svg 
              ref={svgRef}
              viewBox="0 0 100 100" 
              className="absolute inset-0 w-full h-full overflow-visible touch-none cursor-crosshair drop-shadow-xl z-10"
              style={{ x: clockX, y: clockY }}
            >
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <motion.circle 
                cx="50" cy="50" r={radius} fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                style={{ transformOrigin: '50% 50%', rotate: '-90deg' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </motion.svg>

            <motion.div 
              className="absolute inset-0 m-auto w-[70%] h-[70%] rounded-full flex flex-col items-center justify-center p-4 text-center text-white overflow-hidden shadow-2xl"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${activeEvent.color} 0%, #1e3a8a 60%, #0f172a 100%)`,
                x: planetX, y: planetY
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div key={activeEvent.title} className="relative z-10 flex flex-col items-center" style={{ x: innerTextX, y: innerTextY }}>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 shadow-lg" style={{ backgroundColor: `${activeEvent.color}30`, color: activeEvent.color }}>
                    <ActiveIcon size={24} strokeWidth={2.5} />
                  </div>
                  <h2 className="font-bold text-sm md:text-xl mb-1 leading-tight drop-shadow-md px-2">{activeEvent.title}</h2>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        <div className="h-48 lg:h-auto lg:w-80 shrink-0 bg-white/85 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/20 flex flex-col shadow-none z-10 overflow-hidden">
          <div className="p-2 md:p-3 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm shrink-0 flex items-center gap-2">
            <History size={14} className="text-blue-500" />
            <h3 className="font-bold text-slate-700 text-[11px] md:text-xs uppercase tracking-wider">Registro Evolutivo</h3>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2 scroll-smooth">
            {TIMELINE_EVENTS.map((ev) => {
              const isPast = ev.ma >= currentMa;
              const isActive = activeEvent.title === ev.title;
              if (!isPast) return null;
              const Icon = ev.icon;
              return (
                <div key={ev.title} className={`flex gap-2 p-2 md:p-3 rounded-xl border ${isActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200'}`}>
                  <div className="mt-0.5 shrink-0"><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ev.color}20`, color: ev.color }}><Icon size={16} /></div></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-1 mb-1">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{ev.title}</h4>
                      <span className="text-[10px] font-mono font-bold text-blue-600">{ev.ma} Ma</span>
                    </div>
                    {isActive && <p className="text-xs text-slate-700 leading-relaxed">{ev.longDescription}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="bg-white/85 backdrop-blur-md border-t border-white/20 p-2 md:p-3 shrink-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-3 md:gap-6 px-2">
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* BOTÓN MODIFICADO: Flecha derecha y lógica de avance */}
            <button 
              onClick={() => {
                const currentIndex = TIMELINE_EVENTS.findIndex(e => e.title === activeEvent.title);
                if (currentIndex > 0) {
                  setCurrentMa(TIMELINE_EVENTS[currentIndex - 1].ma);
                } else {
                  setCurrentMa(0);
                }
              }}
              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Avanzar al siguiente evento"
            >
              <SkipForward size={14} />
            </button>

            <button onClick={() => { setCurrentMa(MAX_MA); setIsPlaying(false); }} className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600" title="Reiniciar">
              <RotateCcw size={14} />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-md ml-1">
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center h-6">
            <input type="range" min="0" max={MAX_MA} step="1" value={MAX_MA - currentMa} onChange={(e) => { setCurrentMa(MAX_MA - Number(e.target.value)); setIsPlaying(false); }} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600" />
          </div>

          <div className="text-right shrink-0 min-w-[60px]">
            <div className="text-sm md:text-base font-black font-mono text-blue-600">{Math.round(currentMa)} <span className="text-[9px] md:text-[10px] text-blue-400 font-sans font-bold">Ma</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}