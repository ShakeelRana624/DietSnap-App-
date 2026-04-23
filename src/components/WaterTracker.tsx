import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CupSoda, Plus, Droplets, CheckCircle2 } from 'lucide-react';
import { WaterLog } from '../types';

interface Props {
  waterLogs: WaterLog[];
  target: number;
  onAdd: (amount: number) => void;
}

export default function WaterTracker({ waterLogs, target, onAdd }: Props) {
  const [adding, setAdding] = useState(false);
  
  const today = new Date().toDateString();
  const todayWater = waterLogs
    .filter(log => new Date(log.timestamp).toDateString() === today)
    .reduce((a, b) => a + b.amount, 0);

  const progress = Math.min((todayWater / target) * 100, 100);
  const glassesTotal = Math.ceil(target / 250);
  const glassesFilled = Math.floor(todayWater / 250);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border-2 border-gray-800 rounded-[32px] p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
        <Droplets className="w-40 h-40 text-blue-500" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Water Intake</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black italic text-blue-400 tabular-nums">{todayWater}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">/ {target} ml</span>
            </div>
          </div>
          <button
            onClick={() => {
              setAdding(true);
              onAdd(250);
              setTimeout(() => setAdding(false), 1000);
            }}
            disabled={adding}
            className="w-14 h-14 bg-blue-500 text-black rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(59,130,246,0.3)] active:scale-90 transition-all disabled:opacity-50"
          >
            <Plus className={`w-8 h-8 ${adding ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: glassesTotal }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!adding) {
                    setAdding(true);
                    onAdd(250);
                    setTimeout(() => setAdding(false), 300);
                  }
                }}
                className={`w-10 h-12 rounded-lg border-2 flex flex-col items-center justify-end p-1 transition-all cursor-pointer relative ${
                  i < glassesFilled ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-gray-800 bg-gray-900 hover:border-blue-500/50'
                }`}
              >
                <div 
                  className={`w-full rounded-sm transition-all duration-700 ${
                    i < glassesFilled ? 'bg-blue-400 h-full' : 'bg-transparent h-0'
                  }`} 
                />
                <CupSoda className={`w-4 h-4 absolute mb-2 ${i < glassesFilled ? 'text-black' : 'text-gray-700'}`} />
              </motion.div>
            ))}
            {todayWater >= target && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-12 rounded-lg border-2 border-[#00FF00] bg-[#00FF00]/10 flex items-center justify-center"
              >
                <CheckCircle2 className="w-6 h-6 text-[#00FF00]" />
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/10 p-3 rounded-2xl">
           <div className="p-2 bg-blue-500/10 rounded-lg">
             <Droplets className="w-4 h-4 text-blue-400" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
             {todayWater >= target ? "Hydration Goal Achieved! 🌊" : `${Math.ceil((target - todayWater) / 250)} more glasses to go today.`}
           </p>
        </div>
      </div>
    </motion.div>
  );
}
