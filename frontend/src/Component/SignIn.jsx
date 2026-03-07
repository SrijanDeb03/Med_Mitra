import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Shield } from 'lucide-react';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorStatus, setErrorStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStatus(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.data);
        navigate('/home');
      } else {
        setErrorStatus(data.message || 'Verification failed. Access denied.');
      }
    } catch (err) {
      setErrorStatus('Cryptographic link failure. Server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] p-6 selection:bg-purple-500/30 overflow-hidden relative">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full"></div>
      
      <div className="relative w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/10 mb-2 border border-purple-500/20">
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Secure Login</h2>
          <p className="text-slate-500 font-medium text-sm tracking-tight uppercase">Medical Administrator Access</p>
        </div>

        {errorStatus && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in shake duration-300">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <p className="text-xs font-black text-rose-400 uppercase tracking-widest leading-relaxed">
              {errorStatus}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email Protocol</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent transition-all text-white placeholder:text-slate-800"
                placeholder="admin@medmitra.sys"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Passkey</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent transition-all text-white placeholder:text-slate-800"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px] shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="relative flex items-center justify-center gap-2 rounded-[15px] bg-slate-900 px-8 py-4 transition-all group-hover:bg-transparent">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
              <span className="font-bold tracking-[0.2em] uppercase text-xs">
                {loading ? "Decrypting..." : "Authorize Entry"}
              </span>
            </div>
          </button>
        </form>

        <div className="pt-4 text-center space-y-4">
          <Link to="/register" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-purple-400 transition-colors">
            Register New Node
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
