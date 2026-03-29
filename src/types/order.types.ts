export type OrderStatus = 'new' | 'assigned' | 'delivered' | 'cancelled';

export interface CreateOrderDto {
  customer_chat_id: number;
  customer_name?: string;
  customer_phone: string;
  customer_username?: string;

  pickup_lat?: number;
  pickup_lng?: number;
  pickup_address?: string;

  delivery_lat?: number;
  delivery_lng?: number;
  delivery_address?: string;

  order_text: string;

  total_price?: number;
  delivery_fee?: number;
}

export interface Order {
  id: number;

  customer_chat_id: number;
  customer_name?: string;
  customer_phone: string;
  customer_username?: string;

  pickup_lat?: number;
  pickup_lng?: number;
  pickup_address?: string;

  delivery_lat?: number;
  delivery_lng?: number;
  delivery_address?: string;

  order_text: string;

  status: OrderStatus;

  assigned_driver_id?: number;
  assigned_driver_username?: string;
  assigned_driver_name?: string;

  group_message_id?: number;

  total_price?: number;
  delivery_fee?: number;

  created_at: string;
  assigned_at?: string;
  delivered_at?: string;
}