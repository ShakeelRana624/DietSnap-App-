import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, Weight, Ruler, Target, User, Activity, Flame, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { saveUserProfile } from '../lib/firebase';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const location = useLocation();
  const firebaseUser = location.state?.user;
  const [step, setStep] = useState(-2);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goalType: 'maintain' as 'lose' | 'maintain' | 'gain',
    goal: '2000'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (step === 1) {
      const w = Number(formData.weight);
      if (units === 'metric' && (w < 20 || w > 300)) return "Please enter a valid weight (20-300kg)";
      if (units === 'imperial' && (w < 44 || w > 660)) return "Please enter a valid weight (44-660lbs)";
    }
    if (step === 2) {
      const h = Number(formData.height);
      if (units === 'metric' && (h < 100 || h > 250)) return "Please enter a valid height (100-250cm)";
      if (units === 'imperial' && (h < 39 || h > 98)) return "Please enter a valid height (39-98in)";
    }
    if (step === 3) {
      const a = Number(formData.age);
      if (a < 12 || a > 100) return "Please enter a valid age (12-100)";
    }
    return null;
  };

  const calculateGoal = () => {
    const w = Number(formData.weight);
    const h = Number(formData.height);
    const a = Number(formData.age);
    
    // Weight in kg, height in cm
    let weightKg = units === 'metric' ? w : w * 0.453592;
    let heightCm = units === 'metric' ? h : h * 2.54;

    // BMR (Mifflin-St Jeor)
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * a);
    if (formData.gender === 'male') bmr += 5;
    else if (formData.gender === 'female') bmr -= 161;
    else bmr -= 78; // average

    // TDEE
    const factors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    let tdee = bmr * factors[formData.activityLevel];

    // Goal Adjustment
    if (formData.goalType === 'lose') tdee -= 500;
    else if (formData.goalType === 'gain') tdee += 500;

    return Math.max(1200, Math.round(tdee));
  };

  const handleNext = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    
    const profile: UserProfile = {
      uid: firebaseUser?.uid || 'local-user-' + Math.random().toString(36).substr(2, 9),
      displayName: firebaseUser?.displayName || 'Guest User',
      email: firebaseUser?.email || 'guest@dietsnap.local',
      photoURL: firebaseUser?.photoURL || '',
      weight: Number(formData.weight),
      height: Number(formData.height),
      age: Number(formData.age),
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      goalType: formData.goalType,
      goal: calculateGoal(),
      streak: 0,
      lastGoalUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      if (firebaseUser) {
        await saveUserProfile(profile);
      }
      localStorage.setItem('dietsnap_profile', JSON.stringify(profile));
      localStorage.setItem('dietsnap_units', units);
      onComplete(profile);
    } catch (err: any) {
      setError("Failed to save profile. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col justify-center w-full">
      <div className="max-w-2xl mx-auto w-full bg-gray-900/20 md:p-12 p-6 rounded-[32px] md:rounded-[40px] border border-gray-800/30 backdrop-blur-md">
        <div className="mb-10">
          <div className="flex gap-2 mb-6">
            {[-2, -1, 0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#00FF00] shadow-[0_0_10px_#00FF00]' : 'bg-gray-800'}`}
              />
            ))}
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
            {step === -2 && "AI Food Recognition"}
            {step === -1 && "Smart Tracking"}
            {step === 0 && "Choose Units"}
            {step === 1 && `Weight (${units === 'metric' ? 'kg' : 'lbs'})`}
            {step === 2 && `Height (${units === 'metric' ? 'cm' : 'in'})`}
            {step === 3 && "How old are you?"}
            {step === 4 && "Gender"}
            {step === 5 && "Activity Level"}
            {step === 6 && "Your Goal"}
          </h2>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-8"
        >
          {step === -2 && (
            <div className="space-y-8 py-4">
              <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-800 group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF00]/10 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -inset-8 bg-[#00FF00] blur-3xl rounded-full"
                    />
                    <Camera className="w-24 h-24 text-[#00FF00] relative z-10" />
                    <motion.div 
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-4 -right-4 bg-gray-800 border border-[#00FF00]/30 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      <Zap className="w-3 h-3 text-[#00FF00]" />
                      <span className="text-[10px] font-black text-white italic">SCANNING...</span>
                    </motion.div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#00FF00] mb-1">PRO Feature</p>
                  <p className="text-xs text-white font-bold">Snap a photo. Our AI identifies food and calculates macros instantly.</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-gray-400 font-medium text-lg leading-relaxed px-4">
                  Forget manual logging. Just point your camera at your meal and let <span className="text-white italic font-black text-xl">DIETSNAP</span> handle the rest.
                </p>
              </div>
            </div>
          )}

          {step === -1 && (
            <div className="space-y-8 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 aspect-square rounded-3xl border-2 border-gray-800 p-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Personalized<br/>Goals</p>
                </div>
                <div className="bg-gray-900 aspect-square rounded-3xl border-2 border-gray-800 p-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-[#00FF00]/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-8 h-8 text-[#00FF00]" />
                  </div>
                  <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Real-time<br/>Insights</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-400 font-medium text-lg leading-relaxed px-4">
                  We determine your ideal calorie intake based on your unique body metrics and activity levels.
                </p>
                <div className="flex items-center justify-center gap-3 bg-gray-900 border border-gray-800 py-3 px-6 rounded-full mx-auto w-fit">
                   <div className="w-3 h-3 bg-[#00FF00] rounded-full animate-ping" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Dynamic Calculation Mode Active</span>
                </div>
              </div>
            </div>
          )}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setUnits('metric')}
                className={`p-10 rounded-3xl border-2 font-black italic text-2xl transition-all ${units === 'metric' ? 'bg-[#00FF00] text-black border-[#00FF00] shadow-[0_0_30px_rgba(0,255,0,0.2)]' : 'bg-gray-900 text-white border-gray-800 hover:border-gray-700'}`}
              >
                METRIC <br/><span className="text-sm not-italic opacity-60">kg/cm</span>
              </button>
              <button
                onClick={() => setUnits('imperial')}
                className={`p-10 rounded-3xl border-2 font-black italic text-2xl transition-all ${units === 'imperial' ? 'bg-[#00FF00] text-black border-[#00FF00] shadow-[0_0_30px_rgba(0,255,0,0.2)]' : 'bg-gray-900 text-white border-gray-800 hover:border-gray-700'}`}
              >
                IMPERIAL <br/><span className="text-sm not-italic opacity-60">lbs/in</span>
              </button>
            </div>
          )}

          {(step === 1 || step === 2 || step === 3) && (
            <div className="relative group">
              {step === 1 && <Weight className="absolute left-6 top-1/2 -translate-y-1/2 text-[#00FF00] w-8 h-8" />}
              {step === 2 && <Ruler className="absolute left-6 top-1/2 -translate-y-1/2 text-[#00FF00] w-8 h-8" />}
              {step === 3 && <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#00FF00] w-8 h-8" />}
              
              <input
                type="number"
                autoFocus
                placeholder={step === 1 ? `Weight in ${units === 'metric' ? 'kg' : 'lbs'}` : step === 2 ? `Height in ${units === 'metric' ? 'cm' : 'in'}` : "Age"}
                value={step === 1 ? formData.weight : step === 2 ? formData.height : formData.age}
                onChange={(e) => setFormData({ ...formData, [step === 1 ? 'weight' : step === 2 ? 'height' : 'age']: e.target.value })}
                className="w-full bg-gray-900/50 border-4 border-gray-800 rounded-[32px] py-10 pl-20 pr-10 text-5xl font-black italic focus:border-[#00FF00] outline-none transition-all placeholder:text-gray-800 tabular-nums"
              />
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['male', 'female', 'other'].map((g) => (
                <button
                  key={g}
                  onClick={() => setFormData({ ...formData, gender: g as any })}
                  className={`p-8 rounded-3xl border-2 font-black italic text-xl uppercase transition-all ${formData.gender === g ? 'bg-[#00FF00] text-black border-[#00FF00] shadow-[0_0_30px_rgba(0,255,0,0.2)]' : 'bg-gray-900 text-white border-gray-800 hover:border-gray-700'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                { id: 'light', label: 'Light', desc: '1-3 days/week' },
                { id: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
                { id: 'active', label: 'Active', desc: '6-7 days/week' },
                { id: 'very_active', label: 'Very Active', desc: 'Athlete level' },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setFormData({ ...formData, activityLevel: a.id as any })}
                  className={`p-5 rounded-[24px] border-2 text-left transition-all flex justify-between items-center ${formData.activityLevel === a.id ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'bg-gray-900 text-white border-gray-800 hover:border-gray-700'}`}
                >
                  <div>
                    <div className="font-black italic text-xl uppercase leading-none mb-1">{a.label}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{a.desc}</div>
                  </div>
                  {formData.activityLevel === a.id && <Activity className="w-6 h-6 animate-pulse" />}
                </button>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'lose', label: 'Lose Weight', icon: <Flame className="w-8 h-8" /> },
                { id: 'maintain', label: 'Maintain', icon: <Target className="w-8 h-8" /> },
                { id: 'gain', label: 'Muscle Gain', icon: <Activity className="w-8 h-8" /> },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setFormData({ ...formData, goalType: g.id as any })}
                  className={`p-10 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all text-center ${formData.goalType === g.id ? 'bg-[#00FF00] text-black border-[#00FF00] shadow-[0_0_30px_rgba(0,255,0,0.2)]' : 'bg-gray-900 text-white border-gray-800 hover:border-gray-700'}`}
                >
                  <div className={formData.goalType === g.id ? 'text-black' : 'text-[#00FF00]'}>{g.icon}</div>
                  <div className="font-black italic text-lg uppercase leading-tight">{g.label}</div>
                </button>
              ))}
            </div>
          )}

          <div className="pt-8">
            <button
              onClick={() => step < 6 ? handleNext() : handleSubmit()}
              disabled={loading || (step > 0 && step < 4 && !formData[step === 1 ? 'weight' : step === 2 ? 'height' : 'age' as any] as any)}
              className="w-full bg-[#00FF00] text-black font-black py-6 rounded-[24px] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 text-xl uppercase italic tracking-tighter"
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {step === -2 ? "Show Me More" : step === -1 ? "Let's Get Started" : step < 6 ? "Next Move" : "Personalize My AI"}
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-xs font-bold text-center mt-4 uppercase tracking-widest">{error}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
