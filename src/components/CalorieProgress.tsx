import { motion } from 'motion/react';
import { Flame, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  consumed: number;
  goal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function CalorieProgress({ consumed, goal, protein, carbs, fat }: Props) {
  const progress = (consumed / goal) * 100;
  const isOver = consumed > goal;
  const remaining = Math.max(0, goal - consumed);
  
  // SVG Circle properties
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border-2 border-gray-800 rounded-[32px] p-6 md:p-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Flame className={`w-48 h-48 ${isOver ? 'text-red-500' : 'text-[#00FF00]'}`} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12 text-center md:text-left">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0">
          <svg className="w-full h-full -rotate-90 scale-[0.85] md:scale-100">
            {/* Background Ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              className="text-gray-800"
            />
            {/* Progress Ring */}
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`${isOver ? 'text-red-500' : progress >= 100 ? 'text-[#00FF00]' : 'text-[#00FF00]'} drop-shadow-[0_0_8px_rgba(0,255,0,0.4)]`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              key={consumed}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl font-black italic ${isOver ? 'text-red-500' : 'text-white'}`}
            >
              {Math.round(progress)}%
            </motion.span>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              {isOver ? 'Limit Exceeded' : 'Daily Goal'}
            </span>
          </div>
        </div>

        {/* Stats Content */}
        <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col items-center justify-center md:items-start md:justify-start space-y-1">
            <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Energy Balance</p>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-4xl md:text-5xl font-black italic tabular-nums leading-none ${isOver ? 'text-red-500' : 'text-white'}`}>
                {consumed}
              </h2>
              <span className="text-lg md:text-xl text-gray-500 font-bold">/ {goal} kcal</span>
            </div>
            {isOver ? (
              <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase mt-2">
                <AlertCircle className="w-3 h-3" />
                Over by {consumed - goal} kcal
              </div>
            ) : progress >= 100 ? (
              <div className="flex items-center gap-1.5 text-[#00FF00] text-[10px] font-black uppercase mt-2">
                <CheckCircle2 className="w-3 h-3" />
                Goal Reached!
              </div>
            ) : (
              <p className="text-gray-500 text-xs font-bold mt-2">
                {remaining} calories remaining to hit your target.
              </p>
            )}
          </div>

          {/* Mini Macro Bars */}
          <div className="grid grid-cols-3 gap-3">
             {[
               { label: 'Prot', val: protein, color: 'bg-blue-400', bg: 'bg-blue-400/10' },
               { label: 'Carb', val: carbs, color: 'bg-orange-400', bg: 'bg-orange-400/10' },
               { label: 'Fat', val: fat, color: 'bg-yellow-400', bg: 'bg-yellow-400/10' },
             ].map((macro, i) => (
               <div key={i} className="space-y-1.5">
                 <div className="flex justify-between items-center px-1">
                   <span className="text-[9px] font-black uppercase text-gray-500">{macro.label}</span>
                   <span className="text-[9px] font-black text-white">{Math.round(macro.val)}g</span>
                 </div>
                 <div className={`h-1.5 w-full rounded-full ${macro.bg} overflow-hidden`}>
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min((macro.val / 150) * 100, 100)}%` }} // 150g as a generic scale for the mini bar
                     className={`h-full ${macro.color} rounded-full`}
                   />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
