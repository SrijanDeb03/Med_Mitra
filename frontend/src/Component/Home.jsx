import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Zap, ChevronRight, Play } from 'lucide-react';

function Home() {
    const navigate = useNavigate();

    const handleSignInClick = () => {
      navigate('/sign-in');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-purple-500/30 overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full animate-pulse delay-700"></div>
          </div>

          {/* Hero Section */}
          <section className="relative pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
                  <Zap className="h-4 w-4 fill-current" />
                  Next-Gen Pharmaceutical Oversight
                </div>
                
                <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase italic">
                  Advanced <span className="text-purple-500 underline decoration-purple-500/30 underline-offset-8">Medical</span> Care System
                </h2>
                
                <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                  Ensure security, integrity, and compliance across your entire medical stockpile with our AI-powered verification engine.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <button 
                    onClick={handleSignInClick}
                    className="group relative px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-purple-500/20 active:scale-95 flex items-center gap-3"
                  >
                    Initiate System <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 backdrop-blur-xl border border-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center gap-3">
                    <Play className="h-4 w-4 fill-current" />
                    How it Works
                  </button>
                </div>
              </div>

              <div className="lg:w-1/2 relative group">
                <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img 
                  src="./src/assets/homeimage1.jpg" 
                  alt="System Interface" 
                  className="relative mx-auto rounded-[3rem] shadow-2xl border border-white/10 ring-1 ring-white/10 group-hover:scale-[1.02] transition-transform duration-500" 
                />
              </div>
            </div>
          </section>
    
          {/* Core Modules Grid */}
          <section className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Core Operating Modules</h3>
                <div className="h-1.5 w-24 bg-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> 
                {/* Module 1 */}
                <div className="group bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all duration-300 shadow-2xl">
                  <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-blue-400" />
                  </div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Scan & Verify</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">Multimodal extraction protocols for rapid stock entry and verification.</p>
                </div> 
    
                {/* Module 2 */}
                <div className="group bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-rose-500/30 transition-all duration-300 shadow-2xl">
                  <div className="h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Activity className="h-8 w-8 text-rose-400" />
                  </div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Damage Matrix</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">Neural network analysis of packaging integrity and consumable safety.</p>
                </div> 
    
                {/* Module 3 */}
                <div className="group bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 shadow-2xl">
                  <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-emerald-400 fill-current" />
                  </div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Auto Logistics</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">Automated stockpile rebalancing and proactive expiration alerts.</p>
                </div>
              </div>
            </div>
          </section> 
    
          {/* FAQ Section */}
          <section className="py-24 px-6 bg-slate-900/30">
            <div className="max-w-4xl mx-auto space-y-12">
              <h3 className="text-4xl font-black text-white text-center uppercase italic tracking-tighter">System Intelligence FAQ</h3>
              
              <div className="grid gap-6">
                {[
                  {
                    q: "Automated QA Protocols",
                    a: "The system autonomously iterates through stock quality, ensuring compliance without human intervention."
                  },
                  {
                    q: "Substandard Detection",
                    a: "Our AI engine analyzes packaging fingerprints and batch history to detect anomalies instantly."
                  },
                  {
                    q: "Infrastructure Compatibility",
                    a: "Seamlessly integrates with legacy hospital networks via our secure API layer."
                  }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-slate-800/40 rounded-3xl border border-white/5 hover:bg-slate-800/60 transition-colors">
                    <h4 className="text-xl font-black text-purple-400 uppercase tracking-tight mb-4">{item.q}</h4>
                    <p className="text-slate-400 font-medium leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
}

export default Home;
