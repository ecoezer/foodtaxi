import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface OrderData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  deliveryTime: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  orderType?: string;
  deliveryZone?: string;
  notes?: string;
  createdAt: any;
  deviceInfo?: {
    deviceType: string;
    mobileOS: string;
    deviceModel: string;
    browser: string;
    screenWidth: number;
    screenHeight: number;
    userAgent: string;
  };
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pickupOrders: number;
  deliveryOrders: number;
  pickupRevenue: number;
  deliveryRevenue: number;
}

export interface ProductSalesData {
  productName: string;
  productNumber: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface DeviceStats {
  mobile: number;
  desktop: number;
  ios: number;
  android: number;
  browsers: { [key: string]: number };
}

export interface HourlyOrderData {
  hour: number;
  orderCount: number;
  revenue: number;
}

export interface DeliveryZoneStats {
  zone: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
}

export const getDateRange = (period: 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom', customStart?: Date, customEnd?: Date) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
  }

  return { startDate, endDate };
};

export const fetchOrdersByDateRange = async (startDate: Date, endDate: Date): Promise<OrderData[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(
      ordersRef,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: OrderData[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as OrderData);
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const calculateAnalyticsSummary = (orders: OrderData[]): AnalyticsSummary => {
  let totalRevenue = 0;
  let pickupOrders = 0;
  let deliveryOrders = 0;
  let pickupRevenue = 0;
  let deliveryRevenue = 0;

  orders.forEach(order => {
    const orderTotal = order.total || 0;
    totalRevenue += orderTotal;

    if (order.orderType === 'pickup') {
      pickupOrders++;
      pickupRevenue += orderTotal;
    } else if (order.orderType === 'delivery') {
      deliveryOrders++;
      deliveryRevenue += orderTotal;
    } else {
      if (order.address === 'Abholung') {
        pickupOrders++;
        pickupRevenue += orderTotal;
      } else {
        deliveryOrders++;
        deliveryRevenue += orderTotal;
      }
    }
  });

  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    pickupOrders,
    deliveryOrders,
    pickupRevenue,
    deliveryRevenue
  };
};

export const analyzeProductSales = (orders: OrderData[]): ProductSalesData[] => {
  const productMap = new Map<string, { quantity: number; revenue: number }>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const key = item.name;
      const existing = productMap.get(key) || { quantity: 0, revenue: 0 };
      productMap.set(key, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + (item.price * item.quantity)
      });
    });
  });

  const totalRevenue = Array.from(productMap.values()).reduce((sum, item) => sum + item.revenue, 0);

  const productSales: ProductSalesData[] = [];
  productMap.forEach((data, name) => {
    const numberMatch = name.match(/^(\d+)/);
    productSales.push({
      productName: name,
      productNumber: numberMatch ? numberMatch[1] : '',
      quantity: data.quantity,
      revenue: data.revenue,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    });
  });

  return productSales.sort((a, b) => b.quantity - a.quantity);
};

export const analyzeDeviceStats = (orders: OrderData[]): DeviceStats => {
  const stats: DeviceStats = {
    mobile: 0,
    desktop: 0,
    ios: 0,
    android: 0,
    browsers: {}
  };

  orders.forEach(order => {
    if (order.deviceInfo) {
      if (order.deviceInfo.deviceType === 'Mobile') {
        stats.mobile++;
      } else {
        stats.desktop++;
      }

      if (order.deviceInfo.mobileOS.includes('iOS')) {
        stats.ios++;
      } else if (order.deviceInfo.mobileOS.includes('Android')) {
        stats.android++;
      }

      const browser = order.deviceInfo.browser || 'Unknown';
      stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;
    }
  });

  return stats;
};

export const analyzeHourlyOrders = (orders: OrderData[]): HourlyOrderData[] => {
  const hourlyMap = new Map<number, { count: number; revenue: number }>();

  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, { count: 0, revenue: 0 });
  }

  orders.forEach(order => {
    if (order.createdAt) {
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const hour = date.getHours();
      const existing = hourlyMap.get(hour) || { count: 0, revenue: 0 };
      hourlyMap.set(hour, {
        count: existing.count + 1,
        revenue: existing.revenue + (order.total || 0)
      });
    }
  });

  const hourlyData: HourlyOrderData[] = [];
  hourlyMap.forEach((data, hour) => {
    hourlyData.push({
      hour,
      orderCount: data.count,
      revenue: data.revenue
    });
  });

  return hourlyData;
};

export const analyzeDeliveryZones = (orders: OrderData[]): DeliveryZoneStats[] => {
  const zoneMap = new Map<string, { count: number; revenue: number }>();

  orders.forEach(order => {
    if (order.orderType === 'delivery' && order.deliveryZone) {
      const zone = order.deliveryZone;
      const existing = zoneMap.get(zone) || { count: 0, revenue: 0 };
      zoneMap.set(zone, {
        count: existing.count + 1,
        revenue: existing.revenue + (order.total || 0)
      });
    }
  });

  const zoneStats: DeliveryZoneStats[] = [];
  zoneMap.forEach((data, zone) => {
    zoneStats.push({
      zone,
      orderCount: data.count,
      revenue: data.revenue,
      averageOrderValue: data.count > 0 ? data.revenue / data.count : 0
    });
  });

  return zoneStats.sort((a, b) => b.orderCount - a.orderCount);
};

export const analyzeDailyTrend = (orders: OrderData[], days: number = 7): Array<{ date: string; orderCount: number; revenue: number }> => {
  const dailyMap = new Map<string, { count: number; revenue: number }>();

  orders.forEach(order => {
    if (order.createdAt) {
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { count: 0, revenue: 0 };
      dailyMap.set(dateKey, {
        count: existing.count + 1,
        revenue: existing.revenue + (order.total || 0)
      });
    }
  });

  const dailyData: Array<{ date: string; orderCount: number; revenue: number }> = [];
  dailyMap.forEach((data, date) => {
    dailyData.push({
      date,
      orderCount: data.count,
      revenue: data.revenue
    });
  });

  return dailyData.sort((a, b) => a.date.localeCompare(b.date));
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
