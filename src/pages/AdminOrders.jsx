import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/order?page=${page}&count=10`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.data || []);
      } else {
        setError(data.message || "Failed to load orders");
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

  const [confirmDialog, setConfirmDialog] = useState(null); // { id, type, title, message, action }
  const [successMsg, setSuccessMsg] = useState("");
  const [viewingOrder, setViewingOrder] = useState(null); // stores the entire order object

  const handleApprove = async (orderId) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/order/approve?order_id=${orderId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccessMsg(`Order #${orderId} has been confirmed successfully!`);
        setConfirmDialog(null);
        fetchOrders();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to approve order");
        setConfirmDialog(null);
      }
    } catch (err) {
      alert("Network error");
      setConfirmDialog(null);
    }
  };

  const handleCancel = async (orderId) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/order/cancel?order_id=${orderId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccessMsg(`Order #${orderId} has been cancelled.`);
        setConfirmDialog(null);
        fetchOrders();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to cancel order");
        setConfirmDialog(null);
      }
    } catch (err) {
      alert("Network error");
      setConfirmDialog(null);
    }
  };

  const handleShip = async (orderId) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/order/ship?order_id=${orderId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccessMsg(`Order #${orderId} has been marked as SHIPPED!`);
        setConfirmDialog(null);
        fetchOrders();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to ship order");
        setConfirmDialog(null);
      }
    } catch (err) {
      alert("Network error");
      setConfirmDialog(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, navigate]);

  return (
    <>
      {/* VIEW ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-soxenly-beige w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="bg-soxenly-green text-soxenly-cream p-6">
              <h2 className="text-xs font-medium tracking-[0.2em] opacity-70">Order Manifest</h2>
              <h3 className="font-display text-3xl uppercase tracking-tighter">Order #{viewingOrder.order_id}</h3>
            </div>
            
            <div className="p-8 grid grid-cols-2 gap-12">
              <section>
                <h4 className="text-[10px] font-medium tracking-[0.3em] text-neutral-400 mb-6 pb-2 border-b border-neutral-100">Customer Profile</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-medium text-neutral-500 block mb-1">Full Name</label>
                    <p className="font-bold text-lg uppercase tracking-tight">{viewingOrder.firstname}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-neutral-500 block mb-1">Email Address</label>
                    <p className="font-display text-sm">{viewingOrder.email}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-neutral-500 block mb-1">Contact Number</label>
                    <p className="font-display text-sm">{viewingOrder.phone}</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-medium tracking-[0.3em] text-neutral-400 mb-6 pb-2 border-b border-neutral-100">Shipping Destination</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-medium text-neutral-500 block mb-1">House / Building</label>
                    <p className="font-bold text-sm uppercase tracking-tight">{viewingOrder.house_name}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-neutral-500 block mb-1">Street / Area</label>
                    <p className="font-bold text-sm uppercase tracking-tight">{viewingOrder.street}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-neutral-500 block mb-1">City & State</label>
                    <p className="font-bold text-sm uppercase tracking-tight">{viewingOrder.city}, {viewingOrder.state}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-neutral-500 block mb-1">Postal Code</label>
                    <p className="font-display font-bold text-lg">{viewingOrder.pin}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-8 bg-neutral-50 border-t-4 border-soxenly-beige flex justify-between items-center">
              <div>
                <label className="text-[9px] font-medium text-neutral-500 block mb-1">Total Payable</label>
                <p className="text-3xl font-display uppercase tracking-tighter">₹{viewingOrder.final_price}</p>
              </div>
              <button 
                onClick={() => setViewingOrder(null)}
                className="px-12 py-4 bg-soxenly-green text-soxenly-cream font-medium text-sm text-xs hover:bg-neutral-800 transition-all"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIVERSAL CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                confirmDialog.type === 'cancel' ? 'bg-red-50 text-red-600' : 
                confirmDialog.type === 'ship' ? 'bg-blue-50 text-blue-600' : 
                'bg-green-50 text-green-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {confirmDialog.type === 'cancel' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : confirmDialog.type === 'ship' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2 uppercase tracking-tighter">{confirmDialog.title}</h3>
              <p className="text-neutral-500 text-sm mb-8 px-4 leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all"
                >
                  Go Back
                </button>
                <button 
                  onClick={confirmDialog.action}
                  className={`flex-1 px-6 py-3.5 text-white font-bold rounded-2xl transition-all duration-300 ${
                    confirmDialog.type === 'cancel' ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200' : 
                    confirmDialog.type === 'ship' ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' : 
                    'bg-soxenly-green hover:bg-green-600 shadow-lg shadow-green-200'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* SUCCESS MESSAGE OVERLAY */}
      {successMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-soxenly-green text-soxenly-cream px-8 py-4 rounded-full border border-white font-medium text-sm text-xs flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            {successMsg}
          </div>
        </div>
      )}

      <header className="flex justify-between items-end mb-8 border-b border-soxenly-beige pb-4">
        <div>
          <h2 className="text-sm font-medium tracking-[0.2em] text-neutral-500 mb-1">Fulfillment</h2>
          <h1 className="font-serif text-4xl lg:text-5xl text-soxenly-green">Orders</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-soxenly-beige font-medium text-sm text-xs hover:bg-soxenly-green hover:text-soxenly-cream disabled:opacity-50"
          >
            Prev
          </button>
          <button 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-soxenly-beige font-medium text-sm text-xs hover:bg-soxenly-green hover:text-soxenly-cream"
          >
            Next
          </button>
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
                <th className="p-4 border-b border-soxenly-beige">Order ID</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">User ID</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white text-center">Size</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white text-center">Qty</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Amount</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white text-center">Payment</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white text-center">ORDER STATUS</th>
                <th className="p-4 border-b border-soxenly-beige border-l border-white">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center uppercase tracking-widest font-bold animate-pulse">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center uppercase tracking-widest font-bold">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id || order.Id} className="border-b border-soxenly-beige hover:bg-neutral-100 transition-colors">
                    <td className="p-4 text-sm text-neutral-600">#{order.order_id || order.Id}</td>
                    <td className="p-4 border-l border-soxenly-beige text-sm text-neutral-600">{order.user_id || order.UserId}</td>
                    <td className="p-4 border-l border-soxenly-beige text-center font-display font-bold">{order.size || 'N/A'}</td>
                    <td className="p-4 border-l border-soxenly-beige text-center">
                      <span className="bg-neutral-100 px-2 py-1 rounded text-xs font-bold border border-neutral-200">
                        {order.quantity || 0}
                      </span>
                    </td>
                    <td className="p-4 border-l border-soxenly-beige font-display font-bold">₹{order.final_price || order.FinalPrice}</td>
                    <td className="p-4 border-l border-soxenly-beige text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
                        (order.payment_status || order.PaymentStatus) === 'paid' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {order.payment_status || order.PaymentStatus || 'NOT PAID'}
                      </span>
                    </td>
                    <td className="p-4 border-l border-soxenly-beige text-center">
                      <span className={`px-2 py-1 text-[10px] font-medium text-sm rounded border ${
                        order.shipment_status === 'shipped' ? 'bg-blue-600 text-soxenly-cream border-blue-700' :
                        order.shipment_status === 'confirmed' ? 'bg-green-600 text-soxenly-cream border-green-700' :
                        order.shipment_status === 'order placed' ? 'bg-soxenly-green text-soxenly-cream border-soxenly-beige' :
                        'bg-neutral-100 text-neutral-400 border-neutral-200'
                      }`}>
                        {order.shipment_status || order.ShipmentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4 border-l border-soxenly-beige space-x-2">
                      <button 
                        onClick={() => setViewingOrder(order)}
                        className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-all duration-300"
                      >
                        View
                      </button>
                      
                      {/* Workflow Logic */}
                      {order.shipment_status === 'order placed' && (
                          <button 
                            onClick={() => setConfirmDialog({
                              id: order.order_id || order.Id,
                              type: 'approve',
                              title: 'Confirm Order?',
                              message: `Are you sure you want to confirm order #${order.order_id || order.Id}? This will move it to the next fulfillment stage.`,
                              action: () => handleApprove(order.order_id || order.Id)
                            })}
                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-soxenly-green/20 bg-soxenly-green/5 text-soxenly-green hover:bg-soxenly-green hover:text-white transition-all duration-300"
                          >
                            Approve
                          </button>
                      )}

                      {order.shipment_status === 'confirmed' && (
                          <button 
                            onClick={() => setConfirmDialog({
                              id: order.order_id || order.Id,
                              type: 'ship',
                              title: 'Ship Product?',
                              message: `Is order #${order.order_id || order.Id} packed and ready for dispatch?`,
                              action: () => handleShip(order.order_id || order.Id)
                            })}
                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                          >
                            Ship
                          </button>
                      )}

                      {(order.shipment_status === 'order placed' || order.shipment_status === 'confirmed') && (
                          <button 
                            onClick={() => setConfirmDialog({
                              id: order.order_id || order.Id,
                              type: 'cancel',
                              title: 'Cancel Order?',
                              message: `Warning: You are about to cancel order #${order.order_id || order.Id}. This action cannot be undone.`,
                              action: () => handleCancel(order.order_id || order.Id)
                            })}
                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                          >
                            Cancel
                          </button>
                      )}
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
