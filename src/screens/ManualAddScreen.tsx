import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, MealLog } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Utensils, Flame, Zap, Droplets, PieChart } from 'lucide-react';
import { logMeal } from '../lib/firebase';

interface Props {
  profile: UserProfile;
}

export default function ManualAddScreen({ profile }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.foodName || !formData.calories) {
      setError("Basics toh btao! (Name and Calories required)");
      return;
    }

    setLoading(true);
    const meal: MealLog = {
      uid: profile.uid,
      foodName: formData.foodName,
      calories: Number(formData.calories),
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      portion: 'Custom',
      grade: 'Manual',
      timestamp: new Date().toISOString(),
    };

    try {
      await logMeal(meal);
      navigate('/');
    } catch (err: any) {
      setError("Failed to save. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black italic uppercase tracking-tight">Manual Log</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00FF00] ml-2">What did you eat?</label>
            <div className="relative">
              <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                required
                type="text"
                placeholder="Chicken Biryani, Burger, etc."
                value={formData.foodName}
                onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-5 pl-12 pr-4 text-white font-bold focus:border-[#00FF00] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#00FF00] ml-2">Total Calories</label>
            <div className="relative">
              <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                required
                type="number"
                placeholder="450"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-5 pl-12 pr-4 text-2xl font-black italic text-[#00FF00] focus:border-[#00FF00] outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-600">KCAL</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-center block text-blue-400">Protein</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="0"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 text-center font-bold text-white focus:border-blue-400 outline-none"
                />
                <span className="text-[8px] absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-600 font-black">GRAMS</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-center block text-orange-400">Carbs</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 text-center font-bold text-white focus:border-orange-400 outline-none"
                />
                <span className="text-[8px] absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-600 font-black">GRAMS</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-center block text-yellow-500">Fats</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="0"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 text-center font-bold text-white focus:border-yellow-500 outline-none"
                />
                <span className="text-[8px] absolute bottom-1 left-1/2 -translate-x-1/2 text-gray-600 font-black">GRAMS</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-6 h-6" />
                ADD MEAL LOG
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
