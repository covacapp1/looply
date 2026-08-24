import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { LoyaltyReward, Customer, StampHistory, MenuItem, ShopCustomer, Order, Sale, DailyRegister, CuentaCorriente, ProductVariant } from "@/types";

function migrateVariants(variants: any[]): ProductVariant[] {
  return (variants || []).map((v: any) => ({
    name: v.name,
    options: v.options.map((o: any) =>
      typeof o === "string"
        ? { name: o, price: 0, cost: 0 }
        : { name: o.name, price: o.price || 0, cost: o.cost || 0 }
    ),
  }));
}

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
export interface AddStampResult {
  customer: Customer | null;
  history: StampHistory | null;
  businessName: string;
  businessLogo: string;
  rewardName: string;
  rewardDescription: string;
  stampAction: string;
  stampsRequired: number;
}

export async function addStamp(customerId: string, userId?: string): Promise<AddStampResult> {
  const emptyResult: AddStampResult = {
    customer: null,
    history: null,
    businessName: "",
    businessLogo: "",
    rewardName: "",
    rewardDescription: "",
    stampAction: "",
    stampsRequired: 0,
  };

  if (!isSupabaseConfigured() || !supabase) return emptyResult;

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (customerError || !customerData) {
    return emptyResult;
  }

  const newStamps = customerData.stamps + 1;

  const { data: rewardData } = await supabase
    .from("loyalty_rewards")
    .select("stamps_required, name, description, stamp_action")
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
    return emptyResult;
  }

  let businessName = "Tu negocio";
  let businessLogo = "";

  if (userId) {
    const { data: settingsData } = await supabase
      .from("business_settings")
      .select("name, logo")
      .eq("user_id", userId)
      .single();
    
    if (settingsData) {
      businessName = settingsData.name || "Tu negocio";
      businessLogo = settingsData.logo || "";
    }
  } else {
    const local = JSON.parse(localStorage.getItem("businessSettings") || "{}");
    businessName = local.name || "Tu negocio";
    businessLogo = local.logo || "";
  }

  const message = isCompleted
    ? `🎉 ¡Felicitaciones de ${businessName}! Ya puedes canjear tu premio: ${rewardData?.name}`
    : `Gracias por elegir ${businessName}. Tu tarjeta de ${rewardData?.name} tiene ${newStamps} de ${rewardData?.stamps_required} sellos`;

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
    businessName,
    businessLogo,
    rewardName: rewardData?.name || "",
    rewardDescription: rewardData?.description || "",
    stampAction: rewardData?.stamp_action || "",
    stampsRequired: rewardData?.stamps_required || 0,
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
    cost: m.cost || 0,
    category: m.category || "General",
    isAvailable: m.is_available,
    imageUrl: m.image_url || "",
    variants: migrateVariants(m.variants),
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
      cost: item.cost || 0,
      category: item.category,
      is_available: item.isAvailable,
      image_url: item.imageUrl || "",
      variants: item.variants || [],
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
    cost: data.cost || 0,
    category: data.category,
    isAvailable: data.is_available,
    imageUrl: data.image_url || "",
    variants: migrateVariants(data.variants),
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
      cost: updates.cost,
      category: updates.category,
      is_available: updates.isAvailable,
      image_url: updates.imageUrl,
      variants: updates.variants,
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
    cost: data.cost || 0,
    category: data.category,
    isAvailable: data.is_available,
    imageUrl: data.image_url || "",
    variants: migrateVariants(data.variants),
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

  // Buscar en shop_customers primero
  const { data: shopData, error: shopError } = await supabase
    .from("shop_customers")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("phone", phone)
    .maybeSingle();

  if (!shopError && shopData) {
    return {
      id: shopData.id,
      merchantId: shopData.merchant_id,
      phone: shopData.phone,
      name: shopData.name,
      address: shopData.address || "",
      notes: shopData.notes || "",
      createdAt: new Date(shopData.created_at),
    };
  }

  // Si no se encontró, buscar en customers (tabla de fidelidad) por teléfono
  const { data: loyaltyData } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (loyaltyData) {
    // Auto-registrar en shop_customers para que aparezca en el shop
    const newCustomer = await createShopCustomer({
      merchantId,
      phone: loyaltyData.phone,
      name: `${loyaltyData.first_name} ${loyaltyData.last_name}`,
    });
    return newCustomer;
  }

  return null;
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
    .upsert({
      merchant_id: customer.merchantId,
      phone: customer.phone,
      name: customer.name,
      address: customer.address || "",
      notes: customer.notes || "",
    }, { onConflict: "merchant_id,phone" })
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
    notes: o.notes || "",
    status: o.status,
    createdAt: new Date(o.created_at),
    updatedAt: new Date(o.updated_at),
  }));
}

export async function createOrder(order: {
  merchantId: string;
  customerId: string;
  items: { menuItemId: string; name: string; price: number; quantity: number; variants?: Record<string, Record<string, number>>; variantPrices?: Record<string, Record<string, number>> }[];
  total: number;
  notes?: string;
}): Promise<Order | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      merchant_id: order.merchantId,
      customer_id: order.customerId,
      items: order.items,
      total: order.total,
      notes: order.notes || null,
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
    notes: data.notes,
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

// ========== DAILY REGISTERS ==========
export async function getOpenRegister(merchantId: string): Promise<DailyRegister | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("daily_registers")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    merchantId: data.merchant_id,
    openingAmount: data.opening_amount,
    closingAmount: data.closing_amount,
    status: data.status,
    openedAt: new Date(data.opened_at),
    closedAt: data.closed_at ? new Date(data.closed_at) : null,
  };
}

