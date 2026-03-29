import { supabase } from '../config/supabase';
import { CreateOrderDto, Order } from '../types/order.types';

export const orderService = {
  async createOrder(data: CreateOrderDto): Promise<Order> {
    const { data: order, error } = await supabase
      .from('orders')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Supabase create order error:', error);
      throw error;
    }

    return order;
  },

  async getOrderById(id: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase get order error:', error);
      return null;
    }

    return data;
  },

  async updateGroupMessageId(orderId: number, groupMessageId: number) {
    const { error } = await supabase
      .from('orders')
      .update({ group_message_id: groupMessageId })
      .eq('id', orderId);

    if (error) {
      console.error('Update group message id error:', error);
      throw error;
    }
  },

  async assignOrder(
    orderId: number,
    driverId: number,
    driverUsername?: string,
    driverName?: string
  ) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'assigned',
        assigned_driver_id: driverId,
        assigned_driver_username: driverUsername,
        assigned_driver_name: driverName,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'new')
      .select()
      .single();

    if (error) {
      console.error('Assign order error:', error);
      return null;
    }

    return data;
  },

  async cancelOrder(orderId: number) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Cancel order error:', error);
      return null;
    }

    return data;
  },

  async markDelivered(orderId: number) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Mark delivered error:', error);
      return null;
    }

    return data;
  },

    async getStats() {
    const { data, error } = await supabase.from('orders').select('*');

    if (error) {
      console.error('Get stats error:', error);
      throw error;
    }

    const total = data.length;
    const newOrders = data.filter((o) => o.status === 'new').length;
    const assigned = data.filter((o) => o.status === 'assigned').length;
    const delivered = data.filter((o) => o.status === 'delivered').length;
    const cancelled = data.filter((o) => o.status === 'cancelled').length;

    return {
      total,
      newOrders,
      assigned,
      delivered,
      cancelled,
    };
  },

  async getDriverStats() {
    const { data, error } = await supabase.from('orders').select('*');

    if (error) {
      console.error('Get driver stats error:', error);
      throw error;
    }

    const driverMap: Record<
      string,
      {
        driverName: string;
        driverUsername?: string;
        totalAssigned: number;
        delivered: number;
      }
    > = {};

    for (const order of data) {
      if (!order.assigned_driver_id) continue;

      const key = String(order.assigned_driver_id);

      if (!driverMap[key]) {
        driverMap[key] = {
          driverName: order.assigned_driver_name || 'Nomaʼlum',
          driverUsername: order.assigned_driver_username,
          totalAssigned: 0,
          delivered: 0,
        };
      }

      driverMap[key].totalAssigned += 1;

      if (order.status === 'delivered') {
        driverMap[key].delivered += 1;
      }
    }

    return Object.values(driverMap);
  },
};