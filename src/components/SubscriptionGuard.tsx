import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionModal } from "@/components/SubscriptionModal";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { settings, isExpired, daysLeft, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
      <SubscriptionModal
        isOpen={isExpired}
        mercadopagoLink={settings?.mercadopagoLink || ""}
        paypalLink={settings?.paypalLink || ""}
        daysLeft={daysLeft}
      />
    </>
  );
}
