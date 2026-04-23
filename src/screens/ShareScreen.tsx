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
    <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm overflow-hidden rounded-[40px]">
        <motion.div 
          ref={stickerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full aspect-square bg-black p-8 relative overflow-hidden border-2 border-gray-800"
        >
          {/* Viral Sticker Design */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00FF00]/10 to-transparent"></div>
          
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter leading-none text-white">
                  FUELLED<br/><span className="text-[#00FF00]">BY AI</span>
                </h2>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mt-2">DietSnap Pro</p>
              </div>
              <div className="w-16 h-16 bg-[#00FF00] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.4)]">
                <Zap className="w-8 h-8 text-black fill-current" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black italic tracking-tighter text-white">{meal.calories}</span>
                <span className="text-2xl font-black italic text-gray-500 uppercase">kcal</span>
              </div>
              <p className="text-2xl font-black italic uppercase text-white/90">{meal.foodName}</p>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-gray-500">Prot</p>
                  <p className="font-black italic text-white">{Math.round(meal.protein)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-gray-500">Carb</p>
                  <p className="font-black italic text-white">{Math.round(meal.carbs)}g</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Health Grade</div>
                <div className="w-14 h-14 rounded-full border-4 border-[#00FF00] flex items-center justify-center text-3xl font-black italic text-[#00FF00] shadow-[0_0_20px_rgba(0,255,0,0.3)]">
                  {meal.grade}
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-30">
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Made with DietSnap AI</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 w-full max-w-sm space-y-4">
        <h3 className="text-center text-gray-500 font-black uppercase tracking-widest text-xs mb-6">Share your progress</h3>
        
        <button 
          onClick={handleShareToInstagram}
          disabled={sharing}
          className="w-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-500 p-5 rounded-2xl flex items-center justify-center gap-3 font-black italic text-lg active:scale-95 transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)] disabled:opacity-50"
        >
          {sharing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Instagram className="w-6 h-6" />
              Share to Instagram
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleShareToInstagram}
            className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all text-gray-400"
          >
            <Download className="w-5 h-5" />
            Save Image
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-95 transition-all text-gray-400"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
