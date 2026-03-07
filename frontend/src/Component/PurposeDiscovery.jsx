import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, RefreshCw, Scan, Sparkles, BookOpen, FileText, X } from "lucide-react";
import ReactMarkdown from 'react-markdown';

const PurposeDiscovery = () => {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  // Sync stream to video element
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: "environment" 
        } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      setError("");
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access denied. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capture = () => {
    if (!showCamera || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setImage(file);
      stopCamera();
      analyzePurpose(file);
    }, "image/jpeg", 0.95);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      analyzePurpose(file);
    }
  };

  const analyzePurpose = async (file) => {
    setLoading(true);
    setError("");
    setPurpose("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/explain-purpose", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setPurpose(data.purpose);
      }
    } catch (err) {
      setError("Failed to connect to AI Intelligence Core.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" /> AI Pharmacologist Active
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
            Purpose <span className="text-purple-500">Discovery</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto uppercase text-xs tracking-[0.2em]">
            Deconstruct pharmaceutical intent using neural vision analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Diagnostic Chamber */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative group bg-slate-900/50 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {showCamera ? (
                <div className="w-full h-full animate-in fade-in zoom-in duration-300 relative">
                  <div className="relative aspect-video rounded-3xl bg-black overflow-hidden border border-white/10">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 pointer-events-none border-[10px] border-black/20"></div>
                  </div>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                    <button 
                      onClick={capture}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-full shadow-2xl transition-transform active:scale-90 border border-white/20"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={stopCamera}
                      className="bg-slate-800 hover:bg-slate-700 text-white p-5 rounded-full shadow-2xl transition-transform active:scale-90 border border-white/20"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
                  <div 
                    className="w-full h-96 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center bg-slate-950/50 group relative overflow-hidden"
                  >
                    {image ? (
                      <>
                        <img src={URL.createObjectURL(image)} alt="Medicine" className="w-full h-full object-contain rounded-[1.5rem] p-4" />
                        <div 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer gap-4"
                          onClick={() => { setImage(null); setPurpose(""); }}
                        >
                           <RefreshCw className="h-10 w-10 text-purple-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Reset Neural Analysis</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8 space-y-8">
                        <div className="bg-slate-800/50 p-6 rounded-3xl inline-block border border-white/5">
                          <Upload className="h-12 w-12 text-purple-400" />
                        </div>
                        <div className="space-y-6">
                           <div>
                            <p className="text-xl font-black text-white uppercase italic tracking-tighter">Initiate Scan</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Choose visual input source</p>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <button 
                              onClick={() => fileInputRef.current.click()}
                              className="w-full py-4 bg-slate-800/80 hover:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/5"
                            >
                              <FileText className="h-4 w-4 text-blue-400" /> Upload from System
                            </button>
                            <button 
                              onClick={startCamera}
                              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 active:scale-95"
                            >
                              <Camera className="h-4 w-4" /> Open Neural Camera
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
                capture="environment"
              />
              
              {loading && (
                <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 animate-in fade-in">
                  <div className="relative">
                    <Loader2 className="h-20 w-20 text-purple-500 animate-spin" />
                    <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-black tracking-[0.5em] text-purple-400 uppercase italic">Decoding</span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Accessing Medical Knowledge Base...</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4 animate-in slide-in-from-bottom duration-500">
                <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Diagnostic Failure</p>
                  <p className="text-xs text-rose-400/80 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Intelligence Output */}
          <div className="lg:col-span-7 h-full">
            <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl min-h-[450px] relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 -m-20 h-80 w-80 bg-purple-500/5 blur-[100px] rounded-full"></div>
              
              <div className="relative flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                    <BookOpen className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Discovery Report</h3>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Validated AI Findings</p>
                  </div>
                </div>

                {purpose ? (
                  <div className="prose prose-invert prose-purple max-w-none animate-in fade-in slide-in-from-right duration-700">
                    <div className="bg-slate-950/50 rounded-3xl p-8 border border-white/5 shadow-inner">
                      <ReactMarkdown 
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 border-b border-white/5 pb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-black text-purple-400 uppercase tracking-widest mt-8 mb-4 flex items-center gap-2" {...props} />,
                          p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed font-medium mb-4" {...props} />,
                          ul: ({node, ...props}) => <ul className="space-y-3 mb-6" {...props} />,
                          li: ({node, ...props}) => (
                            <li className="flex items-start gap-3 text-slate-400 font-medium">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                              <span>{props.children}</span>
                            </li>
                          ),
                          strong: ({node, ...props}) => <strong className="text-white font-black" {...props} />
                        }}
                      >
                        {purpose}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30 select-none">
                    <Database className="h-16 w-16 text-slate-700" />
                    <div>
                      <p className="text-xl font-black text-slate-700 uppercase italic tracking-tighter">Awaiting Intelligence Feed</p>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Complete a scan to populate discovery metrics</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Database = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
)

export default PurposeDiscovery;
