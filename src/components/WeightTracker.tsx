import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WeightLog } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, Scale } from 'lucide-react';

interface Props {
  weights: WeightLog[];
}

export default function WeightTracker({ weights }: Props) {
  if (weights.length === 0) return null;

  const data = weights
    .slice()
    .reverse()
    .map(w => ({
      date: new Date(w.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      weight: w.weight
    }));

  const latestWeight = weights[0].weight;
  const startWeight = weights[weights.length - 1].weight;
  const change = latestWeight - startWeight;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-[32px] p-6 space-y-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Scale className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-black italic uppercase">Weight Progress</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Last 30 Days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black italic text-white">{latestWeight} <span className="text-xs not-italic text-gray-500">kg</span></p>
          <p className={`text-[10px] font-black uppercase ${change <= 0 ? 'text-[#00FF00]' : 'text-red-500'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)} kg overall
          </p>
        </div>
      </div>

      <div className="h-48 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis 
              dataKey="date" 
              hide={true}
            />
            <YAxis 
              hide={true} 
              domain={['dataMin - 2', 'dataMax + 2']} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
              itemStyle={{ color: '#00FF00', fontWeight: 'bold' }}
              labelStyle={{ color: '#555', fontSize: '10px', textTransform: 'uppercase' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#00FF00" 
              strokeWidth={4} 
              dot={{ fill: '#00FF00', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {data[0]?.date}
        </div>
        <div>Latest Entry</div>
      </div>
    </motion.div>
  );
}
