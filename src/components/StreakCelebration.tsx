import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Share2, Rocket, PartyPopper, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
}

export default function StreakCelebration({ isOpen, onClose, streak }: Props) {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#ffffff', '#FF5F1F']
      });
    }
  }, [isOpen]);

  const milestones = [7, 14, 30, 50, 100, 365];
  const isMilestone = milestones.includes(streak);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-gray-900 border-2 border-[#00FF00]/30 rounded-[40px] p-8 overflow-hidden"
          >
            {/* Animated Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00FF00]/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-2 border-dashed border-[#00FF00]/20 rounded-full"
                />
                <div className="w-24 h-24 bg-[#00FF00] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,255,0,0.4)]">
                  <Flame className="w-12 h-12 text-black fill-current" />
                </div>
                <motion.div
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute -top-2 -right-2 bg-white text-black p-1.5 rounded-full"
                >
                  <PartyPopper className="w-4 h-4" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  UNSTOPPABLE!
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-[2px] w-8 bg-[#00FF00]" />
                  <p className="text-[#00FF00] font-black uppercase tracking-widest text-xs">Streak Milestone Reached</p>
                  <div className="h-[2px] w-8 bg-[#00FF00]" />
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-3xl p-6 w-full">
                <p className="text-6xl font-black italic text-white leading-none">
                  {streak}
                </p>
                <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-500 mt-2">DAYS STRONG</p>
              </div>

              <p className="text-gray-400 font-medium px-4">
                You've logged your nutrition for <span className="text-white font-bold">{streak} days</span> in a row. Your consistency is legendary!
              </p>

              <div className="w-full space-y-3 pt-4">
                <button
                  onClick={onClose}
                  className="w-full bg-[#00FF00] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase italic tracking-tighter text-lg"
                >
                  Keep Crushing It
                  <Rocket className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase italic tracking-tighter text-sm opacity-60"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
