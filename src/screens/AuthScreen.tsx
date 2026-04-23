import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, LogIn, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { loginWithGoogle, getUserProfile, loginWithEmail, registerWithEmail, resetPassword, setAuthPersistence } from '../lib/firebase';
import { useState, FormEvent } from 'react';

interface Props {
  onComplete: (profile: any) => void;
}

export default function AuthScreen({ onComplete }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'landing' | 'forgot'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await setAuthPersistence(rememberMe);
      const user = await loginWithGoogle();
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          localStorage.setItem('dietsnap_profile', JSON.stringify(profile));
          onComplete(profile);
          navigate('/');
        } else {
          navigate('/onboarding', { state: { user: { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL } } });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage("Password reset link sent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await setAuthPersistence(rememberMe);
      let user;
      if (mode === 'register') {
        user = await registerWithEmail(email, password, name);
      } else {
        user = await loginWithEmail(email, password);
      }

      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          localStorage.setItem('dietsnap_profile', JSON.stringify(profile));
          onComplete(profile);
          navigate('/');
        } else {
          navigate('/onboarding', { state: { user: { uid: user.uid, email: user.email, displayName: user.displayName || name } } });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FF00]/10 blur-[140px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center space-y-8 max-w-md w-full"
      >
        {mode === 'landing' ? (
          <div className="space-y-12">
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 bg-[#00FF00] rounded-[32px] flex items-center justify-center shadow-[0_0_60px_rgba(0,255,0,0.4)]"
              >
                <Zap className="w-16 h-16 text-black fill-current" />
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tighter italic leading-none">
                  DIET<span className="text-[#00FF00]">SNAP</span>
                </h1>
                <div className="flex items-center justify-center gap-2 text-[#00FF00] font-black uppercase tracking-widest text-xs">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Nutrition
                </div>
              </div>

              <p className="text-gray-400 text-lg font-medium leading-relaxed px-4">
                The smartest way to track your calories. Just snap a photo and let our AI handle the rest.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-[#00FF00] border-[#00FF00]' : 'border-gray-700 hover:border-gray-500'}`}
                >
                  {rememberMe && <Check className="w-3 h-3 text-black font-bold" />}
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                  Remember Me
                </span>
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-6 h-6 rotate-90" />
                CONTINUE WITH GOOGLE
              </button>
              
              <button
                onClick={() => setMode('login')}
                className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 border border-gray-800 hover:bg-gray-800 transition-all active:scale-95"
              >
                <Mail className="w-6 h-6" />
                USE EMAIL ADDRESS
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 bg-gray-900/50 border border-gray-800 p-8 rounded-[32px] backdrop-blur-xl">
             <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setMode('landing')}
                  className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-black uppercase"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back
                </button>
                <h2 className="text-xl font-black italic uppercase text-[#00FF00]">
                  {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join DietSnap' : 'Reset Password'}
                </h2>
             </div>

             <form onSubmit={mode === 'forgot' ? handleForgotPassword : handleEmailAuth} className="space-y-4 text-left">
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        required
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700/50 rounded-xl py-4 pl-12 pr-4 text-white focus:border-[#00FF00] outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      required
                      type="email"
                      placeholder="hello@snap.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700/50 rounded-xl py-4 pl-12 pr-4 text-white focus:border-[#00FF00] outline-none transition-all"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                          required
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700/50 rounded-xl py-4 pl-12 pr-4 text-white focus:border-[#00FF00] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 ml-1">
                      <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-[#00FF00] border-[#00FF00]' : 'border-gray-700 hover:border-gray-500'}`}
                      >
                        {rememberMe && <Check className="w-3.5 h-3.5 text-black font-bold" />}
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                        Remember Me
                      </span>
                    </div>
                  </>
                )}

                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                {message && <p className="text-[#00FF00] text-xs font-bold text-center">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00FF00] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(0,255,0,0.4)] transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    mode === 'login' ? 'LOG IN' : mode === 'register' ? 'CREATE ACCOUNT' : 'SEND RESET LINK'
                  )}
                </button>
             </form>
             
             {mode === 'login' && (
               <button 
                  onClick={() => setMode('forgot')}
                  className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest mt-2"
               >
                  Forgot Password?
               </button>
             )}

             <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setMessage(null);
                  setError(null);
                }}
                className="text-gray-500 hover:text-[#00FF00] text-xs font-black uppercase tracking-widest"
             >
                {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
             </button>
          </div>
        )}

        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
          Secure Cloud Backup • Powered by AI
        </p>
      </motion.div>
    </div>
  );
}
