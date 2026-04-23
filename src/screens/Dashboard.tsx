import { useState, useEffect } from 'react';
import { UserProfile, MealLog, WaterLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, TrendingUp, Utensils, Flame, Calendar, History, Target, ArrowRight, User, Sparkles, Trophy, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscribeToMeals, saveUserProfile, subscribeToWeights, logWeight, updateStreak, subscribeToWater, logWater } from '../lib/firebase';
import { WeightLog } from '../types';
import WeightTracker from '../components/WeightTracker';
import WaterTracker from '../components/WaterTracker';
import StreakCelebration from '../components/StreakCelebration';
import CoachAdvice from '../components/CoachAdvice';
import CalorieProgress from '../components/CalorieProgress';
import { scheduleReminders } from '../services/notificationService';
import { Lightbulb, Info } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

export default function Dashboard({ profile }: Props) {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weight?.toString() || '0');
  const [newGoal, setNewGoal] = useState(profile.goal?.toString() || '2000');
  const [view, setView] = useState<'today' | 'history'>('today');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeToMeals(profile.uid, (fetchedMeals) => {
      setMeals(fetchedMeals);
    });
    const unsubWeights = subscribeToWeights(profile.uid, (fetchedWeights) => {
      setWeights(fetchedWeights);
    });
    const unsubWater = subscribeToWater(profile.uid, (fetchedWater) => {
      setWaterLogs(fetchedWater);
    });
    return () => { unsub(); unsubWeights(); unsubWater(); };
  }, [profile.uid]);

  useEffect(() => {
    if (profile.notificationsEnabled) {
      const cleanup = scheduleReminders(profile, meals);
      return cleanup;
    }
  }, [profile.notificationsEnabled, profile.uid, meals.length]);

  useEffect(() => {
    updateStreak(profile);
    
    // Check for streak milestone celebration
    const milestones = [7, 14, 30, 50, 100, 365];
    const lastMilestoneShown = localStorage.getItem(`dietsnap_milestone_${profile.uid}`);
    if (profile.streak > 0 && milestones.includes(profile.streak) && lastMilestoneShown !== profile.streak.toString()) {
      setShowStreakModal(true);
      localStorage.setItem(`dietsnap_milestone_${profile.uid}`, profile.streak.toString());
    }
  }, [profile.streak, profile.uid]);

  useEffect(() => {
    // Check for new day
    const today = new Date().toDateString();
    const lastUpdate = profile.lastGoalUpdate ? new Date(profile.lastGoalUpdate).toDateString() : null;
    if (lastUpdate && lastUpdate !== today) {
      setShowGoalModal(true);
    }
  }, [profile.uid, profile.lastGoalUpdate]);

  const handleLogWeight = async () => {
    const w = Number(newWeight);
    if (isNaN(w) || w <= 0) return;
    
    try {
      await logWeight({
        uid: profile.uid,
        weight: w,
        timestamp: new Date().toISOString()
      });
      // Also update current profile weight
      await saveUserProfile({ ...profile, weight: w });
      setShowWeightModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWater = async (amount: number) => {
    try {
      await logWater({
        id: Math.random().toString(36).substr(2, 9),
        uid: profile.uid,
        amount,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleUpdateGoal = async () => {
    const updatedProfile = {
      ...profile,
      goal: Number(newGoal),
      lastGoalUpdate: new Date().toISOString()
    };
    try {
      await saveUserProfile(updatedProfile);
      localStorage.setItem('dietsnap_profile', JSON.stringify(updatedProfile));
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
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
    <div className="min-h-screen bg-black pb-32 relative">
      {/* Header */}
      <div className="w-full bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00FF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.3)]">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black italic">DIET<span className="text-[#00FF00]">SNAP</span></h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#00FF00] font-black uppercase tracking-widest bg-[#00FF00]/10 px-2 rounded-full">Pro</span>
                {profile.streak > 0 && (
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`flex items-center gap-1.5 transition-all text-xs uppercase px-2.5 py-1 rounded-lg border font-black ${
                      profile.streak >= 30 
                        ? 'bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]/40 shadow-[0_0_20px_rgba(0,255,0,0.3)]' 
                        : 'bg-orange-500/20 text-orange-500 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 fill-current ${profile.streak >= 30 ? 'text-[#00FF00]' : 'text-orange-500'}`} />
                    <span className="tracking-tighter">{profile.streak} DAY STREAK</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setView(view === 'today' ? 'history' : 'today')}
              className="p-2.5 bg-gray-800 rounded-xl hover:bg-[#00FF00]/20 hover:text-[#00FF00] transition-colors border border-gray-700"
            >
              {view === 'today' ? <History className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gray-800 border-2 border-gray-700 overflow-hidden flex items-center justify-center hover:border-[#00FF00] transition-all"
            >
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {view === 'today' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
            {/* Left Column: Stats & Progress */}
            <div className="lg:col-span-8 space-y-6">
              {/* Quick Stats Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Trophy className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Target Mode</p>
                      <p className="text-sm font-black italic uppercase text-white">
                        {profile.goalType === 'lose' ? 'Weight Loss 🔥' : profile.goalType === 'gain' ? 'Muscle Gain 💪' : 'Maintenance ⚖️'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Goal</p>
                    <p className="text-lg font-black italic text-[#00FF00]">{profile.goal} <span className="text-[10px] not-italic">kcal</span></p>
                  </div>
                </div>
              </div>

              <CoachAdvice profile={profile} todayMeals={todayMeals} />

              <CalorieProgress 
                consumed={consumedCalories}
                goal={profile.goal}
                protein={todayMeals.reduce((a, m) => a + m.protein, 0)}
                carbs={todayMeals.reduce((a, m) => a + m.carbs, 0)}
                fat={todayMeals.reduce((a, m) => a + m.fat, 0)}
              />

              <WaterTracker 
                waterLogs={waterLogs} 
                target={profile.waterTarget || 2000} 
                onAdd={handleAddWater} 
              />

              <StreakCelebration 
                isOpen={showStreakModal} 
                onClose={() => setShowStreakModal(false)} 
                streak={profile.streak} 
              />

              {/* Weight Tracker Section - More visible on desktop */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-2 md:p-6">
                <div className="p-4"><WeightTracker weights={weights} /></div>
              </div>
            </div>

            {/* Right Column: Recent Meals */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF00]">Today's Logs</h3>
                <Utensils className="w-4 h-4 text-gray-600" />
              </div>

              <div className="space-y-3">
                {todayMeals.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900/30 rounded-[32px] border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-gray-500 font-bold italic">No meals logged yet today.</p>
                  </div>
                ) : (
                  todayMeals.map((meal, i) => (
                    <motion.div 
                      key={meal.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-[#00FF00] transition-colors cursor-pointer"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-2xl shrink-0 transition-transform group-hover:scale-105 ${
                        meal.grade === 'A' ? 'bg-green-500/20 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' :
                        meal.grade === 'B' ? 'bg-blue-500/20 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' :
                        meal.grade === 'C' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {meal.grade}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg truncate leading-tight mb-1">{meal.foodName}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{meal.portion}</span>
                          <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                          <span className="text-[10px] text-gray-600 font-bold">{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black italic text-2xl text-[#00FF00]">{meal.calories}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">kcal</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(historyData).map(([date, data]: [string, any]) => (
                  <div key={date} className="space-y-3 group">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#00FF00] border-l-2 border-[#00FF00] pl-3">{date}</h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-[#00FF00] transition-colors">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-[#00FF00]/10 rounded-2xl">
                            <Flame className="w-6 h-6 text-[#00FF00]" />
                          </div>
                          <div>
                            <p className="text-2xl font-black italic leading-none mb-1">{data.calories} <span className="text-xs not-italic text-gray-500">kcal</span></p>
                            <p className="text-[10px] text-gray-500 uppercase font-black">{data.meals.length} logs</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.meals.map((m: any, idx: number) => (
                          <div key={idx} className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 flex items-center gap-2 group-hover:border-gray-600">
                            <span className="text-[10px] font-black tabular-nums">{m.grade}</span>
                            <span className="text-[10px] text-gray-400 font-bold truncate max-w-[80px]">{m.foodName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

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

      {/* Weight Log Modal */}
      <AnimatePresence>
        {showWeightModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-gray-900 border-2 border-blue-500 rounded-[40px] p-8 space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black italic uppercase">Update Weight</h2>
                  <p className="text-gray-400 font-bold text-xs">Tracking daily helps you stay on course!</p>
                </div>
                <button onClick={() => setShowWeightModal(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>

              <div className="relative">
                <TrendingUp className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-8 h-8" />
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-3xl py-8 pl-18 pr-6 text-4xl font-black italic focus:border-blue-500 outline-none transition-all"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-gray-500">KG</span>
              </div>

              <button
                onClick={handleLogWeight}
                className="w-full bg-blue-500 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all active:scale-95"
              >
                Log New Weight
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button with Menu */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <AnimatePresence>
          {showAddMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 space-y-4"
            >
              <button
                onClick={() => { navigate('/manual-add'); setShowAddMenu(false); }}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl hover:border-[#00FF00] group transition-all w-[180px]"
              >
                <div className="p-2 bg-[#00FF00]/10 rounded-lg group-hover:bg-[#00FF00]/20">
                  <Plus className="w-5 h-5 text-[#00FF00]" />
                </div>
                <span className="text-xs font-black uppercase text-white tracking-widest">Manual Log</span>
              </button>

              <button
                onClick={() => { navigate('/scan'); setShowAddMenu(false); }}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl hover:border-[#00FF00] group transition-all w-[180px]"
              >
                <div className="p-2 bg-[#00FF00]/10 rounded-lg group-hover:bg-[#00FF00]/20">
                  <Camera className="w-5 h-5 text-[#00FF00]" />
                </div>
                <span className="text-xs font-black uppercase text-white tracking-widest">AI Scan</span>
              </button>

              <button
                onClick={() => { setShowWeightModal(true); setShowAddMenu(false); }}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl shadow-xl hover:border-blue-500 group transition-all w-[180px]"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-black uppercase text-white tracking-widest">Log Weight</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all active:scale-90 ${showAddMenu ? 'bg-white text-black rotate-45' : 'bg-[#00FF00] text-black'}`}
        >
          <Plus className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
}
