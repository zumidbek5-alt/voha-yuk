import { Order } from '../types/order.types';

function getStatusBadge(status: string) {
  switch (status) {
    case 'new':
      return '🆕 Yangi buyurtma';
    case 'assigned':
      return '🚚 Driver oldi';
    case 'cancelled':
      return '❌ Bekor qilingan';
    case 'delivered':
      return '✅ Yetkazilgan';
    default:
      return '📦 Buyurtma';
  }
}

export function formatOrderMessage(order: Order) {
  const customer = order.customer_name || 'Nomaʼlum';
  const username = order.customer_username ? `(@${order.customer_username})` : '';

  const locationText =
    order.pickup_lat && order.pickup_lng
      ? `https://maps.google.com/?q=${order.pickup_lat},${order.pickup_lng}`
      : order.pickup_address || 'Lokatsiya yo‘q';

  return `${getStatusBadge(order.status)} #${order.id}

👤 Mijoz: ${customer} ${username}
📞 Tel: ${order.customer_phone}
📍 Manzil: ${locationText}

📦 Buyurtma: ${order.order_text}

${
  order.assigned_driver_name
    ? `🚚 Driver: ${order.assigned_driver_name} ${
        order.assigned_driver_username ? `(@${order.assigned_driver_username})` : ''
      }\n`
    : ''
}
⏰ Vaqt: ${new Date(order.created_at).toLocaleString('uz-UZ')}`;
}