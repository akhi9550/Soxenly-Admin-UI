import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Add category state
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  
  // Edit category state
  const [editingCategory, setEditingCategory] = useState(null); // stores the category object
  const [editValue, setEditValue] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deletingCategory, setDeletingCategory] = useState(null);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/category`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.data || []);
      } else {
        setError(data.message || "Failed to load categories");
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

  useEffect(() => {
    fetchCategories();
  }, [navigate]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const token = localStorage.getItem("admin_token");
    setAddLoading(true);
    
    try {
      // 1. Create Category
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ category: newCategory })
      });

      const data = await response.json();
      if (response.ok) {
        const categoryId = data.data.id;
        
        // 2. Upload Image if exists
        if (newImage) {
          const formData = new FormData();
          formData.append("image", newImage);
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/category/upload-image?id=${categoryId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: formData
          });
        }

        setNewCategory("");
        setNewImage(null);
        setShowAdd(false);
        fetchCategories();
      } else {
        alert(data.message || "Failed to add category");
      }
    } catch (err) {
      alert("Network error while adding category.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editValue.trim()) {
      setEditingCategory(null);
      return;
    }

    const token = localStorage.getItem("admin_token");
    setEditLoading(true);
    try {
      // 1. Update Category Info
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/category`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id: editingCategory.id,
          category: editValue,
          image: editingCategory.image // keep old image unless changed
        })
      });

      if (response.ok) {
        // 2. Upload New Image if changed
        if (editImage) {
          const formData = new FormData();
          formData.append("image", editImage);
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/category/upload-image?id=${editingCategory.id}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: formData
          });
        }
        setEditingCategory(null);
        setEditImage(null);
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update category");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/category?id=${deletingCategory.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setDeletingCategory(null);
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete category");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <>
      {/* DELETE MODAL OVERLAY */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Delete Category?</h3>
              <p className="text-neutral-500 text-sm mb-8 px-4">
                You are about to remove <span className="font-bold text-neutral-900">{deletingCategory.name}</span>. This action cannot be reversed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingCategory(null)}
                  className="flex-1 px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteCategory}
                  className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* EDIT MODAL OVERLAY */}
      {editingCategory && (
        <div className="fixed inset-0 bg-soxenly-green/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-md p-8 rounded-xl">
            <h3 className="font-display text-4xl uppercase tracking-tighter mb-2">Edit Category</h3>
            <p className="text-xs font-medium text-sm text-neutral-500 mb-6">Updating: {editingCategory.category}</p>
            
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-bold block mb-2">New Name</label>
                <input 
                  type="text"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg p-4 text-sm focus:outline-none focus:border-soxenly-beige focus:ring-1 focus:ring-black transition-all"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] font-bold block mb-2">Change Image</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  className="w-full text-xs font-display border border-dashed border-neutral-300 p-4 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex space-x-4">
                <button 
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setEditImage(null);
                  }}
                  className="flex-1 border border-soxenly-beige bg-white text-soxenly-green font-medium text-sm text-xs py-4 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 border border-soxenly-green bg-soxenly-green text-soxenly-cream font-bold text-[10px] uppercase tracking-wider py-4 hover:bg-white hover:text-soxenly-green transition-all duration-300 disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex justify-between items-end mb-8 border-b border-soxenly-beige pb-4">
        <div>
          <h2 className="text-sm font-medium tracking-[0.2em] text-neutral-500 mb-1">Catalog Management</h2>
          <h1 className="font-serif text-4xl lg:text-5xl text-soxenly-green">Categories</h1>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="px-6 py-2 bg-soxenly-green text-soxenly-cream border border-soxenly-green font-bold text-[10px] uppercase tracking-wider hover:bg-white hover:text-soxenly-green transition-all duration-300"
        >
          {showAdd ? "Cancel" : "+ New Category"}
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 font-bold text-xs border border-red-100 rounded-xl">
          ERROR: {error}
        </div>
      )}

      {showAdd && (
        <div className="mb-8 p-6 bg-white border border-neutral-200 rounded-lg">
          <h3 className="text-xs font-medium tracking-[0.2em] mb-4">Add Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="flex space-x-4">
              <input 
                type="text"
                required
                placeholder="Category Name (e.g. crew, ankle...)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 border border-neutral-200 rounded-lg p-3 text-sm focus:outline-none focus:border-soxenly-beige focus:ring-1 focus:ring-black transition-all"
              />
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files[0])}
                className="flex-1 text-xs font-display border border-dashed border-neutral-200 p-2 rounded-lg cursor-pointer"
              />
            </div>
            <button 
              type="submit"
              disabled={addLoading}
              className="w-full py-4 bg-soxenly-green text-soxenly-cream font-bold text-[10px] uppercase tracking-wider hover:bg-white hover:text-soxenly-green border border-soxenly-green transition-all duration-300 disabled:opacity-50"
            >
              {addLoading ? "Saving..." : "Create Category"}
            </button>
          </form>
        </div>
      )}

      {!showAdd && !editingCategory && (
        <div className="bg-white border border-neutral-200 overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-soxenly-green text-soxenly-cream text-xs uppercase tracking-[0.1em]">
                <th className="p-4 border-b border-soxenly-beige">ID</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Category Name</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Preview</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center uppercase tracking-widest font-bold animate-pulse">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center uppercase tracking-widest font-bold">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const catName = category.category || category.name || category.category_name || "UNKNOWN";
                  const catId = category.id || category.ID || category.Id || "N/A";
                  return (
                    <tr key={catId} className="border-b border-soxenly-beige hover:bg-neutral-100 transition-colors">
                      <td className="p-4 text-sm text-neutral-600">{catId}</td>
                      <td className="p-4 border-l border-soxenly-beige text-sm text-neutral-600">{catName}</td>
                      <td className="p-4 border-l border-soxenly-beige">
                        <div className="w-16 h-16 border border-soxenly-beige bg-neutral-100 overflow-hidden">
                          {category.image ? (
                            <img 
                              src={`${import.meta.env.VITE_API_BASE_URL}${category.image}`} 
                              alt={catName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 font-display">
                              NO IMG
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-l border-soxenly-beige space-x-2">
                        <button 
                          onClick={() => {
                            setEditValue(catName);
                            setEditingCategory(category);
                          }}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-soxenly-green/20 bg-soxenly-green/5 text-soxenly-green hover:bg-soxenly-green hover:text-white transition-all duration-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeletingCategory({ id: category.id, name: catName })}
                          className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
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
