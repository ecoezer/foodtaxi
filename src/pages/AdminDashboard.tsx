import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LogOut, Trash2, Phone, Mail, User, MapPin, Clock, Package, MessageSquare } from 'lucide-react';

interface Order {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  deliveryTime: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  notes?: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (error) {
        alert('Failed to delete order');
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Order Management</h1>
            <p className="text-slate-300">Manage and track all incoming orders</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-slate-300">Orders will appear here once customers place them</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">{order.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 p-2 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{order.phone}</span>
                    </div>
                    {order.email && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{order.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-red-400 mt-1" />
                      <span className="text-sm">{order.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">Delivery: {order.deliveryTime}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-white font-medium">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-white/20 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-white">Total</span>
                          <span className="text-green-400">€{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Notes</h4>
                        <p className="text-slate-300 text-sm">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
