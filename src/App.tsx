import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from './types';

// Screens
import AuthScreen from './screens/AuthScreen';
import Dashboard from './screens/Dashboard';
import Scanner from './screens/Scanner';
import ResultScreen from './screens/ResultScreen';
import ShareScreen from './screens/ShareScreen';
import Onboarding from './screens/Onboarding';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('dietsnap_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    setLoading(false);
  }, []);

  const handleSetProfile = (newProfile: UserProfile) => {
    localStorage.setItem('dietsnap_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00FF00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00FF00] selection:text-black">
        <Routes>
          <Route 
            path="/auth" 
            element={profile ? <Navigate to="/" /> : <AuthScreen onComplete={() => {
              // Just a landing page now, onboarding handles the rest
            }} />} 
          />
          <Route 
            path="/onboarding" 
            element={!profile ? <Onboarding onComplete={handleSetProfile} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={
              profile ? <Dashboard profile={profile} /> : <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/scan" 
            element={profile ? <Scanner /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/result" 
            element={profile ? <ResultScreen /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/share" 
            element={profile ? <ShareScreen /> : <Navigate to="/auth" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}
