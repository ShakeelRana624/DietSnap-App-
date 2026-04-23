import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Save, LogOut, User, Camera, Mail, Target, Weight, Ruler, Upload, Calendar, Activity, Flame, Shield, Key } from 'lucide-react';
import { saveUserProfile, logout, resetPassword, updateEmailAddress } from '../lib/firebase';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export default function ProfileScreen({ profile, onUpdate }: Props) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    photoURL: profile?.photoURL || '',
    weight: profile?.weight?.toString() || '0',
    height: profile?.height?.toString() || '0',
    age: profile?.age?.toString() || '0',
    gender: profile?.gender || 'male',
    activityLevel: profile?.activityLevel || 'moderate',
    goalType: profile?.goalType || 'maintain',
    goal: profile?.goal?.toString() || '2000',
  });
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size too large. Under 2MB pls!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, photoURL: base64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const calculateGoal = () => {
    const w = Number(formData.weight);
    const h = Number(formData.height);
    const a = Number(formData.age);
    let weightKg = w;
    let heightCm = h;
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * a);
    if (formData.gender === 'male') bmr += 5;
    else if (formData.gender === 'female') bmr -= 161;
    else bmr -= 78;
    const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    let tdee = bmr * factors[formData.activityLevel];
    if (formData.goalType === 'lose') tdee -= 500;
    else if (formData.goalType === 'gain') tdee += 500;
    return Math.round(tdee);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const updatedProfile: UserProfile = {
      ...profile,
      displayName: formData.displayName,
      photoURL: formData.photoURL,
      weight: Number(formData.weight),
      height: Number(formData.height),
      age: Number(formData.age),
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      goalType: formData.goalType,
      goal: calculateGoal(),
    };
    try {
      await saveUserProfile(updatedProfile);
      onUpdate(updatedProfile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(profile.email);
      setSuccess("Password reset email sent!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-black p-6 pb-20 flex flex-col max-w-md mx-auto relative">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black italic uppercase tracking-tight">Profile</h1>
        <div className="w-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6">
            <div onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-gray-900 border-4 border-gray-800 overflow-hidden flex items-center justify-center group-hover:border-[#00FF00] transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-700" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-[10px] font-black uppercase text-white">Change</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#00FF00] rounded-full flex items-center justify-center shadow-lg border-4 border-black">
                <Upload className="w-5 h-5 text-black" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00FF00]">Personal Info</h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input required type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input required type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })} className="w-full h-[58px] bg-gray-900 border border-gray-800 rounded-xl px-4 text-white font-bold focus:border-[#00FF00] appearance-none uppercase text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input required type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input required type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00]" />
                </div>
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00FF00] pt-4">Fitness Plan</h3>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Activity Level</label>
              <select value={formData.activityLevel} onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })} className="w-full h-[58px] bg-gray-900 border border-gray-800 rounded-xl px-4 text-white font-bold focus:border-[#00FF00] appearance-none uppercase text-sm">
                <option value="sedentary">Sedentary (No Exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (Athlete)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Primary Goal</label>
              <select value={formData.goalType} onChange={(e) => setFormData({ ...formData, goalType: e.target.value as any })} className="w-full h-[58px] bg-gray-900 border border-gray-800 rounded-xl px-4 text-white font-bold focus:border-[#00FF00] appearance-none uppercase text-sm">
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Muscle</option>
              </select>
            </div>

            <div className="bg-[#00FF00]/10 border border-[#00FF00]/20 p-4 rounded-xl mt-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black uppercase text-[#00FF00]">Calculated Daily Goal</p>
                <p className="text-2xl font-black italic text-[#00FF00]">{calculateGoal()} kcal</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00FF00] pt-4">Security</h3>
          <div className="grid grid-cols-1 gap-3">
             <button type="button" onClick={handleResetPassword} className="w-full bg-gray-900 border border-gray-800 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold hover:bg-gray-800 transition-all">
                <Key className="w-4 h-4 text-[#00FF00]" />
                Reset Password Via Email
             </button>
             <button type="button" onClick={() => navigate('/auth')} className="w-full bg-gray-900 border border-gray-800 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold hover:bg-gray-800 transition-all opacity-50 cursor-not-allowed">
                <Mail className="w-4 h-4 text-[#00FF00]" />
                Change Email (Coming Soon)
             </button>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          {success && <p className="text-[#00FF00] text-xs font-bold text-center">{success}</p>}

          <div className="pt-6 space-y-4">
            <button type="submit" disabled={loading} className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all disabled:opacity-50 uppercase italic tracking-wider">
              {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : "Update Profile"}
            </button>

            <button type="button" onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/20 uppercase text-xs tracking-widest">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
