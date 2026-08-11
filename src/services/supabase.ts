import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { LoyaltyReward, Customer, StampHistory, MenuItem, ShopCustomer, Order, Sale } from "@/types";

// Rewards
export async function getRewards(): Promise<LoyaltyReward[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rewards:", error);
    return [];
  }

  return data.map((r) => ({
    id: r.id,
    businessId: r.business_id,
    name: r.name,
    description: r.description || "",
    stampsRequired: r.stamps_required,
    stampAction: r.stamp_action,
    isActive: r.is_active,
    createdAt: new Date(r.created_at),
  }));
}

export async function getRewardById(id: string): Promise<LoyaltyReward | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("loyalty_rewards")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching reward:", error);
    return null;
  }

  return {
    id: data.id,
    businessId: data.business_id,
    name: data.name,
    description: data.description || "",
    stampsRequired: data.stamps_required,
    stampAction: data.stamp_action,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
  };
}

export async function createReward(reward: Omit<LoyaltyReward, "id" | "createdAt">): Promise<LoyaltyReward | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("loyalty_rewards")
    .insert({
      business_id: reward.businessId,
      name: reward.name,
      description: reward.description,
      stamps_required: reward.stampsRequired,
      stamp_action: reward.stampAction,
      is_active: reward.isActive,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating reward:", error);
    return null;
  }

  return {
    id: data.id,
    businessId: data.business_id,
    name: data.name,
    description: data.description || "",
    stampsRequired: data.stamps_required,
    stampAction: data.stamp_action,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
  };
}

// Customers
export async function getCustomersByReward(rewardId: string): Promise<Customer[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("loyalty_reward_id", rewardId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    businessId: c.business_id,
    loyaltyRewardId: c.loyalty_reward_id,
    firstName: c.first_name,
    lastName: c.last_name,
    phone: c.phone,
    countryCode: c.country_code,
    stamps: c.stamps,
    isCompleted: c.is_completed,
    completedAt: c.completed_at ? new Date(c.completed_at) : null,
    createdAt: new Date(c.created_at),
  }));
}

export async function searchCustomerByPhone(phone: string, loyaltyRewardId?: string): Promise<Customer | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  let query = supabase
    .from("customers")
    .select("*")
    .eq("phone", phone);

  if (loyaltyRewardId) {
    query = query.eq("loyalty_reward_id", loyaltyRewardId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    businessId: data.business_id,
    loyaltyRewardId: data.loyalty_reward_id,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone,
    countryCode: data.country_code,
    stamps: data.stamps,
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : null,
    createdAt: new Date(data.created_at),
  };
}

export async function createCustomer(customer: {
  loyaltyRewardId: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode?: string;
}): Promise<Customer | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      loyalty_reward_id: customer.loyaltyRewardId,
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone: customer.phone,
      country_code: customer.countryCode || "+54",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    return null;
  }

  return {
    id: data.id,
    businessId: data.business_id,
    loyaltyRewardId: data.loyalty_reward_id,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone,
    countryCode: data.country_code,
    stamps: data.stamps,
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : null,
    createdAt: new Date(data.created_at),
  };
}

// Stamps
export async function addStamp(customerId: string): Promise<{ customer: Customer | null; history: StampHistory | null }> {
  if (!isSupabaseConfigured() || !supabase) return { customer: null, history: null };

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (customerError || !customerData) {
    return { customer: null, history: null };
  }

  const newStamps = customerData.stamps + 1;

  const { data: rewardData } = await supabase
    .from("loyalty_rewards")
    .select("stamps_required, name")
    .eq("id", customerData.loyalty_reward_id)
    .single();

  const isCompleted = rewardData ? newStamps >= rewardData.stamps_required : false;

  const { data: updatedCustomer, error: updateError } = await supabase
    .from("customers")
    .update({
      stamps: newStamps,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", customerId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating stamps:", updateError);
    return { customer: null, history: null };
  }

  const message = isCompleted
    ? `🎉 ¡Felicitaciones! Ya puedes canjear tu premio: ${rewardData?.name}`
    : `Gracias por elegir ${rewardData?.name}. Tu tarjeta tiene ${newStamps} de ${rewardData?.stamps_required} sellos`;

  const { data: historyData, error: historyError } = await supabase
    .from("stamp_history")
    .insert({
      customer_id: customerId,
      loyalty_reward_id: customerData.loyalty_reward_id,
      stamps_added: 1,
      total_stamps: newStamps,
      message,
      sent: true,
    })
    .select()
    .single();

  if (historyError) {
    console.error("Error creating history:", historyError);
  }

  return {
    customer: {
      id: updatedCustomer.id,
      businessId: updatedCustomer.business_id,
      loyaltyRewardId: updatedCustomer.loyalty_reward_id,
      firstName: updatedCustomer.first_name,
      lastName: updatedCustomer.last_name,
      phone: updatedCustomer.phone,
      countryCode: updatedCustomer.country_code,
      stamps: updatedCustomer.stamps,
      isCompleted: updatedCustomer.is_completed,
      completedAt: updatedCustomer.completed_at ? new Date(updatedCustomer.completed_at) : null,
      createdAt: new Date(updatedCustomer.created_at),
    },
    history: historyData ? {
      id: historyData.id,
      customerId: historyData.customer_id,
      loyaltyRewardId: historyData.loyalty_reward_id,
      stampsAdded: historyData.stamps_added,
      totalStamps: historyData.total_stamps,
      message: historyData.message,
      sent: historyData.sent,
      timestamp: new Date(historyData.timestamp),
    } : null,
  };
}

