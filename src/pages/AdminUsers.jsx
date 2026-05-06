import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingUser, setDeletingUser] = useState(null); // { id, name }
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users?page=${page}&count=10`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.data || []);
      } else {
        setError(data.message || "Failed to load users");
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
    fetchUsers();
  }, [page, navigate]);

  const handleToggleBlock = async (id, isBlocked) => {
    const token = localStorage.getItem("admin_token");
    const endpoint = isBlocked ? "unblock" : "block";
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${endpoint}?id=${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the list
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update user status");
      }
    } catch (err) {
      alert("Network error. Could not update user.");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users?id=${deletingUser.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDeletingUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      alert("Network error. Could not delete user.");
    }
  };

  return (
    <>
      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Remove User?</h3>
              <p className="text-neutral-500 text-sm mb-8 px-4">
                You are about to permanently delete <span className="font-bold text-neutral-900">{deletingUser.name}</span>. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteUser}
                  className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all duration-300"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-end mb-8 border-b border-soxenly-beige pb-4">
        <div>
          <h2 className="text-sm font-medium tracking-[0.2em] text-neutral-500 mb-1">User Management</h2>
          <h1 className="font-serif text-4xl lg:text-5xl text-soxenly-green">Directory</h1>
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
              disabled={users.length < 10}
              className="p-2 rounded-full hover:bg-soxenly-green hover:text-soxenly-cream transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit"
              title="Next Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 font-bold text-xs border border-red-100 rounded-xl">
          ERROR: {error}
        </div>
      )}

      <div className="bg-white border border-neutral-200 overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-soxenly-green text-soxenly-cream text-xs uppercase tracking-[0.1em]">
                <th className="p-4 border-b border-soxenly-beige">Name</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Email</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Phone</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Status</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center uppercase tracking-widest font-bold animate-pulse">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center uppercase tracking-widest font-bold">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-soxenly-beige hover:bg-neutral-100 transition-colors">
                    <td className="p-4">{user.firstname} {user.lastname}</td>
                    <td className="p-4 border-l border-soxenly-beige">{user.email}</td>
                    <td className="p-4 border-l border-soxenly-beige">{user.phone}</td>
                    <td className="p-4 border-l border-soxenly-beige">
                      {user.blocked ? (
                        <span className="bg-red-50 text-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-red-100">Blocked</span>
                      ) : (
                        <span className="bg-soxenly-green/10 text-soxenly-green px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-soxenly-green/20">Active</span>
                      )}
                    </td>
                    <td className="p-4 border-l border-soxenly-beige">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBlock(user.id, user.blocked)}
                          className={`min-w-[100px] px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all duration-300 ${
                            user.blocked 
                              ? "bg-white text-soxenly-green border-soxenly-green hover:bg-soxenly-green hover:text-white" 
                              : "bg-soxenly-green text-white border-soxenly-green hover:bg-white hover:text-soxenly-green"
                          }`}
                        >
                          {user.blocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() => setDeletingUser({ id: user.id, name: `${user.firstname} ${user.lastname}` })}
                          className="min-w-[100px] px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </>
  );
}
