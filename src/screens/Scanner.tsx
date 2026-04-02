import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Zap, Loader2, Info } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function Scanner() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [detectedData, setDetectedData] = useState<any>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Ensure video is ready
    if (videoRef.current.readyState < 2) {
      setError("Camera not ready. Please wait.");
      return;
    }

    setScanning(true);
    setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Downscale for better performance and to avoid payload limits
    const MAX_DIM = 1024;
    let width = video.videoWidth;
    let height = video.videoHeight;

    if (width > height) {
      if (width > MAX_DIM) {
        height = Math.round(height * (MAX_DIM / width));
        width = MAX_DIM;
      }
    } else {
      if (height > MAX_DIM) {
        width = Math.round(width * (MAX_DIM / height));
        height = MAX_DIM;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, width, height);
    
    // Use a slightly lower quality to reduce base64 string length
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    if (!base64Image) {
      setError("Failed to capture image. Please try again.");
      setScanning(false);
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Analyze this food item. Identify the food and provide nutrition data for Small, Medium, and Large portions. Return JSON format with foodName, calories, protein, carbs, fat, and a health grade (A-F) based on nutritional density. Focus on accuracy for the specific food shown." },
              { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: { type: Type.STRING },
              grade: { type: Type.STRING, description: "A, B, C, D, or F" },
              portions: {
                type: Type.OBJECT,
                properties: {
                  Small: { 
                    type: Type.OBJECT, 
                    properties: { calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } } 
                  },
                  Medium: { 
                    type: Type.OBJECT, 
                    properties: { calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } } 
                  },
                  Large: { 
                    type: Type.OBJECT, 
                    properties: { calories: { type: Type.NUMBER }, protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } } 
                  }
                }
              }
            },
            required: ["foodName", "grade", "portions"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setDetectedData(result);
      setShowPortionModal(true);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Try again.");
    } finally {
      setScanning(false);
    }
  };

  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);
  const [selectedPortion, setSelectedPortion] = useState<string | null>(null);

  const startAd = (portion: string) => {
    setSelectedPortion(portion);
    setShowPortionModal(false);
    setShowAd(true);
    setAdTimer(15);
  };

  useEffect(() => {
    let timer: any;
    if (showAd && adTimer > 0) {
      timer = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (showAd && adTimer === 0) {
      const nutrition = detectedData.portions[selectedPortion!];
      navigate('/result', { 
        state: { 
          meal: {
            foodName: detectedData.foodName,
            grade: detectedData.grade,
            portion: selectedPortion,
            ...nutrition,
            timestamp: new Date().toISOString()
          }
        } 
      });
    }
    return () => clearInterval(timer);
  }, [showAd, adTimer, navigate, detectedData, selectedPortion]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Ad Simulation Overlay */}
      <AnimatePresence>
        {showAd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full font-black italic text-[#00FF00]">
              {adTimer}s
            </div>
            
            <div className="space-y-8 max-w-sm mx-auto">
              <div className="w-24 h-24 bg-[#00FF00] rounded-[32px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(0,255,0,0.3)] animate-bounce">
                <Zap className="w-12 h-12 text-black fill-current" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                  Unlocking <br/>
                  <span className="text-[#00FF00]">Premium Score</span>
                </h2>
                <p className="text-gray-400 font-bold text-lg">
                  Watch this short video to get your meal's detailed health grade & macros.
                </p>
              </div>

              <div className="w-full h-48 bg-gray-900 border-2 border-gray-800 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF00]/10 to-transparent"></div>
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-[#00FF00] animate-spin mx-auto" />
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Ad Loading...</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                Sponsored content • DietSnap Ads
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera View */}
      <div className="relative flex-1 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay UI */}
        <div className="absolute inset-0 border-[20px] sm:border-[40px] border-black/40 pointer-events-none">
          <div className="w-full h-full border-2 border-[#00FF00]/30 rounded-3xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00FF00] rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00FF00] rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00FF00] rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00FF00] rounded-br-xl"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-black/50 backdrop-blur-lg rounded-full flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="bg-[#00FF00] text-black px-4 py-1 rounded-full font-black italic text-xs uppercase tracking-widest animate-pulse">
            Live AI Scan
          </div>
        </div>

        {error && (
          <div className="absolute top-24 left-6 right-6 bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6">
          <p className="text-white/70 font-bold uppercase tracking-widest text-xs">Point at food and tap scan</p>
          <button 
            onClick={captureAndAnalyze}
            disabled={scanning}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-90 transition-all disabled:opacity-50"
          >
            {scanning ? (
              <Loader2 className="w-12 h-12 text-black animate-spin" />
            ) : (
              <div className="w-20 h-20 border-4 border-black rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-black fill-current" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Portion Modal */}
      <AnimatePresence>
        {showPortionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end p-6"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="w-full max-w-md mx-auto bg-gray-900 rounded-3xl p-8 space-y-6 border-t-4 border-[#00FF00]"
            >
              <div className="text-center">
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Select Portion</h3>
                <p className="text-gray-400 font-bold">{detectedData?.foodName}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {['Small', 'Medium', 'Large'].map((p) => (
                  <button
                    key={p}
                    onClick={() => startAd(p)}
                    className="w-full bg-gray-800 hover:bg-[#00FF00] hover:text-black p-5 rounded-2xl font-black italic text-xl transition-all flex justify-between items-center group"
                  >
                    <span>{p}</span>
                    <span className="text-sm opacity-50 group-hover:opacity-100">{detectedData?.portions[p].calories} kcal</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowPortionModal(false)}
                className="w-full py-4 text-gray-500 font-bold uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
