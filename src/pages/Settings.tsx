import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Gestiona la configuración de tu negocio"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Configuración" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="business">Negocio</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
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
                  <Input id="phone" placeholder="Ej: +52 55 1234 5678" />
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
                  <Input id="city" placeholder="Ej: Ciudad de México" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" placeholder="Ej: México" />
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
                  <Input id="whatsapp" placeholder="Ej: +525512345678" />
                </div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Personaliza el aspecto de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color Principal</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue="#10b981"
                    className="h-10 w-10 rounded-lg border border-border cursor-pointer"
                  />
                  <Input defaultValue="#10b981" className="w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo del Negocio</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">?</span>
                  </div>
                  <Button variant="outline">Subir Logo</Button>
                </div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configura las notificaciones push (preparado para PWA)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Nuevos clientes", description: "Recibe notificación cuando un nuevo cliente se una" },
                { label: "Cumpleaños", description: "Recordatorio de cumpleaños de clientes" },
                { label: "Promociones", description: "Notificaciones de nuevas promociones" },
                { label: "Recompensas", description: "Cuando un cliente canjee una recompensa" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Plan Actual</CardTitle>
              <CardDescription>Gestiona tu suscripción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">Plan Professional</p>
                    <p className="text-sm text-muted-foreground">$499/mes</p>
                  </div>
                  <Button variant="outline">Cambiar Plan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
