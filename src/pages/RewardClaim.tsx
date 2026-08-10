import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getRewardById, createCustomer, searchCustomerByPhone } from "@/services/supabase";
import type { LoyaltyReward } from "@/types";
import {
  Gift,
  Check,
  Loader2,
  UserPlus,
  MessageCircle,
} from "lucide-react";

export default function RewardClaimPage() {
  const { id } = useParams<{ id: string }>();
  const [reward, setReward] = useState<LoyaltyReward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "success" | "already_registered">("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+54",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadReward() {
      if (!id) {
        setError("ID de premio no válido");
        setLoading(false);
        return;
      }

      const data = await getRewardById(id);
      if (!data) {
        setError("Premio no encontrado");
        setLoading(false);
        return;
      }

      if (!data.isActive) {
        setError("Este premio no está activo");
        setLoading(false);
        return;
      }

      setReward(data);
      setLoading(false);
    }

    loadReward();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reward) return;

    setSubmitting(true);

    // Check if customer already exists with this phone
    const existing = await searchCustomerByPhone(formData.phone);

    if (existing) {
      setStep("already_registered");
      setSubmitting(false);
      return;
    }

    const customer = await createCustomer({
      loyaltyRewardId: reward.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      countryCode: formData.countryCode,
    });

    if (customer) {
      setStep("success");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">😔</span>
            </div>
            <p className="font-semibold text-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Contactá al negocio para más información
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "success" && reward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">¡Bienvenido!</h2>
              <p className="text-muted-foreground mb-4">
                Te registraste correctamente en el programa de fidelización
              </p>
              <div className="rounded-xl border border-border bg-muted/30 p-4 mb-4">
                <p className="text-sm text-muted-foreground">Tu premio:</p>
                <p className="font-bold text-primary text-lg">{reward.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {reward.stampAction} {reward.stampsRequired} veces
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex justify-center gap-2 mb-3">
                  {Array.from({ length: reward.stampsRequired }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full flex items-center justify-center border-2 bg-muted border-border text-muted-foreground"
                    >
                      <span className="text-sm font-bold">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  0 de {reward.stampsRequired} sellos
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 justify-center">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <p className="text-sm text-foreground">
                    Recibirás un WhatsApp cuando te agreguen un sello
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (step === "already_registered") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">ℹ️</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Ya estás registrado</h2>
              <p className="text-muted-foreground">
                Ya tenés una cuenta en este programa de fidelización. Consultá al negocio para ver tu progreso.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <img src="/logo2.png" alt="LOOPLY" className="h-16 w-16 rounded-xl shadow-lg mx-auto mb-3 object-cover" />
          <h1 className="text-2xl font-bold text-foreground">LOOPLY</h1>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="h-6 w-6 text-primary" />
              <CardTitle>{reward?.name}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{reward?.description}</p>
            <Badge variant="outline" className="mx-auto mt-2">
              {reward?.stampsRequired} sellos para canjear
            </Badge>
          </CardHeader>
          <CardContent>
            {/* Stamp Preview */}
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: reward?.stampsRequired || 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full flex items-center justify-center border-2 bg-muted border-border text-muted-foreground"
                >
                  <span className="text-sm font-bold">{i + 1}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 mb-6">
              <p className="text-sm text-center text-foreground">
                <span className="font-semibold">Para ganar un sello:</span> {reward?.stampAction}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Celular *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="+54"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-24"
                    required
                  />
                  <Input
                    placeholder="1234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Quiero Participar
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Al registrarte, aceptás recibir mensajes de WhatsApp sobre tu progreso
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
