import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Package, AlertCircle, Clock, Activity, Loader2, Zap, ShieldCheck, History } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/analytics", {
        headers: {
          'x-access-token': token
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="relative">
        <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
        <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <p className="text-slate-500 font-black uppercase tracking-widest">No intelligence data available.</p>
    </div>
  );

  const pieData = [
    { name: 'Healthy', value: (stats.totalMedicines || 0) - (stats.expiringSoon || 0) - (stats.expired || 0), color: '#10b981' },
    { name: 'Critical (Expiry)', value: stats.expiringSoon || 0, color: '#f59e0b' },
    { name: 'Defunct (Expired)', value: stats.expired || 0, color: '#ef4444' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, shadow }) => (
    <div className={`relative overflow-hidden bg-slate-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}>
      <div className={`absolute top-0 right-0 -m-4 h-24 w-24 rounded-full blur-3xl opacity-20 ${color}`}></div>
      <div className="flex items-center space-x-4">
        <div className={`p-4 rounded-2xl ${color} shadow-lg ${shadow}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</p>
          <p className="text-3xl font-black text-white mt-1 uppercase">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-10 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
              Control <span className="text-purple-500">Center</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-tight">Real-time pharmaceutical intelligence and stockpile oversight.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">System Status</p>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Operational / Secure</p>
            </div>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Global Inventory" value={stats.totalMedicines} icon={Package} color="bg-blue-600" shadow="shadow-blue-500/20" />
          <StatCard title="Expiry Risk" value={stats.expiringSoon} icon={Clock} color="bg-amber-600" shadow="shadow-amber-500/20" />
          <StatCard title="Shortage Flux" value={stats.lowStock} icon={Activity} color="bg-purple-600" shadow="shadow-purple-500/20" />
          <StatCard title="Total Wastage" value={stats.expired} icon={ShieldCheck} color="bg-rose-600" shadow="shadow-rose-500/20" />
        </div>

        {/* Intelligence Feed (Alerts) */}
        {(stats.expiringSoon > 0 || stats.lowStock > 0) && (
          <div className="relative group overflow-hidden bg-slate-900/80 backdrop-blur-3xl p-8 rounded-3xl border border-amber-500/20 shadow-2xl">
            <div className="absolute top-0 right-0 -m-8 h-40 w-40 bg-amber-500/5 blur-[80px] rounded-full"></div>
            <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter">Emergency protocols recommended</h3>
                <p className="text-slate-400">Anomalies detected in expiration cycles and logistics volume.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                {stats.lowStock > 0 && (
                  <div className="flex-1 md:flex-none px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl backdrop-blur-md">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Low Density</p>
                    <p className="text-lg font-bold text-white tracking-widest leading-none">{stats.lowStock} UNITS</p>
                  </div>
                )}
                {stats.expiringSoon > 0 && (
                  <div className="flex-1 md:flex-none px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl backdrop-blur-md">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Near Decay</p>
                    <p className="text-lg font-bold text-white tracking-widest leading-none">{stats.expiringSoon} UNITS</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Health Distribution */}
          <div className="lg:col-span-5 bg-slate-800/30 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 h-[480px] flex flex-col shadow-2xl">
            <div className="mb-8 flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Internal Integrity
              </h3>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time status</div>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {pieData.map(item => (
                <div key={item.name} className="bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate">{item.name}</p>
                  <p className="text-lg font-bold text-white" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Matrix (Manufacturer Distribution) */}
          <div className="lg:col-span-7 bg-slate-800/30 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 h-[480px] flex flex-col shadow-2xl">
             <div className="mb-8 flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <History className="h-4 w-4 text-purple-500" />
                Supply Infrastructure
              </h3>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={stats.manufacturerData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="manufacturer" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: 'white' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
