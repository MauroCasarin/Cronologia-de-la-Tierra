import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  User 
} from 'lucide-react';

// --- DATOS DE LA CRONOLOGÍA ---
const TIMELINE_EVENTS = [
  { ma: 4600, title: "Formación de la Tierra", icon: Globe, color: "#ef4444", description: "La Tierra se forma a partir del disco de acreción solar." },
  { ma: 4000, title: "Rocas más antiguas", icon: Mountain, color: "#cbd5e1", description: "Se forman las primeras rocas sólidas conocidas." },
  { ma: 3800, title: "Fósiles procariontes", icon: Microscope, color: "#60a5fa", description: "Aparecen las primeras formas de vida simples (bacterias)." },
  { ma: 3500, title: "Org. fotosintéticos", icon: Sun, color: "#fde047", description: "Cianobacterias comienzan a realizar la fotosíntesis." },
  { ma: 2200, title: "Oxígeno libre", icon: Wind, color: "#67e8f9", description: "Gran Oxidación: el oxígeno se acumula en la atmósfera." },
  { ma: 2000, title: "Fósiles eucariontes", icon: Dna, color: "#c084fc", description: "Aparecen células más complejas con núcleo." },
  { ma: 1000, title: "Fósiles pluricelulares", icon: Network, color: "#f472b6", description: "Organismos formados por múltiples células." },
  { ma: 450, title: "Plantas en tierra firme", icon: Trees, color: "#4ade80", description: "Las plantas colonizan los continentes." },
  { ma: 230, title: "Era de los dinosaurios", icon: Bone, color: "#fb7185", description: "Aparición y dominio de los dinosaurios." },
  { ma: 130, title: "Plantas con flores", icon: Flower2, color: "#e879f9", description: "Evolución de las angiospermas (plantas con flores)." },
  { ma: 2, title: "Primer Homo", icon: User, color: "#ffffff", description: "Aparición del género Homo." },
  { ma: 0, title: "Presente", icon: Globe, color: "#38bdf8", description: "La actualidad." }
];

const MAX_MA = 4600;

