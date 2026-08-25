import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBusinessSettings } from "@/services/supabase";
import type { BusinessSettings } from "@/services/supabase";

export function useSubscription() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getBusinessSettings(user.id).then((s) => {
      setSettings(s);
      checkSubscription(s);
      setLoading(false);
    });
  }, [user]);

  function checkSubscription(s: BusinessSettings) {
    if (!s.planStart) {
      // No plan start → activate 6 months free from now
      setIsExpired(false);
      setDaysLeft(180);
      return;
    }

    const start = new Date(s.planStart);
    const end = new Date(start);
    end.setMonth(end.getMonth() + (s.planMonths || 3));

    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    setDaysLeft(days);
    setIsExpired(days <= 0);
  }

  function refresh() {
    if (!user) return;
    getBusinessSettings(user.id).then((s) => {
      setSettings(s);
      checkSubscription(s);
    });
  }

  return { settings, isExpired, daysLeft, loading, refresh };
}