// Stats
export async function getBusinessStats() {
  if (!isSupabaseConfigured() || !supabase) {
    return { totalRewards: 0, totalCustomers: 0, totalStamps: 0, completedCards: 0 };
  }

  const [rewardsResult, customersResult] = await Promise.all([
    supabase.from("loyalty_rewards").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id, stamps, is_completed", { count: "exact" }),
  ]);

  return {
    totalRewards: rewardsResult.count || 0,
    totalCustomers: customersResult.count || 0,
    totalStamps: customersResult.data?.reduce((acc, c) => acc + (c.stamps || 0), 0) || 0,
    completedCards: customersResult.data?.filter((c) => c.is_completed).length || 0,
  };
}

// ========== MENU ITEMS ==========
export async function getMenuItems(merchantId: string): Promise<MenuItem[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }

  return data.map((m) => ({
    id: m.id,
    merchantId: m.merchant_id,
    name: m.name,
    description: m.description || "",
    price: m.price,
    category: m.category || "General",
    isAvailable: m.is_available,
    imageUrl: m.image_url || "",
    createdAt: new Date(m.created_at),
  }));
}

export async function createMenuItem(item: Omit<MenuItem, "id" | "createdAt">): Promise<MenuItem | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      merchant_id: item.merchantId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      is_available: item.isAvailable,
      image_url: item.imageUrl || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating menu item:", error);
    return null;
  }

  return {
    id: data.id,
    merchantId: data.merchant_id,
    name: data.name,
    description: data.description || "",
    price: data.price,
    category: data.category,
    isAvailable: data.is_available,
    imageUrl: data.image_url || "",
    createdAt: new Date(data.created_at),
  };
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("menu_items")
    .update({
      name: updates.name,
      description: updates.description,
      price: updates.price,
      category: updates.category,
      is_available: updates.isAvailable,
      image_url: updates.imageUrl,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating menu item:", error);
    return null;
  }

  return {
    id: data.id,
    merchantId: data.merchant_id,
    name: data.name,
    description: data.description || "",
    price: data.price,
    category: data.category,
    isAvailable: data.is_available,
    imageUrl: data.image_url || "",
    createdAt: new Date(data.created_at),
  };
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  return !error;
}

// ========== SHOP CUSTOMERS ==========
export async function getShopCustomers(merchantId: string): Promise<ShopCustomer[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("shop_customers")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching shop customers:", error);
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    merchantId: c.merchant_id,
    phone: c.phone,
    name: c.name,
    address: c.address || "",
    notes: c.notes || "",
    createdAt: new Date(c.created_at),
  }));
}

export async function findShopCustomer(merchantId: string, phone: string): Promise<ShopCustomer | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("shop_customers")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("phone", phone)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    merchantId: data.merchant_id,
    phone: data.phone,
    name: data.name,
    address: data.address || "",
    notes: data.notes || "",
    createdAt: new Date(data.created_at),
  };
}

export async function createShopCustomer(customer: {
  merchantId: string;
  phone: string;
  name: string;
  address?: string;
  notes?: string;
}): Promise<ShopCustomer | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("shop_customers")
    .insert({
      merchant_id: customer.merchantId,
      phone: customer.phone,
      name: customer.name,
      address: customer.address || "",
      notes: customer.notes || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating shop customer:", error);
    return null;
  }

  return {
    id: data.id,
    merchantId: data.merchant_id,
    phone: data.phone,
    name: data.name,
    address: data.address || "",
    notes: data.notes || "",
    createdAt: new Date(data.created_at),
  };
}

// ========== ORDERS ==========
export async function getOrdersByMerchant(merchantId: string): Promise<Order[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, shop_customers(name, phone, address)")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data.map((o) => ({
    id: o.id,
    merchantId: o.merchant_id,
    customerId: o.customer_id,
    customerName: o.shop_customers?.name || "",
    customerPhone: o.shop_customers?.phone || "",
    customerAddress: o.shop_customers?.address || "",
    items: o.items || [],
    total: o.total,
    status: o.status,
    createdAt: new Date(o.created_at),
    updatedAt: new Date(o.updated_at),
  }));
}

export async function createOrder(order: {
  merchantId: string;
  customerId: string;
  items: { menuItemId: string; name: string; price: number; quantity: number }[];
  total: number;
}): Promise<Order | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      merchant_id: order.merchantId,
      customer_id: order.customerId,
      items: order.items,
      total: order.total,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    return null;
  }

  return {
    id: data.id,
    merchantId: data.merchant_id,
    customerId: data.customer_id,
    items: data.items,
    total: data.total,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  return !error;
}

// ========== SALES ==========
export async function getSalesByMerchant(merchantId: string): Promise<Sale[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    return [];
  }

  return data.map((s) => ({
    id: s.id,
    merchantId: s.merchant_id,
    orderId: s.order_id,
    amount: s.amount,
    description: s.description || "",
    type: s.type,
    createdAt: new Date(s.created_at),
  }));
}

export async function createSale(sale: {
  merchantId: string;
  orderId?: string;
  amount: number;
  description: string;
  type: "order" | "manual";
}): Promise<Sale | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("sales")
    .insert({
      merchant_id: sale.merchantId,
      order_id: sale.orderId || null,
      amount: sale.amount,
      description: sale.description,
      type: sale.type,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating sale:", error);
    return null;
  }

  return {
    id: data.id,
    merchantId: data.merchant_id,
    orderId: data.order_id,
    amount: data.amount,
    description: data.description || "",
    type: data.type,
    createdAt: new Date(data.created_at),
  };
}
