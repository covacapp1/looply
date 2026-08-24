import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Clock } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  mercadopagoLink: string;
  paypalLink: string;
  daysLeft: number;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function SubscriptionModal({ isOpen, mercadopagoLink, paypalLink, daysLeft }: SubscriptionModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"mercadopago" | "paypal" | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

  useEffect(() => {
    if (selectedMethod === "paypal" && paypalRef.current && !paypalRendered.current) {
      renderPayPalButton();
    }
  }, [selectedMethod]);

  useEffect(() => {
    paypalRendered.current = false;
  }, [isOpen]);

  function renderPayPalButton() {
    if (!window.paypal || !paypalRef.current) {
      setTimeout(renderPayPalButton, 500);
      return;
    }

    paypalRef.current.innerHTML = "";
    paypalRendered.current = true;

    window.paypal.HostedButtons({
      hostedButtonId: "F5QJ3NFVJCY7Q",
    }).render(paypalRef.current);
  }

  const handleMercadoPago = () => {
    if (mercadopagoLink) {
      window.open(mercadopagoLink, "_blank");
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {daysLeft <= 0 ? "Suscripción Vencida" : "Tu suscripción está por vencer"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {daysLeft > 0 && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Te quedan {daysLeft} días
              </span>
            </div>
          )}

          {daysLeft <= 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Para seguir usando Looply, aboná tu suscripción mensual.
            </p>
          )}

          {daysLeft > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Elegí tu método de pago para renovar tu suscripción.
            </p>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Método de pago</p>

            <button
              type="button"
              onClick={() => setSelectedMethod("mercadopago")}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                selectedMethod === "mercadopago"
                  ? "border-blue-500 bg-blue-50"
                  : "border-border hover:border-blue-300"
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Mercado Pago</p>
                <p className="text-sm text-muted-foreground">$15.000 ARS / mes</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("paypal")}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                selectedMethod === "paypal"
                  ? "border-blue-500 bg-blue-50"
                  : "border-border hover:border-blue-300"
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">PayPal</p>
                <p className="text-sm text-muted-foreground">$10 USD / mes</p>
              </div>
            </button>
          </div>

          {selectedMethod === "mercadopago" && (
            <Button className="w-full" size="lg" onClick={handleMercadoPago}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Pagar con Mercado Pago
            </Button>
          )}

          {selectedMethod === "paypal" && (
            <div className="flex justify-center">
              <div ref={paypalRef} />
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Después de pagar, contactanos para activar tu cuenta.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
