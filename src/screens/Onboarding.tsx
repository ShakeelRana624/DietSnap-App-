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
  const [step, setStep] = useState(0);
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
    <div className="min-h-screen bg-black p-6 flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-12">
        <div className="flex gap-2 mb-4">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#00FF00]' : 'bg-gray-800'}`}
            />
          ))}
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight">
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
        className="space-y-8"
      >
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUnits('metric')}
              className={`p-6 rounded-2xl border-2 font-black italic text-xl transition-all ${units === 'metric' ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'bg-gray-900 text-white border-gray-800'}`}
            >
              METRIC (kg/cm)
            </button>
            <button
              onClick={() => setUnits('imperial')}
              className={`p-6 rounded-2xl border-2 font-black italic text-xl transition-all ${units === 'imperial' ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'bg-gray-900 text-white border-gray-800'}`}
            >
              IMPERIAL (lbs/in)
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="relative">
            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              placeholder={`Weight in ${units === 'metric' ? 'kg' : 'lbs'}`}
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full bg-gray-900 border-2 border-gray-800 rounded-2xl py-6 pl-14 pr-6 text-2xl font-bold focus:border-[#00FF00] outline-none transition-all"
            />
          </div>
        )}

        {step === 2 && (
          <div className="relative">
            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              placeholder={`Height in ${units === 'metric' ? 'cm' : 'in'}`}
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full bg-gray-900 border-2 border-gray-800 rounded-2xl py-6 pl-14 pr-6 text-2xl font-bold focus:border-[#00FF00] outline-none transition-all"
            />
          </div>
        )}

        {step === 3 && (
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full bg-gray-900 border-2 border-gray-800 rounded-2xl py-6 pl-14 pr-6 text-2xl font-bold focus:border-[#00FF00] outline-none transition-all"
            />
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 gap-4">
            {['male', 'female', 'other'].map((g) => (
              <button
                key={g}
                onClick={() => setFormData({ ...formData, gender: g as any })}
                className={`p-5 rounded-2xl border-2 font-black italic text-xl uppercase transition-all ${formData.gender === g ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'bg-gray-900 text-white border-gray-800'}`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-1 gap-2">
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
                className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.activityLevel === a.id ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'bg-gray-900 text-white border-gray-800'}`}
              >
                <div className="font-black italic text-lg uppercase">{a.label}</div>
                <div className="text-xs opacity-70 font-bold">{a.desc}</div>
              </button>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'lose', label: 'Lose Weight', icon: <Flame className="w-6 h-6" /> },
              { id: 'maintain', label: 'Maintain', icon: <Target className="w-6 h-6" /> },
              { id: 'gain', label: 'Gain Muscle', icon: <Activity className="w-6 h-6" /> },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setFormData({ ...formData, goalType: g.id as any })}
                className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${formData.goalType === g.id ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'bg-gray-900 text-white border-gray-800'}`}
              >
                {g.icon}
                <div className="font-black italic text-xl uppercase">{g.label}</div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => step < 6 ? handleNext() : handleSubmit()}
          disabled={loading || (step !== 0 && step !== 4 && step !== 5 && step !== 6 && !formData[step === 1 ? 'weight' : step === 2 ? 'height' : 'age' as any] as any)}
          className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {step < 6 ? "Next Step" : "Calculate My Plan"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