export async function openRegister(merchantId: string, openingAmount: number): Promise<DailyRegister | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("daily_registers")
    .insert({
      merchant_id: merchantId,
      opening_amount: openingAmount,
    })
    .select()
    .single();

  if (error) {
    console.error("Error opening register:", error);
    return null;
  }

  return {
    id: data.id,
    merchantId: data.merchant_id,
    openingAmount: data.opening_amount,
    closingAmount: data.closing_amount,
    status: data.status,
    openedAt: new Date(data.opened_at),
    closedAt: data.closed_at ? new Date(data.closed_at) : null,
  };
}

export async function closeRegister(registerId: string, closingAmount: number): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from("daily_registers")
    .update({
      closing_amount: closingAmount,
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", registerId);

  return !error;
}

export async function getClosedRegisters(merchantId: string, limit = 30): Promise<DailyRegister[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("daily_registers")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return data.map((r) => ({
    id: r.id,
    merchantId: r.merchant_id,
    openingAmount: r.opening_amount,
    closingAmount: r.closing_amount,
    status: r.status,
    openedAt: new Date(r.opened_at),
    closedAt: r.closed_at ? new Date(r.closed_at) : null,
  }));
}

// ========== BUSINESS SETTINGS ==========

export interface BusinessSettings {
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  website: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  orderMessage: string;
  orderTime: string;
  openTime: string;
  closeTime: string;
}

const defaultSettings: BusinessSettings = {
  name: "",
  slug: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  website: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
  orderMessage: "Hola {cliente}, gracias por tu compra. Tu pedido #{pedido} fue recibido y estará listo en aproximadamente {tiempo} minutos.",
  orderTime: "30",
  openTime: "09:00",
  closeTime: "22:00",
};

export async function getBusinessSettings(userId: string): Promise<BusinessSettings> {
  if (!isSupabaseConfigured() || !supabase) {
    const local = localStorage.getItem("businessSettings");
    return local ? { ...defaultSettings, ...JSON.parse(local) } : defaultSettings;
  }

  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    const local = localStorage.getItem("businessSettings");
    return local ? { ...defaultSettings, ...JSON.parse(local) } : defaultSettings;
  }

  const settings: BusinessSettings = {
    name: data.name || "",
    slug: data.slug || "",
    description: data.description || "",
    phone: data.phone || "",
    email: data.email || "",
    address: data.address || "",
    city: data.city || "",
    country: data.country || "",
    website: data.website || "",
    instagram: data.instagram || "",
    facebook: data.facebook || "",
    whatsapp: data.whatsapp || "",
    orderMessage: data.order_message || defaultSettings.orderMessage,
    orderTime: data.order_time || defaultSettings.orderTime,
    openTime: data.open_time || defaultSettings.openTime,
    closeTime: data.close_time || defaultSettings.closeTime,
  };

  localStorage.setItem("businessSettings", JSON.stringify(settings));
  return settings;
}

export async function saveBusinessSettings(userId: string, settings: BusinessSettings): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    localStorage.setItem("businessSettings", JSON.stringify(settings));
    return true;
  }

  const { error } = await supabase
    .from("business_settings")
    .upsert({
      user_id: userId,
      name: settings.name,
      slug: settings.slug,
      description: settings.description,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      website: settings.website,
      instagram: settings.instagram,
      facebook: settings.facebook,
      whatsapp: settings.whatsapp,
      order_message: settings.orderMessage,
      order_time: settings.orderTime,
      open_time: settings.openTime,
      close_time: settings.closeTime,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Error saving business settings:", error);
    return false;
  }

  localStorage.setItem("businessSettings", JSON.stringify(settings));
  return true;
}

// Cuenta Corriente
export async function createCuentaCorriente(entry: {
  merchantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  total: number;
}): Promise<CuentaCorriente | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("cuenta_corriente")
    .insert({
      merchant_id: entry.merchantId,
      customer_id: entry.customerId,
      customer_name: entry.customerName,
      customer_phone: entry.customerPhone,
      order_id: entry.orderId,
      total: entry.total,
      paid: 0,
      remaining: entry.total,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating cuenta corriente:", error);
    return null;
  }

  return {
    id: data.id,
    merchantId: data.merchant_id,
    customerId: data.customer_id,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    orderId: data.order_id,
    total: data.total,
    paid: data.paid,
    remaining: data.remaining,
    createdAt: new Date(data.created_at),
    status: data.status,
  };
}

export async function getCuentaCorriente(merchantId: string): Promise<CuentaCorriente[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("cuenta_corriente")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cuenta corriente:", error);
    return [];
  }

  return data.map((d) => ({
    id: d.id,
    merchantId: d.merchant_id,
    customerId: d.customer_id,
    customerName: d.customer_name,
    customerPhone: d.customer_phone,
    orderId: d.order_id,
    total: d.total,
    paid: d.paid,
    remaining: d.remaining,
    createdAt: new Date(d.created_at),
    status: d.status,
  }));
}

export async function payCuentaCorriente(id: string, amount: number): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { data: current, error: fetchError } = await supabase
    .from("cuenta_corriente")
    .select("paid, total")
    .eq("id", id)
    .single();

  if (fetchError || !current) return false;

  const newPaid = current.paid + amount;
  const newRemaining = current.total - newPaid;
  const newStatus = newRemaining <= 0 ? "paid" : "pending";

  const { error } = await supabase
    .from("cuenta_corriente")
    .update({
      paid: newPaid,
      remaining: Math.max(0, newRemaining),
      status: newStatus,
    })
    .eq("id", id);

  return !error;
}

export async function deleteCuentaCorriente(id: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from("cuenta_corriente")
    .delete()
    .eq("id", id);

  return !error;
}
