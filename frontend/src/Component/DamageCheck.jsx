import React, { useRef, useState, useEffect } from "react";
import { 
  Camera, Zap, Activity, ShieldAlert, CheckCircle2, 
  Loader2, Play, Pause, RefreshCw, AlertTriangle, Search 
} from "lucide-react";

export default function DamageChecker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [commentary, setCommentary] = useState("");
  const [mode, setMode] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Auto-monitor logic
  useEffect(() => {
    if (mode === "auto" && isCameraActive) {
      const interval = setInterval(() => {
        captureImage();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [mode, isCameraActive]);

  // Sync stream to video element
  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

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
      setIsCameraActive(true); // This triggers the rendering of the <video> element
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Camera access denied. Please check site permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (!isCameraActive || !videoRef.current) return;
    
    setLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Use actual video dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setLoading(false);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        try {
          const res = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: base64Image }),
          });

          const data = await res.json();
          if (res.ok) {
            setCommentary(data.commentary || "No commentary available.");
          } else {
            setCommentary(`⚠️ SEC-ERROR: ${data.error || "Neural link failure"}`);
          }
        } catch (err) {
          setCommentary("⚠️ SEC-ERROR: Backend unreachable.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.82);
  };

  const parseCommentary = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes("**Product Identification**")) {
        return (
          <div key={idx} className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Search className="h-3 w-3" /> Identity Recognized
            </h3>
            <p className="text-white font-bold tracking-tight">{trimmedLine.replace(/.*:\s*/, "")}</p>
          </div>
        );
      }
      if (trimmedLine.includes("⚠️ WARNING")) {
        return (
          <div key={idx} className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-pulse">
            <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> Security Alert
            </h3>
            <p className="text-white font-black tracking-tight uppercase leading-relaxed">{trimmedLine}</p>
          </div>
        );
      }
      if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
          return <p key={idx} className="text-lg font-black text-white uppercase tracking-tighter mt-4 mb-2">{trimmedLine.replaceAll("**", "")}</p>;
      }
      if (trimmedLine.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-3 py-1">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
              <span className="text-slate-300 text-sm font-medium leading-relaxed">{trimmedLine.replace("* ", "")}</span>
            </div>
          );
      }
      return <p key={idx} className="text-slate-400 text-sm py-0.5 font-medium leading-relaxed">{trimmedLine}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 font-sans selection:bg-purple-500/30 overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
              Risk <span className="text-purple-500">Analysis</span>
            </h1>
            <p className="text-slate-500 font-bold tracking-tight uppercase text-xs">AI Neural Packaging Integrity & Damage Matrix</p>
          </div>

          <div className="flex bg-slate-900/50 p-1.5 border border-white/5 rounded-2xl backdrop-blur-xl">
             <button 
               onClick={() => setMode("manual")}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === "manual" ? "bg-purple-600 text-white shadow-xl shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}
             >
               Direct Scan
             </button>
             <button 
               onClick={() => setMode("auto")}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === "auto" ? "bg-purple-600 text-white shadow-xl shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}
             >
               Auto Monitor
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Imaging Core */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className="relative group bg-slate-900/50 rounded-[3rem] p-4 border border-white/5 shadow-2xl overflow-hidden backdrop-blur-3xl min-h-[400px] flex flex-col justify-center">
              <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
                 <div className={`h-2.5 w-2.5 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                 <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{isCameraActive ? 'Live Flux' : 'Sensor Idle'}</span>
              </div>

              <div className="relative aspect-video rounded-[2.5rem] bg-slate-950 overflow-hidden border border-white/5 shadow-inner flex items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-full h-full object-cover" 
                    />
                    {/* Scanning Animation */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent absolute top-0 left-0 animate-[scan_3s_linear_infinite]"></div>
                      <div className="absolute inset-0 border-[20px] border-slate-950/20"></div>
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500 m-8"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500 m-8"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500 m-8"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500 m-8"></div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                    <div className="h-20 w-20 bg-slate-900 rounded-full flex items-center justify-center border border-white/5">
                      <Camera className="h-10 w-10 text-slate-800" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">Connect Visual Input</p>
                  </div>
                )}
                
                {loading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 z-30">
                     <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                     <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest animate-pulse">Neural Processing...</p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {!isCameraActive ? (
                <button 
                  onClick={startCamera}
                  className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  <Play className="h-5 w-5 fill-current" /> Initialize Sensor
                </button>
              ) : (
                <>
                  {mode === "manual" && (
                    <button 
                      onClick={captureImage}
                      disabled={loading}
                      className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="h-5 w-5 fill-current" /> Capture & Analyze
                    </button>
                  )}
                  <button 
                    onClick={stopCamera}
                    className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95"
                  >
                    <Pause className="h-5 w-5 fill-current" /> Suspend Flux
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Results Intelligence */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className="h-full bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8 flex flex-col shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] min-h-[500px]">
               <div className="flex items-center justify-between pb-6 border-b border-white/5">
                 <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-purple-500" />
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Inspection Matrix</h2>
                 </div>
                 <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-lg">
                   {loading ? 'CALCULATING' : 'READY'}
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-800">
                 {commentary ? (
                   <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {parseCommentary(commentary)}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20 py-20">
                     <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center border border-white/5">
                       <Zap className="h-10 w-10 text-slate-400" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center max-w-[200px] leading-relaxed">Awaiting Data Extraction Protocol</p>
                   </div>
                 )}
               </div>

               {commentary && (
                 <div className="pt-8 border-t border-white/5 flex gap-4">
                   <button 
                     onClick={captureImage}
                     className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                   >
                     <RefreshCw className="h-4 w-4" /> Run Rediagnosis
                   </button>
                   <button 
                     onClick={() => setCommentary("")}
                     className="px-6 py-4 bg-slate-950 hover:bg-slate-900 text-slate-500 rounded-2xl transition-all"
                   >
                     Clear
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}