import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, RefreshCw, Save, Scan } from "lucide-react";

const AddMedicine = () => {
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    batch_number: "",
    expiry_date: "",
    price: "",
    quantity: "",
    description: ""
  });

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setImage(file);
        setShowCamera(false);
        extractFields(file);
      });
  }, [webcamRef]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      extractFields(file);
    }
  };

  const extractFields = async (file) => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/extract-fields", {
        method: "POST",
        body: formDataObj,
      });
      const data = await response.json();

      if (data.error) {
        setMessage({ type: "error", text: `AI Error: ${data.error}` });
      } else {
        setFormData({
          name: data.name || "",
          manufacturer: data.manufacturer || "",
          batch_number: data.batch_number || "",
          expiry_date: data.expiry_date || "",
          price: data.price || "",
          quantity: data.quantity || "1",
          description: data.description || ""
        });
        setMessage({ type: "success", text: "AI magic worked! Please verify data." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection to AI service failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/medicine", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-access-token": token
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Medicine added to high-security vault!" });
        setFormData({ name: "", manufacturer: "", batch_number: "", expiry_date: "", price: "", quantity: "", description: "" });
        setImage(null);
      } else {
        setMessage({ type: "error", text: "Failed to save to database." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error connecting to service." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
            Smart Intake System
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Leverage AI to catalog your pharmaceuticals with a single snap.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-4 rounded-3xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
              {showCamera ? (
                <div className="w-full h-full animate-in fade-in zoom-in duration-300">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-2xl aspect-square object-cover"
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                    <button 
                      onClick={capture}
                      className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-lg transition-transform active:scale-90"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={() => setShowCamera(false)}
                      className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-full shadow-lg transition-transform active:scale-90"
                    >
                      <RefreshCw className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                  <div 
                    className="w-full h-80 border-2 border-dashed border-slate-600 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-300 bg-slate-900/50 group"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {image ? (
                      <img src={URL.createObjectURL(image)} alt="Medicine" className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                      <div className="text-center p-8">
                        <div className="bg-slate-800 p-4 rounded-full inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-10 w-10 text-purple-400" />
                        </div>
                        <p className="text-lg font-bold text-slate-300">Upload Metadata</p>
                        <p className="text-sm text-slate-500 mt-2">Drag and drop or browse files</p>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowCamera(true)}
                    className="flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors"
                  >
                    <Scan className="h-5 w-5" />
                    Or use live scan
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              {loading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                  <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
                  <span className="text-xl font-black tracking-widest text-purple-400">ANALYZING...</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-800/40 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Medicine Designation</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-700 text-lg font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Manufacturer</label>
                    <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Batch Number</label>
                    <input type="text" name="batch_number" value={formData.batch_number} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Expiry Protocol</label>
                    <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-300" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Valuation (₹)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Inventory Count</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-400" required />
                  </div>
                </div>
                {message.text && (
                  <div className={`p-4 rounded-2xl flex items-center space-x-3 duration-300 ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                    {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="text-sm font-semibold">{message.text}</span>
                  </div>
                )}
                <button type="submit" disabled={saving || loading} className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px] shadow-lg transition-all active:scale-95 disabled:opacity-50">
                  <div className="relative flex items-center justify-center gap-2 rounded-[15px] bg-slate-900 px-8 py-4 group-hover:bg-transparent">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    <span className="font-bold tracking-widest uppercase text-sm">{saving ? "SECURING DATA..." : "AUTHORIZE ADDITION"}</span>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
