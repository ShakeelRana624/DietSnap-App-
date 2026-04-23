import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Save, LogOut, User, Camera, Mail, Target, Weight, Ruler, Upload, Calendar, Activity, Flame, Shield, Key } from 'lucide-react';
import { saveUserProfile, logout, resetPassword, updateEmailAddress } from '../lib/firebase';
import { showInstantWelcome } from '../services/notificationService';

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
    notificationsEnabled: profile?.notificationsEnabled || false,
    reminderFrequency: profile?.reminderFrequency || 'medium',
    breakfastTime: profile?.reminderTimes?.breakfast || '09:00',
    lunchTime: profile?.reminderTimes?.lunch || '13:00',
    dinnerTime: profile?.reminderTimes?.dinner || '20:00',
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
      notificationsEnabled: formData.notificationsEnabled,
      reminderFrequency: formData.reminderFrequency as any,
      reminderTimes: {
        breakfast: formData.breakfastTime,
        lunch: formData.lunchTime,
        dinner: formData.dinnerTime,
      },
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
    <div className="min-h-screen bg-black p-6 pb-20 flex flex-col relative w-full">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black italic uppercase tracking-tight">Profile Settings</h1>
          <div className="w-10" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Left Column: Avatar & Essentials */}
            <div className="md:col-span-12 lg:col-span-4 space-y-8">
              <div className="flex flex-col items-center gap-6 bg-gray-900/40 p-10 rounded-[32px] border border-gray-800/50 backdrop-blur-sm">
                <div onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer">
                  <div className="w-40 h-40 rounded-full bg-gray-900 border-4 border-gray-800 overflow-hidden flex items-center justify-center group-hover:border-[#00FF00] transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    {formData.photoURL ? (
                      <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-20 h-20 text-gray-700" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-[10px] font-black uppercase text-white">Change</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#00FF00] rounded-full flex items-center justify-center shadow-lg border-4 border-black">
                    <Upload className="w-6 h-6 text-black" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-black italic truncate max-w-[200px]">{formData.displayName || 'DietSnap User'}</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{profile.email}</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <div className="bg-[#00FF00]/5 border border-[#00FF00]/10 p-6 rounded-3xl space-y-4">
                 <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Calculated Daily Goal</p>
                   <Flame className="w-4 h-4 text-[#00FF00]" />
                 </div>
                 <p className="text-4xl font-black italic text-[#00FF00]">{calculateGoal()} <span className="text-xs not-italic text-gray-500">kcal/day</span></p>
              </div>
            </div>

            {/* Right Column: Detailed Forms */}
            <div className="md:col-span-12 lg:col-span-8 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#00FF00] rounded-full shadow-[0_0_10px_#00FF00]" />
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Personal Data</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00] transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Age</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input required type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00] transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })} className="w-full h-[58px] bg-gray-900 border border-gray-800 rounded-xl px-4 text-white font-bold focus:border-[#00FF00] appearance-none uppercase text-xs">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Weight (kg)</label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00] transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Height (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input required type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[#00FF00] transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Algorithm Tuning</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Activity Level</label>
                    <select value={formData.activityLevel} onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })} className="w-full h-[58px] bg-gray-900 border border-gray-800 rounded-xl px-4 text-white font-bold focus:border-[#00FF00] appearance-none uppercase text-xs">
                      <option value="sedentary">Sedentary (No Exercise)</option>
                      <option value="light">Light (1-3 days/week)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Active (6-7 days/week)</option>
                      <option value="very_active">Very Active (Athlete)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Primary Goal</label>
                    <select value={formData.goalType} onChange={(e) => setFormData({ ...formData, goalType: e.target.value as any })} className="w-full h-[58px] bg-gray-900 border border-gray-800 rounded-xl px-4 text-white font-bold focus:border-[#00FF00] appearance-none uppercase text-xs">
                      <option value="lose">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain">Gain Muscle</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Daily Reminders</h3>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 pr-4">
                      <p className="text-sm font-bold text-white">Enable Push Notifications</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        Reminders for meals & goals. 
                        <span className="text-[#00FF00] block mt-1">Note: If permissions fail, try opening the app in a new tab.</span>
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (typeof Notification === 'undefined') {
                          setError("Notifications are not supported in your current browser.");
                          return;
                        }

                        if (!formData.notificationsEnabled) {
                          try {
                            Notification.requestPermission().then(permission => {
                               if (permission === 'granted') {
                                 setFormData({ ...formData, notificationsEnabled: true });
                                 showInstantWelcome();
                               } else {
                                 setError("Notification permission was denied. If you're in a shared preview, try opening the app in a new tab to grant permissions.");
                               }
                            }).catch(() => {
                               setError("Notification request failed. Browser security might be blocking it in this view. Try opening the app in a new tab.");
                            });
                          } catch (e) {
                             setError("Notifications are restricted in this environment. Please open in a new tab.");
                          }
                        } else {
                          setFormData({ ...formData, notificationsEnabled: false });
                        }
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${formData.notificationsEnabled ? 'bg-[#00FF00]' : 'bg-gray-800'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {formData.notificationsEnabled && (
                    <div className="space-y-2 pt-4 border-t border-gray-800">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Reminder Intensity</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['low', 'medium', 'high', 'custom'].map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => setFormData({ ...formData, reminderFrequency: freq as any })}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              formData.reminderFrequency === freq 
                                ? 'bg-[#00FF00]/10 border-[#00FF00] text-[#00FF00]' 
                                : 'bg-gray-800 border-gray-700 text-gray-500'
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>

                      {formData.reminderFrequency === 'custom' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-4 space-y-4 border-t border-gray-800/50 mt-4"
                        >
                          <p className="text-[10px] font-black uppercase text-[#00FF00] tracking-widest mb-2">Set Your Custom Times</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { id: 'breakfastTime', label: 'Breakfast' },
                              { id: 'lunchTime', label: 'Lunch' },
                              { id: 'dinnerTime', label: 'Dinner' }
                            ].map((slot) => (
                              <div key={slot.id} className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-600 uppercase">{slot.label}</label>
                                <input 
                                  type="time" 
                                  value={(formData as any)[slot.id]} 
                                  onChange={(e) => setFormData({ ...formData, [slot.id]: e.target.value })}
                                  className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-[#00FF00] outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      <p className="text-[9px] text-gray-600 italic mt-2">
                        * Note: Open DietSnap in a new tab for native push notification support.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Account Safety</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button type="button" onClick={handleResetPassword} className="w-full bg-gray-900 border border-gray-800 py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:border-[#00FF00] transition-all">
                      <Key className="w-4 h-4 text-[#00FF00]" />
                      Reset Password
                   </button>
                   <button type="button" onClick={handleLogout} className="w-full bg-red-500/5 text-red-500 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all border border-red-500/20 uppercase text-[10px] tracking-widest">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
              {success && <p className="text-[#00FF00] text-xs font-bold text-center">{success}</p>}

              <div className="pt-6">
                <button type="submit" disabled={loading} className="w-full bg-[#00FF00] text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all disabled:opacity-50 uppercase italic text-xl tracking-tighter">
                  {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
