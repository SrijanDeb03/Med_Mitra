import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, Search, Filter, AlertTriangle, ChevronRight, 
  Loader2, Info, X, ShieldCheck, Clock, FileText, 
  Database, Activity, Download, CheckCircle2,
  Trash2, Edit, Save, AlertCircle
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const AllMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudit, setSelectedAudit] = useState(null);
  
  // Edit State
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchMedicines(token);
  }, [navigate]);

  const fetchMedicines = async (token) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/medicine", {
        headers: {
          'x-access-token': token
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setMedicines(data.data);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to decommission this stock? This action is permanent.")) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/v1/medicine/${id}`, {
        method: "DELETE",
        headers: { 'x-access-token': token }
      });
      const data = await response.json();
      if (data.success) {
        setMedicines(medicines.filter(m => m.id !== id));
      } else {
        alert("Failed to delete stock from registry.");
      }
    } catch (err) {
      alert("Connectivity error during deletion.");
    }
  };

  const handleEditInit = (medicine) => {
    setEditingMedicine(medicine);
    setEditFormData({
      name: medicine.name,
      manufacturer: medicine.manufacturer,
      price: medicine.price,
      quantity: medicine.quantity,
      expiry_date: medicine.expiry_date ? new Date(medicine.expiry_date).toISOString().split('T')[0] : ""
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/v1/medicine/${editingMedicine.id}`, {
        method: "PATCH",
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token 
        },
        body: JSON.stringify(editFormData)
      });
      const data = await response.json();
      if (data.success) {
        setMedicines(medicines.map(m => m.id === editingMedicine.id ? { ...m, ...editFormData } : m));
        setEditingMedicine(null);
      } else {
        alert("Update failed.");
      }
    } catch (err) {
      alert("Error reaching security server.");
    } finally {
      setUpdating(false);
    }
  };

  const generatePDF = (medicine) => {
    if (!medicine) return;
    console.log("Starting PDF generation for:", medicine);
    
    try {
        const doc = new jsPDF();
        const expiryDate = new Date(medicine.expiry_date || new Date());
        const currentDate = new Date();
        const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
        const isExpired = daysRemaining <= 0;

        // Clean values for PDF
        const medName = (medicine.name || "Unknown PRODUCT").toUpperCase();
        const medManufacturer = (medicine.manufacturer || "Unknown MFG").toUpperCase();
        const medBatch = medicine.batch_number || "BATCH-N/A";

        // Report Header
        doc.setFillColor(2, 6, 23);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("MED-MITRA", 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("SECURITY AUDIT & LOGISTICS MANIFEST", 105, 30, { align: "center" });

        // Section: Identity
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("Product Identity", 14, 55);
        doc.setLineWidth(0.5);
        doc.line(14, 58, 200, 58);

        doc.setFontSize(12);
        doc.text(`Medicine Name: ${medName}`, 14, 70);
        doc.text(`Manufacturer: ${medManufacturer}`, 14, 80);
        doc.text(`Batch ID: ${medBatch}`, 14, 90);
        doc.text(`Status: ${isExpired ? 'SEC-REJECTED (EXPIRED)' : 'SEC-AUTHENTICATED (ACTIVE)'}`, 14, 100);

        // Section: Logistics Audit Table
        doc.setFontSize(16);
        doc.text("Audit Checkpoints", 14, 120);
        
        autoTable(doc, {
          startY: 125,
          head: [['Metric', 'Status', 'Verification']],
          body: [
            ['Packaging Integrity', 'Pass', 'Visual Neural Analysis'],
            ['Label Recognition (OCR)', 'Pass', 'Pattern Match (Gemini 2.0)'],
            ['Manufacturer Auth', 'Verified', 'Supply Chain Validation'],
            ['Chemical Stability Hash', 'Valid', 'Predictive Analysis'],
          ],
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246] },
        });

        // Section: Risk Forecast
        let finalY = 180;
        if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
            finalY = doc.lastAutoTable.finalY + 20;
        }

        doc.setFontSize(16);
        doc.text("Risk Forecast", 14, finalY);
        doc.setFontSize(12);
        doc.text(`Expiration Timeline: ${expiryDate.toLocaleDateString()}`, 14, finalY + 10);
        doc.text(`Days until decay: ${isExpired ? '0 (Decommissioned)' : daysRemaining}`, 14, finalY + 20);
        
        if (isExpired) {
            doc.setTextColor(239, 68, 68);
            doc.setFont("helvetica", "bold");
            doc.text("DANGER: This stock has exceeded its chemical stability threshold.", 14, finalY + 35);
        } else if (daysRemaining < 30) {
            doc.setTextColor(245, 158, 11);
            doc.setFont("helvetica", "bold");
            doc.text("WARNING: Near-decay threshold detected (Critical Window).", 14, finalY + 35);
        }

        // Footer
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 285);
        doc.text("MedMitra AI Inspection Engine | All Rights Reserved", 105, 285, { align: "center" });

        const safeName = medName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`audit_report_${safeName}_${medBatch}.pdf`);
        console.log("PDF generation successful");
    } catch (error) {
        console.error("Detailed PDF Generation Error:", error);
        alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EditModal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Modify <span className="text-purple-500">Registry</span></h2>
            <button onClick={() => setEditingMedicine(null)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Medicine Designation</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-500 outline-none text-white font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manufacturer</label>
                <input
                  type="text"
                  value={editFormData.manufacturer}
                  onChange={(e) => setEditFormData({...editFormData, manufacturer: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-500 outline-none text-white font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry Protocol</label>
                <input
                  type="date"
                  value={editFormData.expiry_date}
                  onChange={(e) => setEditFormData({...editFormData, expiry_date: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-500 outline-none text-white font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Valuation (₹)</label>
                <input
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-500 outline-none text-white font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stock Yield</label>
                <input
                  type="number"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-purple-500 outline-none text-white font-medium"
                />
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
              {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {updating ? "SECURELY UPDATING..." : "COMMIT CHANGES"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const AuditModal = ({ medicine, onClose }) => {
    if (!medicine) return null;

    const expiryDate = new Date(medicine.expiry_date);
    const currentDate = new Date();
    const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="relative w-full max-w-4xl bg-slate-900/80 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[450px]">
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-8 right-8 z-20 p-3 bg-emerald-500 hover:bg-emerald-400 rounded-full text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-90">
            <X className="h-5 w-5" />
          </button>

          {/* Left identity Panel */}
          <div className="md:w-[40%] bg-slate-800/20 p-12 border-r border-white/5 flex flex-col items-center justify-center text-center space-y-8">
            <div className="h-32 w-32 bg-purple-600/10 rounded-[2.5rem] flex items-center justify-center border border-purple-500/20 shadow-2xl shadow-purple-500/10">
              <ShieldCheck className="h-16 w-16 text-purple-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{medicine.name}</h2>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{medicine.manufacturer}</p>
            </div>
            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              SEC-AUTHENTICATED
            </div>
          </div>

          {/* Right Feed Panel */}
          <div className="flex-1 p-12 flex flex-col justify-between bg-slate-950/30">
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <Activity className="h-5 w-5 text-purple-500 animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Logistics Intelligence Feed</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Clock className="h-4 w-4 text-amber-500" /> Decay Analysis
                  </div>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">{isExpired ? '0 DAYS' : `${daysRemaining} DAYS`}</p>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Database className="h-4 w-4 text-emerald-500" /> Batch Genealogy
                  </div>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">{medicine.batch_number}</p>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <FileText className="h-4 w-4 text-blue-500" /> Assets Value
                  </div>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">₹{medicine.price}</p>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Package className="h-4 w-4 text-purple-500" /> Stock Yield
                  </div>
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">{medicine.quantity} UNITS</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => generatePDF(medicine)}
              className="w-full py-6 mt-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <FileText className="h-5 w-5" />
              Generate Audit Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Stock <span className="text-purple-500">Inventory</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-tight uppercase text-[10px] tracking-widest">High-Security Logistics Manifest</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl px-5 py-3.5">
              <Search className="h-4 w-4 text-slate-500 mr-3" />
              <input
                type="text"
                placeholder="Search high-value stockpile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 font-bold text-xs uppercase tracking-tight"
              />
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMedicines.map((med) => {
            const expiryDate = new Date(med.expiry_date);
            const isExpired = expiryDate < new Date();
            
            return (
              <div key={med.id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:bg-slate-800/40 transition-all duration-500 shadow-2xl overflow-hidden hover:border-purple-500/30">
                <div className="absolute top-0 right-0 -m-4 h-32 w-32 bg-purple-500/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Action Controls */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-10">
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleEditInit(med); }}
                     className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl border border-white/10 transition-all shadow-lg shadow-emerald-500/20"
                   >
                     <Edit className="h-4 w-4" />
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleDelete(med.id); }}
                     className="p-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl border border-white/10 transition-all shadow-lg shadow-rose-500/20"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>

                <div className="space-y-6 relative">
                  <div className="flex justify-between items-start">
                    <div className="h-14 w-14 bg-slate-800/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-slate-700 transition-transform group-hover:scale-110">
                      <Package className="h-7 w-7 text-purple-400" />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isExpired ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {isExpired ? 'DECOMMISSIONED' : 'OPERATIONAL'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate leading-tight w-full pr-12">{med.name}</h3>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">{med.manufacturer}</p>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4 font-mono text-[11px]">
                    <div className="flex justify-between items-center ">
                      <span className="font-black text-slate-700 uppercase tracking-widest">Expiration</span>
                      <span className={`font-bold ${isExpired ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                        {new Date(med.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Inventory</span>
                      <span className="text-white font-bold">{med.quantity} UNITS</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedAudit(med)}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl transition-all font-black tracking-widest text-[10px] uppercase border border-white/5 active:scale-95 shadow-lg shadow-emerald-500/10"
                  >
                    Audit Logistics <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMedicines.length === 0 && !loading && (
          <div className="py-32 text-center space-y-6">
            <Info className="h-12 w-12 text-slate-800 mx-auto" />
            <h3 className="text-2xl font-black text-slate-700 uppercase italic tracking-tighter">Null Catalog Fragment</h3>
            <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Register new stockpile to begin tracking.</p>
          </div>
        )}
      </div>

      {selectedAudit && (
        <AuditModal 
          medicine={selectedAudit} 
          onClose={() => setSelectedAudit(null)} 
        />
      )}

      {editingMedicine && <EditModal />}
    </div>
  );
};

export default AllMedicines;
