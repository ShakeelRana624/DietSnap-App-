import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MealLog } from '../types';
import { motion } from 'motion/react';
import { Edit2, Save, ArrowLeft, Info } from 'lucide-react';

export default function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<MealLog>(location.state?.meal);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!meal) {
    navigate('/');
    return null;
  }

  const handleSave = () => {
    setLoading(true);
    try {
      const savedMeals = localStorage.getItem('dietsnap_meals');
      const meals = savedMeals ? JSON.parse(savedMeals) : [];
      
      const mealToSave = {
        ...meal,
        id: Math.random().toString(36).substr(2, 9),
        uid: 'local-user',
      };
      
      meals.unshift(mealToSave);
      localStorage.setItem('dietsnap_meals', JSON.stringify(meals));
      
      navigate('/share', { state: { meal: mealToSave } });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-xl">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black italic uppercase tracking-tight">Scan Result</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-8"
      >
        {/* Main Card */}
        <div className="bg-gray-900 border-2 border-gray-800 rounded-3xl p-8 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 flex items-center justify-center font-black italic text-6xl opacity-20 ${
            meal.grade === 'A' ? 'text-green-500' : 'text-yellow-500'
          }`}>
            {meal.grade}
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              {editing ? (
                <input 
                  value={meal.foodName}
                  onChange={(e) => setMeal({ ...meal, foodName: e.target.value })}
                  className="bg-gray-800 border-2 border-[#00FF00] rounded-xl px-4 py-2 text-2xl font-black italic w-full outline-none"
                />
              ) : (
                <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  {meal.foodName}
                  <button onClick={() => setEditing(true)} className="p-1 text-gray-600 hover:text-[#00FF00]">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </h2>
              )}
              <p className="text-[#00FF00] font-black uppercase tracking-widest text-sm mt-1">{meal.portion} Portion</p>
            </div>

            <div className="flex items-end gap-2">
              <span className="text-6xl font-black italic text-[#00FF00]">{meal.calories}</span>
              <span className="text-xl font-bold text-gray-500 mb-2 uppercase italic">kcal</span>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800">
              {[
                { label: 'Prot', val: meal.protein, unit: 'g' },
                { label: 'Carb', val: meal.carbs, unit: 'g' },
                { label: 'Fat', val: meal.fat, unit: 'g' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black italic">{Math.round(stat.val)}{stat.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Info */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex gap-4 items-start">
          <div className="p-3 bg-[#00FF00]/10 rounded-2xl">
            <Info className="w-6 h-6 text-[#00FF00]" />
          </div>
          <div>
            <h4 className="font-black italic uppercase text-sm">Health Grade: {meal.grade}</h4>
            <p className="text-sm text-gray-400 font-medium">
              {meal.grade === 'A' ? "Superfood! High nutrient density and perfect macros." : 
               meal.grade === 'B' ? "Great choice! Balanced and healthy." :
               "Decent, but watch your portions for the rest of the day."}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="pt-8 space-y-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,0,0.3)] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-6 h-6" />
              Log Meal & Share
            </>
          )}
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full py-2 text-gray-500 font-bold uppercase tracking-widest text-xs"
        >
          Discard Entry
        </button>
      </div>
    </div>
  );
}
