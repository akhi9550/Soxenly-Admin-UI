import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const COMMON_SIZES = ["S", "M", "L", "XL", "XXL", "Free Size"];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Add Product State
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category_id: "",
    price: ""
  });
  const [newProductVariants, setNewProductVariants] = useState([{ size: "", stock: "" }]);
  const [newProductImages, setNewProductImages] = useState([]); // Array of Files

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState(null); // { id, name, description, currentStock, price, category_id, image }
  const [editValues, setEditValues] = useState({ name: "", description: "", price: "", category_id: "", variants: [] });
  const [editImages, setEditImages] = useState([]); // Array of Files to upload
  const [editLoading, setEditLoading] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const [newProductImage, setNewProductImage] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]); // Array of URLs to delete on Save

  const fetchProducts = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/products?page=${page}&count=10`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setProducts(data.data || []);
      else {
        setError(data.message || "Failed to load products");
        if (response.status === 401) {
          localStorage.removeItem("admin_token");
          navigate("/login");
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/category`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setCategories(data.data || []);
    } catch (err) {
      console.error("Could not load categories", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, navigate]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    setAddLoading(true);

    const payload = {
      name: newProduct.name,
      description: newProduct.description,
      category_id: parseInt(newProduct.category_id, 10),
      price: parseFloat(newProduct.price),
      variants: newProductVariants.filter(v => v.size && v.stock).map(v => ({
        size: v.size,
        stock: parseInt(v.stock, 10)
      }))
    };

    try {
      // 1. Create the product
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const createdProduct = data.data;
        const productId = createdProduct.id || createdProduct.ID;

        // 2. Upload images if selected
        if (newProductImages.length > 0 && productId) {
          const formData = new FormData();
          for (const file of newProductImages) {
            formData.append("files", file);
          }

          await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/products/upload-image?product_id=${productId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: formData
          });
        }

        setNewProduct({ name: "", description: "", category_id: "", price: "" });
        setNewProductVariants([{ size: "", stock: "" }]);
        setNewProductImages([]);
        setShowAdd(false);
        showNotification("Product added successfully!");
      } else {
        const data = await response.json();
        showNotification(data.message || "Failed to add product", "error");
      }
    } catch (err) {
      showNotification("Network error while adding product.", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    setEditLoading(true);

    const payload = {
      product_id: editingProduct.id,
      name: editValues.name,
      description: editValues.description,
      category_id: parseInt(editValues.category_id, 10),
      price: parseFloat(editValues.price),
      variants: editValues.variants.filter(v => v.size && v.stock).map(v => ({
        size: v.size,
        stock: parseInt(v.stock, 10)
      }))
    };

    try {
      // 1. Update basic details
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/products`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // 2. Upload new images if selected
        if (editImages.length > 0) {
          const formData = new FormData();
          for (const file of editImages) {
            formData.append("files", file);
          }
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/products/upload-image?product_id=${editingProduct.id}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
          });
        }
        
        // 3. Delete queued images
        for (const imgUrl of imagesToDelete) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/products/image?product_id=${editingProduct.id}&url=${encodeURIComponent(imgUrl)}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
        }

        setEditingProduct(null);
        setEditImages([]);
        setImagesToDelete([]);
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update product");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/products?id=${deletingProduct.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setDeletingProduct(null);
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleDeleteImage = (imgUrl) => {
    // Queue for deletion locally
    setImagesToDelete(prev => [...prev, imgUrl]);
    const updatedImages = editingProduct.images.filter(img => img !== imgUrl);
    setEditingProduct({...editingProduct, images: updatedImages});
  };

  return (
    <>
      {/* IMAGE LIGHTBOX OVERLAY */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-90 duration-500 ease-out">
            <img 
              src={zoomImage} 
              alt="Immersive view" 
              className="max-w-full max-h-full object-contain shadow-[0_0_80px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
      )}
      {/* DELETE MODAL OVERLAY */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Delete Product?</h3>
              <p className="text-neutral-500 text-sm mb-8 px-4">
                You are about to remove <span className="font-bold text-neutral-900">{deletingProduct.name}</span>. This action cannot be reversed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteProduct}
                  className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* EDIT STOCK MODAL OVERLAY */}
      {editingProduct && (
        <div className="fixed inset-0 bg-soxenly-green/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-lg p-8 rounded-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="mb-6">
              <label className="text-[10px] font-medium text-sm block mb-2">Existing Images</label>
              <div className="flex flex-wrap gap-3">
                {(editingProduct.images || []).map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={img.startsWith("http") ? img : `${import.meta.env.VITE_API_BASE_URL}${img}`} 
                      alt="Product" 
                      className="w-20 h-20 object-cover border border-neutral-200 rounded-lg"
                    />
                    <button 
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-xs font-bold hover:bg-red-700 transition-all shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(!editingProduct.images || editingProduct.images.length === 0) && (
                  <div className="w-20 h-20 bg-neutral-100 border border-dashed border-neutral-300 flex items-center justify-center text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                    No Images
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-medium text-sm block mb-1">Product Name</label>
                  <input type="text" required value={editValues.name} onChange={e => setEditValues({...editValues, name: e.target.value})} className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:border-soxenly-beige focus:ring-1 focus:ring-black transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-medium text-sm block mb-1">Description</label>
                  <textarea value={editValues.description} onChange={e => setEditValues({...editValues, description: e.target.value})} className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:border-soxenly-beige focus:ring-1 focus:ring-black transition-all h-20" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-medium text-sm block mb-1">Category</label>
                  <select required value={editValues.category_id} onChange={e => setEditValues({...editValues, category_id: e.target.value})} className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:border-soxenly-beige focus:ring-1 focus:ring-black transition-all">
                    {categories.map(c => (
                      <option key={c.id || c.Id || c.ID} value={c.id || c.Id || c.ID}>{c.category_name || c.Category_Name || c.category || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-sm block mb-1">Price (₹)</label>
                  <input type="number" step="0.01" required value={editValues.price} onChange={e => setEditValues({...editValues, price: e.target.value})} className="w-full border border-soxenly-beige p-2 text-sm focus:outline-none" />
                </div>
                <div className="col-span-2 border border-dashed border-neutral-200 rounded-xl p-6 bg-neutral-50 mt-2">
                  <h4 className="text-[10px] font-medium text-sm mb-4 text-neutral-500">Available Sizes & Stock</h4>
                  
                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {COMMON_SIZES.map(size => {
                      const isSelected = (editValues.variants || []).some(v => v.size === size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setEditValues({...editValues, variants: editValues.variants.filter(v => v.size !== size)});
                            } else {
                              setEditValues({...editValues, variants: [...(editValues.variants || []), { size, stock: "" }]});
                            }
                          }}
                          className={`px-4 py-2 rounded-full border font-bold text-xs transition-all ${
                            isSelected 
                              ? "bg-soxenly-green text-soxenly-cream border-soxenly-beige scale-105" 
                              : "bg-white text-neutral-400 border-neutral-200 hover:border-soxenly-beige hover:text-soxenly-cream"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    {(editValues.variants || []).map((variant, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-neutral-200 animate-in fade-in slide-in-from-left-2">
                        <div className="w-12 h-12 bg-soxenly-green text-soxenly-cream rounded-lg flex items-center justify-center font-bold text-sm">
                          {variant.size}
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-medium text-neutral-400 block mb-1">Stock Quantity</label>
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={variant.stock} 
                            onChange={e => {
                              const updated = [...editValues.variants];
                              updated[index].stock = e.target.value;
                              setEditValues({...editValues, variants: updated});
                            }}
                            className="w-full border-b border-neutral-100 focus:border-soxenly-beige focus:outline-none py-1 text-sm font-bold"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const updated = editValues.variants.filter((_, i) => i !== index);
                            setEditValues({...editValues, variants: updated});
                          }}
                          className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-300 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {!editValues.variants?.length && (
                    <div className="text-center py-4 text-xs font-bold text-neutral-300 uppercase tracking-widest italic">
                      No sizes selected yet
                    </div>
                  )}
                </div>
                <div className="col-span-2 mt-4">
                  <label className="text-[10px] font-medium text-sm block mb-1">Add New Images (Cumulative)</label>
                  <input type="file" accept="image/*" multiple onChange={e => setEditImages(prev => [...prev, ...Array.from(e.target.files)])} className="w-full border border-neutral-200 rounded-lg p-2 text-xs focus:outline-none bg-white cursor-pointer file:mr-4 file:py-1 file:px-3 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-soxenly-green file:text-soxenly-cream" />
                  
                  {editImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 p-2 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg">
                      {editImages.map((file, i) => (
                        <div key={i} className="relative group">
                          <div className="w-12 h-12 bg-neutral-200 rounded border border-neutral-300 overflow-hidden flex items-center justify-center">
                            <span className="text-[8px] font-bold truncate p-1">{file.name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setEditImages(editImages.filter((_, idx) => idx !== i))}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] hover:bg-red-700 border border-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button type="button" onClick={() => { setEditingProduct(null); setEditImages([]); }} className="flex-1 border border-soxenly-beige bg-white text-soxenly-green font-medium text-sm text-xs py-4 hover:bg-neutral-100">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} className="flex-1 border border-soxenly-green bg-soxenly-green text-soxenly-cream font-bold text-[10px] uppercase tracking-wider py-4 hover:bg-white hover:text-soxenly-green transition-all duration-300 disabled:opacity-50">
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex justify-between items-end mb-8 border-b border-soxenly-beige pb-4">
        <div>
          <h2 className="text-sm font-medium tracking-[0.2em] text-neutral-500 mb-1">Inventory Management</h2>
          <h1 className="font-serif text-4xl lg:text-5xl text-soxenly-green">Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100">
            Page {page}
          </div>
          <div className="flex bg-white rounded-full border border-soxenly-beige p-1 shadow-sm">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-full hover:bg-soxenly-green hover:text-soxenly-cream transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit"
              title="Previous Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
              </svg>
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-full hover:bg-soxenly-green hover:text-soxenly-cream transition-all duration-300"
              title="Next Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
              </svg>
            </button>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="ml-2 px-6 py-2 bg-soxenly-green text-soxenly-cream border border-soxenly-green font-bold text-[10px] uppercase tracking-wider rounded-full hover:bg-white hover:text-soxenly-green transition-all duration-300 shadow-lg shadow-soxenly-green/10"
          >
            {showAdd ? "Cancel" : "+ Add Product"}
          </button>
        </div>
      </header>


      {showAdd && (
        <div className="mb-8 p-6 bg-white border border-neutral-200 rounded-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
          <h3 className="text-xs font-medium tracking-[0.2em] mb-4">Add New Product</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-medium text-sm mb-1 block">Product Name <span className="text-red-500">*</span></label>
              <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:border-soxenly-beige focus:ring-1 focus:ring-black transition-all" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-medium text-sm mb-1 block">Category <span className="text-red-500">*</span></label>
              <select required value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none focus:border-soxenly-beige focus:ring-1 focus:ring-black transition-all">
                <option value="">Select Category...</option>
                {categories.map(c => (
                  <option key={c.id || c.Id || c.ID} value={c.id || c.Id || c.ID}>{c.category_name || c.Category_Name || c.category || c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-medium text-sm mb-1 block">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border border-soxenly-beige p-2 text-sm focus:outline-none" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-medium text-sm mb-1 block">Product Images (Cumulative)</label>
              <input type="file" accept="image/*" multiple onChange={e => setNewProductImages(prev => [...prev, ...Array.from(e.target.files)])} className="w-full border border-neutral-200 rounded-lg p-2 text-sm focus:outline-none bg-white cursor-pointer file:mr-4 file:py-0.5 file:px-3 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-soxenly-green file:text-soxenly-cream" />
              
              {newProductImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 p-2 bg-white/50 border border-dashed border-neutral-300 rounded-lg">
                  {newProductImages.map((file, i) => (
                    <div key={i} className="relative">
                      <div className="w-10 h-10 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center overflow-hidden">
                         <span className="text-[8px] font-bold truncate p-0.5">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setNewProductImages(newProductImages.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] hover:bg-red-700 border border-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-medium text-sm mb-1 block">Description <span className="text-red-500">*</span></label>
              <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border border-soxenly-beige p-2 text-sm focus:outline-none h-16" />
            </div>

            <div className="col-span-2 border border-dashed border-neutral-200 rounded-xl p-6 bg-neutral-50">
              <h4 className="text-[10px] font-medium text-sm mb-4 text-neutral-500">Available Sizes & Stock</h4>
              
              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {COMMON_SIZES.map(size => {
                  const isSelected = newProductVariants.some(v => v.size === size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setNewProductVariants(newProductVariants.filter(v => v.size !== size));
                        } else {
                          // Remove the empty placeholder if it exists
                          const filtered = newProductVariants.filter(v => v.size !== "");
                          setNewProductVariants([...filtered, { size, stock: "" }]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full border font-bold text-xs transition-all ${
                        isSelected 
                          ? "bg-soxenly-green text-soxenly-cream border-soxenly-beige scale-105" 
                          : "bg-white text-neutral-400 border-neutral-200 hover:border-soxenly-beige hover:text-soxenly-cream"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {newProductVariants.filter(v => v.size).map((variant, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-neutral-200 animate-in fade-in slide-in-from-left-2">
                    <div className="w-12 h-12 bg-soxenly-green text-soxenly-cream rounded-lg flex items-center justify-center font-bold text-sm">
                      {variant.size}
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-medium text-neutral-400 block mb-1">Stock Quantity</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={variant.stock} 
                        onChange={e => {
                          const updated = [...newProductVariants];
                          const variantIndex = updated.findIndex(v => v.size === variant.size);
                          updated[variantIndex].stock = e.target.value;
                          setNewProductVariants(updated);
                        }}
                        className="w-full border-b border-neutral-100 focus:border-soxenly-beige focus:outline-none py-1 text-sm font-bold"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setNewProductVariants(newProductVariants.filter(v => v.size !== variant.size))}
                      className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-300 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {!newProductVariants.filter(v => v.size).length && (
                <div className="text-center py-4 text-xs font-bold text-neutral-300 uppercase tracking-widest italic">
                  Select sizes above to set stock
                </div>
              )}
            </div>
            <div className="col-span-2 mt-2">
              <button type="submit" disabled={addLoading} className="w-full py-4 bg-soxenly-green text-soxenly-cream font-bold text-[10px] uppercase tracking-wider hover:bg-white hover:text-soxenly-green border border-soxenly-green transition-all duration-300 disabled:opacity-50">
                {addLoading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showAdd && !editingProduct && (
        <div className="bg-white border border-neutral-200 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-soxenly-green text-soxenly-cream text-xs uppercase tracking-[0.1em]">
                <th className="p-4 border-b border-soxenly-beige">Name</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Description</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Category</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Price</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Size & Stock</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Image</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center uppercase tracking-widest font-bold animate-pulse">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center uppercase tracking-widest font-bold">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id || product.Id} className="border-b border-soxenly-beige hover:bg-neutral-100 transition-colors">
                    <td className="p-4 text-sm text-neutral-600">{product.name || product.Name}</td>
                    <td className="p-4 border-l border-soxenly-beige text-xs text-neutral-500">{product.description || product.Description}</td>
                    <td className="p-4 border-l border-soxenly-beige text-sm text-neutral-600 capitalize">{product.category_name || "Unknown"}</td>
                    <td className="p-4 border-l border-soxenly-beige text-sm text-neutral-600">₹{product.price || product.Price}</td>
                    <td className="p-4 border-l border-soxenly-beige">
                      <div className="flex flex-wrap gap-1">
                        {product.variants && product.variants.length > 0 ? (
                          product.variants.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-neutral-100 text-neutral-600 border border-neutral-200 text-xs rounded-sm">
                              {v.size}: {v.stock}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-400 italic text-[10px]">No sizes set</span>
                        )}
                      </div>
                    </td>
                      <td className="p-4 border-l border-soxenly-beige">
                        {product.image && product.image.length > 0 ? (
                          <div 
                            className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-md overflow-hidden cursor-zoom-in group"
                            onClick={() => setZoomImage(product.image[0].startsWith("http") ? product.image[0] : `${import.meta.env.VITE_API_BASE_URL}${product.image[0]}`)}
                          >
                            <img 
                              src={product.image[0].startsWith("http") ? product.image[0] : `${import.meta.env.VITE_API_BASE_URL}${product.image[0]}`} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-neutral-200 border border-soxenly-beige flex items-center justify-center text-[10px] font-bold text-neutral-400">
                            NO IMG
                          </div>
                        )}
                      </td>
                    <td className="p-4 border-l border-soxenly-beige space-x-2">
                      <button 
                        onClick={() => {
                          const id = product.id || product.Id;
                          const name = product.name || product.Name;
                          const description = product.description || product.Description || "";
                          const price = product.price || product.Price;
                          const category_id = product.category_id || product.Category_ID || product.CategoryID;
                          const images = product.image || [];
                          const variants = product.variants || [];
                          setEditingProduct({ id, name, description, price, category_id, images, variants });
                          setEditValues({ name, description, price, category_id, variants: [...variants] });
                          setImagesToDelete([]);
                        }}
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-soxenly-green/20 bg-soxenly-green/5 text-soxenly-green hover:bg-soxenly-green hover:text-white transition-all duration-300"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          const id = product.id || product.Id;
                          const name = product.name || product.Name;
                          const image = product.image && product.image.length > 0 ? product.image[0] : null;
                          setDeletingProduct({ id, name, image });
                        }}
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
