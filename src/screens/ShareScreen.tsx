import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Share2, Instagram, Twitter, Home, Zap, Download, Loader2 } from 'lucide-react';
import { MealLog } from '../types';
import { toBlob } from 'html-to-image';
import { useRef, useState } from 'react';

export default function ShareScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const meal: MealLog = location.state?.meal;
  const stickerRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  if (!meal) {
    navigate('/');
    return null;
  }

  const handleShareToInstagram = async () => {
    if (!stickerRef.current) return;
    setSharing(true);
    
    try {
      const blob = await toBlob(stickerRef.current, {
        cacheBust: true,
        backgroundColor: '#000000',
        width: 1080,
        height: 1080,
        style: {
          transform: 'scale(1)',
          borderRadius: '0'
        }
      });

      if (!blob) throw new Error("Failed to generate image");

      const file = new File([blob], `dietsnap-${meal.foodName.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My DietSnap Progress',
          text: `Just scanned my ${meal.foodName} with DietSnap! Grade: ${meal.grade} 🚀`
        });
      } else {
        // Fallback: Download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dietsnap-${meal.foodName}.png`;
        a.click();
        URL.revokeObjectURL(url);
        alert("Sharing not supported on this browser. Image downloaded! You can now upload it to Instagram manually.");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Something went wrong while generating the share card.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center w-full">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        <div className="w-full max-w-sm md:max-w-md overflow-hidden rounded-[40px] md:shadow-[0_0_80px_rgba(0,255,0,0.1)]">
            <motion.div 
            ref={stickerRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-[9/16] bg-black p-8 md:p-10 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Advanced Background: Cyber-Swiss Aesthetic */}
            <div className="absolute inset-0 bg-[#0A0A0A]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(0,255,0,0.15)_0%,_transparent_70%)]" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.1)_0%,_transparent_60%)]" />
            
            {/* Tech Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#00FF00 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            
            {/* Static Noise Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />

            {/* Top Branding Section */}
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#00FF00] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.4)]">
                  <Zap className="w-5 h-5 text-black fill-current" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter text-white leading-none">
                    DIET<span className="text-[#00FF00]">SNAP</span>
                  </h2>
                  <p className="text-[7px] font-black uppercase tracking-[.4em] text-gray-500">AI Personal Coach</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#00FF00] bg-[#00FF00]/10 px-2 py-0.5 rounded-full border border-[#00FF00]/20">
                  Live Scan ID: 0042
                </p>
              </div>
            </div>

            {/* Central "Scanning Lens" Visualization */}
            <div className="relative z-10 flex flex-col items-center justify-center py-4">
              <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00FF00]/40 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00FF00]/40 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00FF00]/40 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00FF00]/40 rounded-br-xl" />

                {/* Animated Scanner Header */}
                <motion.div 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
                >
                  <div className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Neural Analysis Active</span>
                </motion.div>

                {/* The Grade Visualization (The Hero) */}
                <div className="text-center space-y-2">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center bg-black border-4 border-[#00FF00] shadow-[0_0_50px_rgba(0,255,0,0.2)]"
                  >
                    <div className="absolute inset-2 border border-[#00FF00]/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <span className="text-7xl md:text-8xl font-black italic text-[#00FF00] drop-shadow-[0_0_15px_rgba(0,255,0,0.4)]">
                      {meal.grade}
                    </span>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tight leading-none">
                      {meal.foodName}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Grid: The Advertising Hook */}
            <div className="relative z-10 grid grid-cols-1 gap-3">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col items-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF00]/50 to-transparent" />
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-[.4em] mb-3">Energy Yield Analyzed</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-7xl font-black italic text-white tracking-tighter transition-all group-hover:text-[#00FF00] duration-500">
                    {meal.calories}
                  </span>
                  <span className="text-xl font-black italic text-gray-600">kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Prot.', val: Math.round(meal.protein), sub: 'g', color: 'from-blue-500/20 to-transparent', border: 'border-blue-500/20' },
                  { label: 'Carbs', val: Math.round(meal.carbs), sub: 'g', color: 'from-orange-500/20 to-transparent', border: 'border-orange-500/20' },
                  { label: 'Fats', val: Math.round(meal.fat), sub: 'g', color: 'from-yellow-500/20 to-transparent', border: 'border-yellow-500/20' }
                ].map((m, i) => (
                  <div key={i} className={`bg-gradient-to-b ${m.color} ${m.border} border rounded-2xl p-4 text-center backdrop-blur-sm`}>
                    <p className="text-[7px] font-black uppercase text-gray-500 mb-1">{m.label}</p>
                    <p className="text-lg font-black italic text-white leading-none">
                      {m.val}<span className="text-[10px] ml-0.5 opacity-40">{m.sub}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Ad Footer */}
            <div className="relative z-10">
              <div className="bg-[#00FF00] p-6 rounded-[32px] flex items-center justify-between shadow-[0_15px_40px_rgba(0,255,0,0.2)]">
                <div className="flex-1">
                  <p className="text-black text-xl font-black italic leading-[0.85] tracking-tighter">
                    SNAP. TRACK.<br/>TRANSFORM.
                  </p>
                  <div className="h-[2px] w-12 bg-black/20 my-2" />
                  <p className="text-[7px] text-black font-black uppercase tracking-widest opacity-60">Join 50k+ User Transformation</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] text-black font-black uppercase tracking-[0.2em] mb-1">Download for</p>
                  <p className="text-black text-xs font-black italic leading-none">FREE ON WEB</p>
                  <p className="text-[6px] text-black font-black uppercase tracking-[.4em] opacity-40 mt-1">@DIETSNAP.AI</p>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <p className="text-[6px] font-black uppercase tracking-[0.6em] text-gray-600">Privacy Insured • AI Encrypted • ISO-27001</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 w-full max-w-sm md:max-w-md space-y-4">
          <h3 className="text-center text-gray-500 font-black uppercase tracking-widest text-xs mb-6">Share your progress</h3>
          
          <button 
            onClick={handleShareToInstagram}
            disabled={sharing}
            className="w-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-500 p-6 rounded-3xl flex items-center justify-center gap-4 font-black italic text-xl active:scale-95 transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)] disabled:opacity-50"
          >
            {sharing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <>
                <Instagram className="w-7 h-7" />
                Share to Instagram
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleShareToInstagram}
              className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest active:scale-95 transition-all text-gray-400 hover:text-white"
            >
              <Download className="w-5 h-5 text-[#00FF00]" />
              Save Image
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest active:scale-95 transition-all text-gray-400 hover:text-[#00FF00]"
            >
              <Home className="w-5 h-5 text-[#00FF00]" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
