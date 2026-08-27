import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: { role: string; subscription: string; full_name: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; userId?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: string; subscription: string; full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("app_users")
      .select("role, subscription, full_name")
      .eq("id", userId)
      .single();

    if (!data) {
      const { data: userData } = await supabase.auth.getUser();
      const fullName = userData?.user?.user_metadata?.full_name || "";
      const email = userData?.user?.email || "";
      await supabase.from("app_users").upsert({
        id: userId,
        email: email,
        role: "user",
        subscription: "free",
        full_name: fullName,
        is_active: true,
      }, { onConflict: "id" });

      const { data: retryData } = await supabase
        .from("app_users")
        .select("role, subscription, full_name")
        .eq("id", userId)
        .single();

      setProfile(retryData);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (!error && data?.user?.id) {
      await supabase.from("app_users").upsert({
        id: data.user.id,
        email: email,
        role: "user",
        subscription: "free",
        full_name: fullName,
        is_active: true,
      }, { onConflict: "id" });
    }

    return { error: error?.message, userId: data?.user?.id };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
