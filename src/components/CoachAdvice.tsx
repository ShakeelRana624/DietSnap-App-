import { useState, useEffect } from 'react';
import { UserProfile, MealLog } from '../types';
import { getCoachAdvice } from '../services/coachService';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  profile: UserProfile;
  todayMeals: MealLog[];
}

export default function CoachAdvice({ profile, todayMeals }: Props) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getCoachAdvice(profile, todayMeals);
    setAdvice(result);
    setLoading(false);
    // Cache advice for the next 30 minutes
    localStorage.setItem(`coach_advice_${profile.uid}`, JSON.stringify({
      text: result,
      timestamp: Date.now()
    }));
  };

  useEffect(() => {
    const cached = localStorage.getItem(`coach_advice_${profile.uid}`);
    if (cached) {
      const { text, timestamp } = JSON.parse(cached);
      // Cache for 30 minutes
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        setAdvice(text);
        return;
      }
    }
    fetchAdvice();
  }, [profile.uid, todayMeals.length]); // Refresh advice when new meals are added

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-black border-2 border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-20 h-20 text-indigo-400" />
      </div>
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white fill-current" />
            </div>
            <h3 className="text-sm font-black italic uppercase tracking-widest text-indigo-400">AI Personal Coach</h3>
          </div>
          <button 
            onClick={fetchAdvice}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Refresh Advice"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 flex items-center gap-3"
            >
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest animate-pulse">Analyzing your nutrition...</p>
            </motion.div>
          ) : (
            <motion.div
              key="advice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[60px] flex flex-col justify-center"
            >
              <p className="text-white text-lg font-black italic leading-tight tracking-tight">
                "{advice}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">DietSnap Intelligent Agent</span>
        </div>
      </div>
    </div>
  );
}
