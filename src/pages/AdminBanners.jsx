import React, { useState, useEffect } from "react";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title1: "",
    title2: "",
    subtitle1: "",
    subtitle2: "",
    link: "",
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/banner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setBanners(data.data || []);
    } catch (err) {
      console.error("Error fetching banners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("admin_token");
    
    const data = new FormData();
    data.append("title1", formData.title1);
    data.append("title2", formData.title2);
    data.append("subtitle1", formData.subtitle1);
    data.append("subtitle2", formData.subtitle2);
    data.append("link", formData.link);
    data.append("image", formData.image);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/banner`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        fetchBanners();
        setShowModal(false);
        setFormData({ title1: "", title2: "", subtitle1: "", subtitle2: "", link: "", image: null });
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add banner");
      }
    } catch (err) {
      alert("Error adding banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/banner?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchBanners();
    } catch (err) {
      alert("Error deleting banner");
    }
  };

  const handleToggle = async (id) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/banner/toggle?id=${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchBanners();
    } catch (err) {
      alert("Error toggling status");
    }
  };

  if (loading) return <div className="p-8 font-display animate-pulse uppercase tracking-widest">Accessing Banners...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center pb-6 border-b border-soxenly-beige">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Banners</h2>
          <p className="text-[10px] font-medium tracking-[0.2em] text-neutral-500 mt-1">Hero Section Management</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-soxenly-green text-soxenly-cream px-8 py-3 border border-soxenly-beige font-medium text-xs tracking-widest hover:bg-white hover:text-soxenly-green transition-all"
        >
          Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="border border-soxenly-beige bg-white flex flex-col group transition-transform hover:-translate-y-1">
            <div className="aspect-video bg-neutral-100 border-b border-soxenly-beige relative overflow-hidden">
              <img 
                src={banner.image.startsWith("http") ? banner.image : `${import.meta.env.VITE_API_BASE_URL}${banner.image}`} 
                alt={banner.title1} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleToggle(banner.id)}
                  className={`w-10 h-10 border border-soxenly-beige flex items-center justify-center transition-colors ${banner.is_active ? 'bg-green-500' : 'bg-white'}`}
                  title={banner.is_active ? "Deactivate" : "Activate"}
                >
                  <div className={`w-3 h-3 ${banner.is_active ? 'bg-white' : 'bg-soxenly-green'}`}></div>
                </button>
                <button 
                  onClick={() => handleDelete(banner.id)}
                  className="w-10 h-10 bg-red-600 text-white border border-red-100 flex items-center justify-center hover:bg-red-700 transition-all shadow-sm"
                  title="Delete"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-6 flex-grow space-y-4">
              <div className="flex justify-between text-[10px] font-medium text-neutral-400">
                <span>{banner.subtitle1}</span>
                <span>{banner.subtitle2}</span>
              </div>
              <h3 className="font-display text-2xl uppercase leading-none">
                {banner.title1} <span className="text-red-600">{banner.title2}</span>
              </h3>
              {banner.link && (
                <div className="pt-2">
                  <span className="text-[10px] font-medium bg-neutral-100 px-2 py-1 border border-neutral-200">Link: {banner.link}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-soxenly-green/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white border border-soxenly-beige w-full max-w-xl p-8 animate-slideUp">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-soxenly-beige">
              <h2 className="font-display text-xl font-black uppercase tracking-tighter">New Hero Banner</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl font-black hover:rotate-90 transition-transform">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Main Title (Black)</label>
                  <input required type="text" value={formData.title1} onChange={e => setFormData({...formData, title1: e.target.value})} className="w-full p-3 border border-soxenly-beige font-display text-sm uppercase" placeholder="e.g. SOCKS FOR THE" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Highlight Title (Red)</label>
                  <input required type="text" value={formData.title2} onChange={e => setFormData({...formData, title2: e.target.value})} className="w-full p-3 border border-soxenly-beige font-display text-sm uppercase" placeholder="e.g. CONCRETE." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subtitle Left</label>
                  <input type="text" value={formData.subtitle1} onChange={e => setFormData({...formData, subtitle1: e.target.value})} className="w-full p-3 border border-soxenly-beige font-display text-sm uppercase" placeholder="/// COLLECTION 01" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subtitle Right</label>
                  <input type="text" value={formData.subtitle2} onChange={e => setFormData({...formData, subtitle2: e.target.value})} className="w-full p-3 border border-soxenly-beige font-display text-sm uppercase" placeholder="N° 9550" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">CTA Link</label>
                <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full p-3 border border-soxenly-beige font-display text-sm" placeholder="/shop or https://..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Banner Image</label>
                <input required type="file" onChange={e => setFormData({...formData, image: e.target.files[0]})} className="w-full p-3 border border-soxenly-beige font-display text-sm" accept="image/*" />
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-4 bg-soxenly-green text-soxenly-cream font-display uppercase tracking-widest font-black text-sm border border-soxenly-beige hover:bg-white hover:text-soxenly-green transition-all mt-6 disabled:opacity-50"
              >
                {isSubmitting ? "Uploading Data..." : "Deploy Banner"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
