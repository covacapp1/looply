import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreditCard, Globe, DollarSign } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Gestiona la configuración de tu negocio"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="business">Negocio</TabsTrigger>
          <TabsTrigger value="subscription">Suscripción</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
              <CardDescription>Actualiza los datos de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Negocio</Label>
                  <Input id="name" placeholder="Ej: Mi Negocio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL / Slug</Label>
                  <Input id="slug" placeholder="Ej: mi-negocio" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Describe tu negocio..." rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" placeholder="Ej: +54 11 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Ej: hola@minegocio.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" placeholder="Ej: Av. Principal 123" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" placeholder="Ej: Buenos Aires" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" placeholder="Ej: Argentina" />
                </div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Conecta tus redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input id="website" placeholder="Ej: https://minegocio.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="Ej: @minegocio" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" placeholder="Ej: minegocio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" placeholder="Ej: +541112345678" />
                </div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Plan Actual</CardTitle>
              <CardDescription>Tu plan de suscripción en LOOPLY</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-bold text-foreground">Plan Único</p>
                    <p className="text-sm text-muted-foreground">Todo incluido para tu negocio</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Activo</Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Tarjetas de fidelidad ilimitadas</p>
                  <p>✓ Clientes ilimitados</p>
                  <p>✓ Menú digital</p>
                  <p>✓ Notificaciones WhatsApp</p>
                  <p>✓ Reportes y estadísticas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
              <CardDescription>Vinculá tu cuenta para recibir pagos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Argentina</p>
                      <p className="text-xs text-muted-foreground">Pago en ARS</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Mercado Pago</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vinculá tu cuenta de Mercado Pago para recibir pagos en pesos argentinos
                    </p>
                  </div>
                  <Button variant="outline" className="w-full mt-3" size="sm">
                    Vincular Mercado Pago
                  </Button>
                </div>

                <div className="rounded-xl border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Internacional</p>
                      <p className="text-xs text-muted-foreground">Pago en USD</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">PayPal</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vinculá tu cuenta de PayPal para recibir pagos en dólares
                    </p>
                  </div>
                  <Button variant="outline" className="w-full mt-3" size="sm">
                    Vincular PayPal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
