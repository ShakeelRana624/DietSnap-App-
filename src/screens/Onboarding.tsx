import { useState } from 'react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, Weight, Ruler, Target } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    goal: '2000'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    
    const profile: UserProfile = {
      uid: 'local-user-' + Math.random().toString(36).substr(2, 9),
      displayName: 'Guest User',
      email: 'guest@dietsnap.local',
      weight: Number(formData.weight),
      height: Number(formData.height),
      goal: Number(formData.goal),
      lastGoalUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('dietsnap_profile', JSON.stringify(profile));
    onComplete(profile);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-12">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#00FF00]' : 'bg-gray-800'}`}
            />
          ))}
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight">
          {step === 1 && "Current Weight"}
          {step === 2 && "Current Height"}
          {step === 3 && "Daily Goal"}
        </h2>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        {step === 1 && (
          <div className="relative">
            <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              placeholder="Weight (kg)"
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
              placeholder="Height (cm)"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full bg-gray-900 border-2 border-gray-800 rounded-2xl py-6 pl-14 pr-6 text-2xl font-bold focus:border-[#00FF00] outline-none transition-all"
            />
          </div>
        )}

        {step === 3 && (
          <div className="relative">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              placeholder="Calories (kcal)"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full bg-gray-900 border-2 border-gray-800 rounded-2xl py-6 pl-14 pr-6 text-2xl font-bold focus:border-[#00FF00] outline-none transition-all"
            />
          </div>
        )}

        <button
          onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
          disabled={loading || (step === 1 && !formData.weight) || (step === 2 && !formData.height) || (step === 3 && !formData.goal)}
          className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {step < 3 ? "Next Step" : "Get Started"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
