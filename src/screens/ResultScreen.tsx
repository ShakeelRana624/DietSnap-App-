import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MealLog } from '../types';
import { motion } from 'motion/react';
import { Edit2, Save, ArrowLeft, Info, AlertCircle, Lightbulb, Share2 } from 'lucide-react';
import { logMeal } from '../lib/firebase';

export default function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<MealLog>(location.state?.meal);
  const [insight, setInsight] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!meal) {
    navigate('/');
    return null;
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const profileStr = localStorage.getItem('dietsnap_profile');
      const profile = profileStr ? JSON.parse(profileStr) : null;
      
      if (!profile) throw new Error("No profile found");

      const mealToSave = {
        ...meal,
        uid: profile.uid,
      };
      
      await logMeal(mealToSave);
      navigate('/share', { state: { meal: mealToSave } });
    } catch (err) {
      console.error(err);
      alert("Failed to sync meal to cloud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col w-full">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Scan Result</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 space-y-8"
        >
          {/* Main Card */}
          <div className="bg-gray-900/50 backdrop-blur-xl border-4 border-gray-800/50 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
            <div className={`absolute -top-4 -right-4 w-32 h-32 md:w-48 md:h-48 flex items-center justify-center font-black italic text-7xl md:text-9xl opacity-10 transition-transform group-hover:scale-110 ${
              meal.grade === 'A' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {meal.grade}
            </div>

            <div className="space-y-10 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  {editing ? (
                    <div className="flex gap-2">
                       <input 
                        value={meal.foodName}
                        autoFocus
                        onChange={(e) => setMeal({ ...meal, foodName: e.target.value })}
                        className="bg-gray-800 border-2 border-[#00FF00] rounded-2xl px-6 py-4 text-3xl font-black italic w-full outline-none shadow-[0_0_20px_rgba(0,255,0,0.1)]"
                      />
                      <button onClick={() => setEditing(false)} className="p-4 bg-[#00FF00] text-black rounded-2xl">
                         <Save className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none flex items-center gap-4 flex-wrap">
                      {meal.foodName}
                      <button onClick={() => setEditing(true)} className="p-2 bg-gray-800 text-gray-500 hover:text-[#00FF00] rounded-xl transition-all">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </h2>
                  )}
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-3 py-1 bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {meal.portion} Portion
                    </span>
                    <span className="text-gray-600 font-bold">•</span>
                    <span className="text-gray-500 text-xs font-black uppercase tracking-widest">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-6xl sm:text-8xl md:text-9xl font-black italic text-[#00FF00] tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(0,255,0,0.2)]">
                  {meal.calories}
                </span>
                <span className="text-lg sm:text-2xl font-black text-gray-600 uppercase italic">kcal</span>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-10 border-t-2 border-gray-800/50">
                {[
                  { label: 'Prot', val: meal.protein, unit: 'g', color: 'text-blue-500' },
                  { label: 'Carb', val: meal.carbs, unit: 'g', color: 'text-yellow-500' },
                  { label: 'Fat', val: meal.fat, unit: 'g', color: 'text-red-500' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{stat.label}</p>
                    <p className={`text-2xl md:text-3xl font-black italic ${stat.color}`}>{Math.round(stat.val)}<span className="text-sm ml-0.5 opacity-50">{stat.unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart insight banner */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-8 rounded-[32px] flex gap-6 items-start border-2 ${
              meal.grade === 'D' || meal.grade === 'F' 
                ? 'bg-red-500/5 border-red-500/10' 
                : 'bg-[#00FF00]/5 border-[#00FF00]/10'
            }`}
          >
            <div className={`p-4 rounded-2xl ${meal.grade === 'D' || meal.grade === 'F' ? 'bg-red-500/10' : 'bg-[#00FF00]/10'}`}>
              {meal.grade === 'D' || meal.grade === 'F' ? (
                <AlertCircle className="w-8 h-8 text-red-500" />
              ) : (
                <Lightbulb className="w-8 h-8 text-[#00FF00]" />
              )}
            </div>
            <div className="space-y-1">
              <h4 className={`font-black italic uppercase text-lg leading-none ${meal.grade === 'D' || meal.grade === 'F' ? 'text-red-500' : 'text-[#00FF00]'}`}>
                {meal.grade === 'D' || meal.grade === 'F' ? "Nutrition Warning" : "AI Insight"}
              </h4>
              <p className="text-gray-400 font-medium leading-relaxed">
                {meal.grade === 'D' || meal.grade === 'F' 
                  ? "This meal is dense in calories. To stay on track, consider reducing your next meal's portion or increasing your activity today."
                  : (meal.protein > 20 
                      ? "Excellent protein intake! This selection will keep you satiated and support your muscular goals." 
                      : "Great choice! Add some fiber-rich greens to this meal to slow down digestion and feel full longer.")
                }
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="py-8 space-y-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#00FF00] text-black font-black py-6 rounded-3xl flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(0,255,0,0.3)] hover:shadow-[0_0_70px_rgba(0,255,0,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 text-2xl uppercase italic tracking-tighter"
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-7 h-7" />
                Finish & Sync
              </>
            )}
          </button>

          <button 
            onClick={() => {
              const profileStr = localStorage.getItem('dietsnap_profile');
              const profile = profileStr ? JSON.parse(profileStr) : null;
              navigate('/share', { state: { meal, streak: profile?.streak || 0 } });
            }}
            className="w-full bg-gray-900 border-2 border-gray-800 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 hover:border-blue-500 transition-all text-xl uppercase italic tracking-tighter group"
          >
            <Share2 className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
            Share Progress
          </button>

          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 text-gray-600 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-colors"
          >
            Discard Scan
          </button>
        </div>
      </div>
    </div>
  );
}