export default function App() {
  const [currentMa, setCurrentMa] = useState(MAX_MA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Lógica del reproductor
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentMa((prev) => {
          if (prev <= 0) {
            setIsPlaying(false);
            return 0;
          }
          // Velocidad dinámica: más lento al acercarse al presente
          let speed = 8; 
          if (prev <= 600) speed = 2; // Era de plantas y dinosaurios
          if (prev <= 15) speed = 0.08; // Súper lento para ver al Primer Homo (2 Ma)
          return Math.max(0, prev - speed);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Encontrar el evento activo (el más cercano que ya haya pasado)
  const activeEvent = useMemo(() => {
    return TIMELINE_EVENTS.slice().reverse().find(e => currentMa <= e.ma) || TIMELINE_EVENTS[0];
  }, [currentMa]);

  // Manejo del arrastre (Scrubbing) en el SVG circular
  const handlePointerEvent = (e: React.PointerEvent<SVGSVGElement> | PointerEvent) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calcular ángulo (0 en la parte superior, sentido horario)
    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    
    const fraction = angle / (2 * Math.PI);
    const newMa = MAX_MA - (fraction * MAX_MA);
    
    setCurrentMa(Math.max(0, Math.min(MAX_MA, newMa)));
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => setIsDragging(false);
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isDragging) handlePointerEvent(e);
    };

    if (isDragging) {
      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('pointermove', handleGlobalPointerMove);
    }

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
    };
  }, [isDragging]);

  // Progreso circular
  const progressFraction = (MAX_MA - currentMa) / MAX_MA;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressFraction * circumference;

  const ActiveIcon = activeEvent.icon;

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800 font-sans flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto selection:bg-blue-200">
      
      {/* Encabezado */}
      <div className="text-center mb-4 md:mb-8 z-10 w-full max-w-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
          Cronología de la Tierra
        </h1>
        <p className="text-slate-500 text-xs md:text-sm">
          Toda la historia de nuestro planeta en millones de años.
        </p>
      </div>

      {/* Contenedor Principal del Reloj */}
      <div className="relative w-full max-w-[320px] md:max-w-[400px] aspect-square flex items-center justify-center mb-6 md:mb-8">
        
        {/* SVG Circular Timeline */}
        <svg 
          ref={svgRef}
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full overflow-visible touch-none cursor-crosshair drop-shadow-xl"
          onPointerDown={(e) => {
            setIsDragging(true);
            handlePointerEvent(e);
          }}
        >
          {/* Fondo del anillo */}
          <circle 
            cx="50" cy="50" r={radius} 
            fill="none" 
            stroke="#e2e8f0" 
            strokeWidth="6" 
          />
          
          {/* Anillo de progreso animado */}
          <motion.circle 
            cx="50" cy="50" r={radius} 
            fill="none" 
            stroke="url(#gradient)" 
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-none"
            style={{ transformOrigin: '50% 50%', rotate: '-90deg' }}
          />

          {/* Gradiente para el anillo */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Marcadores de eventos */}
          {TIMELINE_EVENTS.map((ev, i) => {
            if (ev.ma === 0) return null; // Omitir el presente en los marcadores
            const frac = (MAX_MA - ev.ma) / MAX_MA;
            const angle = frac * 2 * Math.PI - Math.PI / 2;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            const isActive = currentMa <= ev.ma;

            return (
              <g key={i} className="transition-opacity duration-300">
                <circle 
                  cx={x} cy={y} r="1.5" 
                  fill={isActive ? ev.color : '#cbd5e1'} 
                  className="transition-colors duration-500"
                />
                {/* Etiqueta de hora */}
                <text 
                  x={50 + Math.cos(angle) * (radius + 6)} 
                  y={50 + Math.sin(angle) * (radius + 6)} 
                  fill={isActive ? '#64748b' : '#94a3b8'}
                  fontSize="2.5"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="hidden md:block transition-colors duration-500 font-mono font-medium"
                  transform={`rotate(${frac * 360}, ${50 + Math.cos(angle) * (radius + 6)}, ${50 + Math.sin(angle) * (radius + 6)})`}
                >
                  {ev.ma}
                </text>
              </g>
            );
          })}

          {/* Aguja indicadora (Thumb) */}
          <motion.g
            style={{ 
              transformOrigin: '50px 50px',
              rotate: `${progressFraction * 360}deg`
            }}
          >
            <line x1="50" y1="50" x2="50" y2={100 - radius + 3} stroke="#94a3b8" strokeWidth="0.5" opacity="0.8" />
            <circle cx="50" cy={100 - radius} r="3.5" fill="#fff" stroke="#2563eb" strokeWidth="1.5" className="shadow-md" />
          </motion.g>
        </svg>

        {/* Contenido Central (Planeta 3D y Evento Activo) */}
        <div 
          className="absolute inset-0 m-auto w-[68%] h-[68%] rounded-full flex flex-col items-center justify-center p-3 text-center text-white overflow-hidden"
          style={{
            // Gradiente radial para simular un planeta esférico
            background: `radial-gradient(circle at 30% 30%, #3b82f6 0%, #1e3a8a 60%, #0f172a 100%)`,
            // Sombras internas para darle volumen 3D
            boxShadow: `inset -15px -15px 25px rgba(0,0,0,0.6), inset 5px 5px 15px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.15)`
          }}
        >
          {/* Textura animada del planeta (Rotación) */}
          <motion.div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
              backgroundSize: "200px 200px"
            }}
            animate={{ backgroundPositionX: ["0px", "200px"] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvent.title}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-1 md:mb-2 z-10"
            >
              {/* Animación continua de flotación y rotación */}
              <motion.div
                animate={{ 
                  y: [0, -6, 0],
                  rotate: [-3, 3, -3]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
              >
                <ActiveIcon 
                  size={42} 
                  color={activeEvent.color} 
                  strokeWidth={1.5} 
                  className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] md:w-12 md:h-12" 
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvent.title + '-text'}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="z-10"
            >
              <h2 className="text-xs md:text-sm font-bold leading-tight mb-1 drop-shadow-md" style={{ color: activeEvent.color }}>
                {activeEvent.title}
              </h2>
              <p className="text-[10px] md:text-[11px] text-blue-100/90 block leading-relaxed px-1 md:px-4 drop-shadow-sm">
                {activeEvent.description}
              </p>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* Controles e Información */}
      <div className="w-full max-w-md bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 z-10">
        
        {/* Display de Tiempo Principal */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
            Hace
          </div>
          <div className="text-4xl md:text-5xl font-mono font-black text-blue-600 tabular-nums tracking-tighter">
            {Math.round(currentMa).toLocaleString('es-ES')} <span className="text-xl md:text-2xl text-blue-400 font-bold">Ma</span>
          </div>
        </div>

        {/* Slider Manual */}
        <div className="mb-6 px-2">
          <input 
            type="range" 
            min="0" 
            max={MAX_MA} 
            step="1"
            value={MAX_MA - currentMa} // Invertido para que izquierda sea pasado y derecha presente
            onChange={(e) => {
              setCurrentMa(MAX_MA - Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-2 md:h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500 shadow-inner"
          />
          <div className="flex justify-between text-[9px] md:text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
            <span>Formación</span>
            <span>Presente</span>
          </div>
        </div>

        {/* Botones de Control */}
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <button 
            onClick={() => {
              setCurrentMa(prev => Math.min(MAX_MA, prev + 100));
              setIsPlaying(false);
            }}
            className="p-3 md:p-4 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-sm active:scale-95"
            title="Retroceder 100 Ma"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>

          <button 
            onClick={() => {
              if (currentMa <= 0) setCurrentMa(MAX_MA);
              setIsPlaying(!isPlaying);
            }}
            className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 w-36 md:w-44 justify-center text-sm md:text-base"
          >
            {isPlaying ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                Pausar
              </>
            ) : currentMa <= 0 ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Reiniciar
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                Reproducir
              </>
            )}
          </button>

          <button 
            onClick={() => {
              setCurrentMa(prev => Math.max(0, prev - 100));
              setIsPlaying(false);
            }}
            className="p-3 md:p-4 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-sm active:scale-95"
            title="Avanzar 100 Ma"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>

      </div>
    </div>
  );
}
