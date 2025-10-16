import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowLeft
} from 'lucide-react';
import {
  fetchOrdersByDateRange,
  getDateRange,
  calculateAnalyticsSummary,
  analyzeProductSales,
  analyzeDeviceStats,
  analyzeHourlyOrders,
  analyzeDeliveryZones,
  analyzeDailyTrend,
  exportToCSV,
  type OrderData,
  type AnalyticsSummary,
  type ProductSalesData,
  type DeviceStats,
  type HourlyOrderData,
  type DeliveryZoneStats
} from '../services/analytics.service';

type TimePeriod = 'today' | 'yesterday' | 'week' | 'month' | 'year';

export default function Analytics() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [productSales, setProductSales] = useState<ProductSalesData[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyOrderData[]>([]);
  const [zoneStats, setZoneStats] = useState<DeliveryZoneStats[]>([]);
  const [dailyTrend, setDailyTrend] = useState<Array<{ date: string; orderCount: number; revenue: number }>>([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    loadAnalytics();
  }, [selectedPeriod, navigate]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      const fetchedOrders = await fetchOrdersByDateRange(startDate, endDate);

      setOrders(fetchedOrders);
      setSummary(calculateAnalyticsSummary(fetchedOrders));
      setProductSales(analyzeProductSales(fetchedOrders));
      setDeviceStats(analyzeDeviceStats(fetchedOrders));
      setHourlyData(analyzeHourlyOrders(fetchedOrders));
      setZoneStats(analyzeDeliveryZones(fetchedOrders));
      setDailyTrend(analyzeDailyTrend(fetchedOrders, selectedPeriod === 'week' ? 7 : 30));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = orders.map(order => ({
      Date: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '',
      Time: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString() : '',
      Customer: order.name,
      Phone: order.phone,
      Type: order.orderType || (order.address === 'Abholung' ? 'Pickup' : 'Delivery'),
      Total: order.total.toFixed(2),
      Items: order.items.map(item => `${item.quantity}x ${item.name}`).join('; ')
    }));

    exportToCSV(exportData, `orders-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const StatCard = ({ title, value, icon: Icon, trend, subtitle, color = 'blue' }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: number;
    subtitle?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500'
    };

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/30 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-slate-300 text-sm mb-1">{title}</p>
            <p className="text-white text-3xl font-bold mb-2">{value}</p>
            {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
            {trend !== undefined && trend !== 0 && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {trend > 0 ? <ArrowUp className="w-4 h-4" /> : trend < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-3 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-300">Comprehensive sales and customer insights</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(['today', 'yesterday', 'week', 'month', 'year'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedPeriod === period
                  ? 'bg-orange-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={`€${summary.totalRevenue.toFixed(2)}`}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Total Orders"
                value={summary.totalOrders}
                icon={ShoppingCart}
                color="blue"
              />
              <StatCard
                title="Average Order"
                value={`€${summary.averageOrderValue.toFixed(2)}`}
                icon={TrendingUp}
                color="purple"
              />
              <StatCard
                title="Pickup vs Delivery"
                value={`${summary.pickupOrders} / ${summary.deliveryOrders}`}
                icon={Package}
                subtitle={`€${summary.pickupRevenue.toFixed(2)} / €${summary.deliveryRevenue.toFixed(2)}`}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  Top Products
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {productSales.slice(0, 10).map((product, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{product.productName}</p>
                        <p className="text-slate-400 text-xs">{product.quantity} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">€{product.revenue.toFixed(2)}</p>
                        <p className="text-slate-400 text-xs">{product.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  Device & Browser Stats
                </h3>
                {deviceStats && (
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="text-slate-300 text-sm mb-2">Device Type</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-semibold">{deviceStats.mobile}</span>
                          <span className="text-slate-400 text-sm">Mobile</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-green-400" />
                          <span className="text-white font-semibold">{deviceStats.desktop}</span>
                          <span className="text-slate-400 text-sm">Desktop</span>
                        </div>
                      </div>
                      {deviceStats.mobile > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-slate-400 text-xs mb-2">Mobile OS</p>
                          <div className="flex gap-4">
                            <span className="text-white text-sm">iOS: {deviceStats.ios}</span>
                            <span className="text-white text-sm">Android: {deviceStats.android}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="text-slate-300 text-sm mb-2">Browsers</p>
                      <div className="space-y-2">
                        {Object.entries(deviceStats.browsers).map(([browser, count]) => (
                          <div key={browser} className="flex justify-between items-center">
                            <span className="text-slate-300 text-sm">{browser}</span>
                            <span className="text-white font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Peak Order Hours
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {hourlyData
                    .filter(h => h.orderCount > 0)
                    .sort((a, b) => b.orderCount - a.orderCount)
                    .map((hour) => (
                      <div key={hour.hour} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                        <div className="text-orange-400 font-bold text-lg w-16">
                          {hour.hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                              style={{
                                width: `${(hour.orderCount / Math.max(...hourlyData.map(h => h.orderCount))) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{hour.orderCount}</p>
                          <p className="text-slate-400 text-xs">€{hour.revenue.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  Delivery Zones
                </h3>
                {zoneStats.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {zoneStats.map((zone, index) => (
                      <div key={index} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white font-semibold capitalize">{zone.zone.replace(/-/g, ' ')}</p>
                          <span className="text-slate-400 text-sm">{zone.orderCount} orders</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-semibold">€{zone.revenue.toFixed(2)}</span>
                          <span className="text-slate-400 text-sm">Avg: €{zone.averageOrderValue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    No delivery orders in this period
                  </div>
                )}
              </div>
            </div>

            {dailyTrend.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Daily Trend
                </h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {dailyTrend.map((day, index) => {
                      const maxRevenue = Math.max(...dailyTrend.map(d => d.revenue));
                      const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 200 : 0;

                      return (
                        <div key={index} className="flex flex-col items-center gap-2">
                          <div className="text-slate-400 text-xs">{day.orderCount}</div>
                          <div
                            className="w-12 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t"
                            style={{ height: `${height}px`, minHeight: day.revenue > 0 ? '20px' : '0' }}
                          />
                          <div className="text-slate-300 text-xs text-center w-12">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-green-400 text-xs font-semibold">€{day.revenue.toFixed(0)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
