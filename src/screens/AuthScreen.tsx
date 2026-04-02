import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export default function AuthScreen({ onComplete }: Props) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FF00]/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00FF00]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center space-y-12 max-w-md w-full"
      >
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-[#00FF00] rounded-[32px] flex items-center justify-center shadow-[0_0_60px_rgba(0,255,0,0.4)]"
          >
            <Zap className="w-16 h-16 text-black fill-current" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter italic leading-none">
              DIET<span className="text-[#00FF00]">SNAP</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-[#00FF00] font-black uppercase tracking-widest text-xs">
              <Sparkles className="w-4 h-4" />
              AI-Powered Nutrition
            </div>
          </div>

          <p className="text-gray-400 text-lg font-medium leading-relaxed px-4">
            The smartest way to track your calories. Just snap a photo and let our AI handle the rest.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="group w-full bg-[#00FF00] text-black font-black py-6 px-8 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all active:scale-95"
        >
          START YOUR JOURNEY
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
          No account required • Powered by AI
        </p>
      </motion.div>
    </div>
  );
}
