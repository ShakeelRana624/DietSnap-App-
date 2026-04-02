import { useState, useEffect } from 'react';
import { UserProfile, MealLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, TrendingUp, Utensils, Flame, Calendar, History, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  profile: UserProfile;
}

export default function Dashboard({ profile }: Props) {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(profile.goal.toString());
  const [view, setView] = useState<'today' | 'history'>('today');
  const navigate = useNavigate();

  useEffect(() => {
    const savedMeals = localStorage.getItem('dietsnap_meals');
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    }
  }, []);

  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toDateString();
      const lastUpdate = profile.lastGoalUpdate ? new Date(profile.lastGoalUpdate).toDateString() : null;
      
      if (lastUpdate !== today) {
        setShowGoalModal(true);
      }
    };
    checkNewDay();
  }, [profile.lastGoalUpdate]);

  const handleUpdateGoal = () => {
    const updatedProfile = {
      ...profile,
      goal: Number(newGoal),
      lastGoalUpdate: new Date().toISOString()
    };
    localStorage.setItem('dietsnap_profile', JSON.stringify(updatedProfile));
    window.location.reload(); // Refresh to update profile in App state
  };

  const todayMeals = meals.filter(m => {
    const mealDate = new Date(m.timestamp).toDateString();
    const today = new Date().toDateString();
    return mealDate === today;
  });

  const consumedCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const progress = Math.min((consumedCalories / profile.goal) * 100, 100);

  // Group meals by date for history
  const historyData = meals.reduce((acc: any, meal) => {
    const date = new Date(meal.timestamp).toDateString();
    if (!acc[date]) acc[date] = { calories: 0, meals: [] };
    acc[date].calories += meal.calories;
    acc[date].meals.push(meal);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-black italic">DIET<span className="text-[#00FF00]">SNAP</span></h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            {view === 'today' ? 'Today' : 'History'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView(view === 'today' ? 'history' : 'today')}
            className="p-2 bg-gray-800 rounded-lg hover:bg-[#00FF00]/20 hover:text-[#00FF00] transition-colors"
          >
            {view === 'today' ? <History className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {view === 'today' ? (
        <>
          {/* Progress Card */}
          <div className="p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border-2 border-gray-800 rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-24 h-24 text-[#00FF00]" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Daily Progress</p>
                    <h2 className="text-4xl font-black italic">
                      {consumedCalories} <span className="text-lg text-gray-500 not-italic">/ {profile.goal} kcal</span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00FF00] text-2xl font-black italic">{Math.round(progress)}%</p>
                  </div>
                </div>

                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.5)]"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Prot', val: todayMeals.reduce((a, m) => a + m.protein, 0), color: 'text-blue-400' },
              { label: 'Carb', val: todayMeals.reduce((a, m) => a + m.carbs, 0), color: 'text-orange-400' },
              { label: 'Fat', val: todayMeals.reduce((a, m) => a + m.fat, 0), color: 'text-yellow-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 p-3 rounded-2xl text-center">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">{stat.label}</p>
                <p className={`text-lg font-black italic ${stat.color}`}>{Math.round(stat.val)}g</p>
              </div>
            ))}
          </div>

          {/* Recent Meals */}
          <div className="px-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Today's Meals</h3>
              <Utensils className="w-4 h-4 text-gray-600" />
            </div>

            {todayMeals.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
                <p className="text-gray-500 font-bold italic">No meals logged yet today.</p>
              </div>
            ) : (
              todayMeals.map((meal, i) => (
                <motion.div 
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-xl ${
                    meal.grade === 'A' ? 'bg-green-500/20 text-green-500' :
                    meal.grade === 'B' ? 'bg-blue-500/20 text-blue-500' :
                    meal.grade === 'C' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {meal.grade}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{meal.foodName}</h4>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{meal.portion} Portion</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black italic text-xl text-[#00FF00]">{meal.calories}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">kcal</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="p-6 space-y-6">
          {Object.entries(historyData).map(([date, data]: [string, any]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 border-l-2 border-[#00FF00] pl-3">{date}</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#00FF00]/10 rounded-lg">
                    <Flame className="w-5 h-5 text-[#00FF00]" />
                  </div>
                  <div>
                    <p className="text-lg font-black italic">{data.calories} kcal</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{data.meals.length} meals logged</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {data.meals.slice(0, 3).map((m: any, idx: number) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] font-black italic">
                      {m.grade}
                    </div>
                  ))}
                  {data.meals.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] font-black italic text-gray-500">
                      +{data.meals.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-gray-900 border-2 border-[#00FF00] rounded-[40px] p-8 space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#00FF00] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight">New Day!</h2>
                <p className="text-gray-400 font-bold">What's your calorie goal for today?</p>
              </div>

              <div className="relative">
                <Flame className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl py-6 pl-14 pr-6 text-3xl font-black italic focus:border-[#00FF00] outline-none transition-all"
                />
              </div>

              <button
                onClick={handleUpdateGoal}
                className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all active:scale-95"
              >
                Set Goal
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button 
          onClick={() => navigate('/scan')}
          className="bg-[#00FF00] text-black w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,255,0,0.4)] hover:scale-110 active:scale-95 transition-all group"
        >
          <Camera className="w-10 h-10 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
}
