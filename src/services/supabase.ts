import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { LoyaltyReward, Customer, StampHistory } from "@/types";

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
