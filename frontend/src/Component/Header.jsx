import { Link, useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <header className="flex justify-between items-center px-10 py-2 bg-[#020617] border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl">
      <div className="text-xl font-bold">
        <Link to={"/"} className="flex items-center gap-2">
          <img src="./src/assets/logo.png" className="h-16 w-16 filter brightness-110" alt="Logo"></img>
          <span className="hidden md:block text-white font-black uppercase tracking-tighter italic text-2xl">MedMitra</span>
        </Link>
      </div>
      <nav className="hidden lg:flex space-x-8 items-center">
        <Link to="/" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-purple-400 transition-colors">
          Home
        </Link>
        <Link to="/add-medicine" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-purple-400 transition-colors">
          Inventory Entry
        </Link>
        <Link to="/dashboard" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-purple-400 transition-colors">
          Command Dashboard
        </Link>
        <Link to="/medicines" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-purple-400 transition-colors">
          Stock Registry
        </Link>
        <Link to="/purpose" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-purple-400 transition-colors">
          Purpose Discovery
        </Link>
        <Link to="/damage" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-purple-400 transition-colors">
          Risk Analysis
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        {token ? (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800/50 text-slate-300 text-[10px] font-black uppercase tracking-widest border border-slate-700 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all group"
          >
            <LogOut className="h-3 w-3 group-hover:animate-pulse" />
            Sign Out
          </button>
        ) : (
          <>
            <Link to="/sign-in">
              <button className="px-6 py-2.5 text-slate-300 text-[10px] font-black uppercase tracking-widest border border-slate-700 rounded-xl hover:bg-slate-800 transition-all">Sign In</button>
            </Link>
            <Link to={"/register"}>
              <button className="px-6 py-2.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20">
                Auth Access
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
