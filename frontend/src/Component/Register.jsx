import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Building, MapPin, Mail, Lock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
      <input
        {...props}
        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-3.5 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent transition-all text-white placeholder:text-slate-800"
      />
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    hospitalCode: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStatus(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorStatus("Mismatch detected in passkey validation.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        navigate('/sign-in');
      } else {
        setErrorStatus(result.message || "Protocol rejection. Invalid credentials.");
      }
    } catch (error) {
      setErrorStatus("Server handshake failed. Sync error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 selection:bg-purple-500/30 overflow-hidden relative flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="relative w-full max-w-2xl bg-slate-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/10 mb-2 border border-purple-500/20">
            <Shield className="h-7 w-7 text-purple-500" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Initialize Node</h2>
          <p className="text-slate-500 font-medium text-xs tracking-tight uppercase">Hospital Registration Protocol</p>
        </div>

        {errorStatus && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <p className="text-xs font-black text-rose-400 uppercase tracking-widest leading-relaxed">{errorStatus}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Facility Name" icon={Building} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Global Med Center" required />
            <InputField label="Hospital Identity" icon={Shield} type="text" name="hospitalCode" value={formData.hospitalCode} onChange={handleChange} placeholder="SYS-MH-001" required />
            <div className="md:col-span-2">
              <InputField label="Deployment Address" icon={MapPin} type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Sector 7, Digital Nexus" required />
            </div>
            <div className="md:col-span-2">
              <InputField label="Communication Link" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ops@medlink.sys" required />
            </div>
            <InputField label="Access Secret" icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            <InputField label="Verify Secret" icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px] shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            <div className="relative flex items-center justify-center gap-2 rounded-[23px] bg-slate-900 px-8 py-4 transition-all group-hover:bg-transparent">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              <span className="font-bold tracking-[0.2em] uppercase text-xs">
                {loading ? "Processing..." : "Register System Node"}
              </span>
            </div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/sign-in" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-purple-400 transition-colors">
            Existing Node? Authenticate here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
