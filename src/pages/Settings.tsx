import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreditCard, Globe, DollarSign, Bell, BellOff, BellRing, Loader2, AlertCircle, Download, Smartphone, CheckCircle2, Save } from "lucide-react";
import { isPushSupported, getPermissionState, subscribePush, unsubscribePush, isSubscribed, getSWRegistration } from "@/services/push";
import { getBusinessSettings, saveBusinessSettings, type BusinessSettings } from "@/services/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const defaultSettings: BusinessSettings = {
  name: "", slug: "", description: "", phone: "", email: "",
  address: "", city: "", country: "", website: "",
  instagram: "", facebook: "", whatsapp: "",
  orderMessage: "", orderTime: "30", openTime: "09:00", closeTime: "22:00",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("business");
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pushSupported, setPushSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPushState();
  }, [user]);

  async function loadSettings() {
    if (!user) return;
    setLoadingSettings(true);
    const data = await getBusinessSettings(user.id);
    setSettings(data);
    setLoadingSettings(false);
  }

  async function handleSaveSettings() {
    if (!user) return;
    setSaving(true);
    const ok = await saveBusinessSettings(user.id, settings);
    setSaving(false);
    if (ok) {
      toast.success("Configuración guardada");
    } else {
      toast.error("Error al guardar");
    }
  }

  async function checkPushState() {
    const supported = isPushSupported();
    setPushSupported(supported);
    if (!supported) return;
    const perm = await getPermissionState();
    setPermissionState(perm);
    const sub = await isSubscribed();
    setSubscribed(sub);
    await getSWRegistration();
  }

  async function handleEnablePush() {
    setPushLoading(true);
    const ok = await subscribePush();
    if (ok) {
      toast.success("Notificaciones activadas");
      setSubscribed(true);
      setPermissionState("granted");
    } else {
      toast.error("No se pudieron activar las notificaciones");
    }
    setPushLoading(false);
  }

  async function handleDisablePush() {
    setPushLoading(true);
    const ok = await unsubscribePush();
    if (ok) {
      toast.success("Notificaciones desactivadas");
      setSubscribed(false);
    }
    setPushLoading(false);
  }

  function getPushStatusMessage() {
    if (!pushSupported) return "Tu navegador no soporta notificaciones push";
    if (permissionState === "denied") return "Los permisos de notificación fueron bloqueados. Habilitalos desde la configuración del navegador.";
    if (permissionState === "unsupported") return "Notificaciones no disponibles";
    return null;
  }

  const pushMessage = getPushStatusMessage();

  function updateSettings(field: keyof BusinessSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

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
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
              <CardDescription>Actualiza los datos de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSettings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Negocio</Label>
                      <Input id="name" placeholder="Ej: Mi Negocio" value={settings.name} onChange={(e) => updateSettings("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL / Slug</Label>
                      <Input id="slug" placeholder="Ej: mi-negocio" value={settings.slug} onChange={(e) => updateSettings("slug", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" placeholder="Describe tu negocio..." rows={3} value={settings.description} onChange={(e) => updateSettings("description", e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" placeholder="Ej: +54 11 1234 5678" value={settings.phone} onChange={(e) => updateSettings("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Ej: hola@minegocio.com" value={settings.email} onChange={(e) => updateSettings("email", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" placeholder="Ej: Av. Principal 123" value={settings.address} onChange={(e) => updateSettings("address", e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input id="city" placeholder="Ej: Buenos Aires" value={settings.city} onChange={(e) => updateSettings("city", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input id="country" placeholder="Ej: Argentina" value={settings.country} onChange={(e) => updateSettings("country", e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                  </Button>
                </>
              )}
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
                  <Input id="website" placeholder="Ej: https://minegocio.com" value={settings.website} onChange={(e) => updateSettings("website", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="Ej: @minegocio" value={settings.instagram} onChange={(e) => updateSettings("instagram", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input id="facebook" placeholder="Ej: minegocio" value={settings.facebook} onChange={(e) => updateSettings("facebook", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" placeholder="Ej: +541112345678" value={settings.whatsapp} onChange={(e) => updateSettings("whatsapp", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Horario de apertura</Label>
                    <Input id="openTime" type="time" value={settings.openTime} onChange={(e) => updateSettings("openTime", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Horario de cierre</Label>
                    <Input id="closeTime" type="time" value={settings.closeTime} onChange={(e) => updateSettings("closeTime", e.target.value)} />
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
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
                  <p>✓ Notificaciones Push</p>
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
                    Pagar Mercado Pago
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
                    Pagar PayPal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones Push
              </CardTitle>
              <CardDescription>
                Recibí novedades, promociones y avisos importantes directamente en tu celular
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pushMessage ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">{pushMessage}</p>
                </div>
              ) : subscribed ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <BellRing className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Notificaciones activadas</p>
                      <p className="text-xs text-emerald-600">Vas a recibir notificaciones push en este dispositivo</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDisablePush} disabled={pushLoading} className="w-full">
                    {pushLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                    Desactivar notificaciones
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Notificaciones desactivadas</p>
                      <p className="text-xs text-muted-foreground">Activatelas para recibir novedades</p>
                    </div>
                  </div>
                  <Button onClick={handleEnablePush} disabled={pushLoading} className="w-full">
                    {pushLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                    Activar notificaciones
                  </Button>
                </div>
              )}

              {permissionState === "denied" && (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Para reactivar las notificaciones:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Hacé clic en el ícono de candado en la barra de direcciones</li>
                    <li>Buscá "Notificaciones" y cambialo a "Permitir"</li>
                    <li>Recargá la página</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Instalar LOOPLY como app
              </CardTitle>
              <CardDescription>
                Instalá LOOPLY en tu celular para una experiencia como app nativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">¿Por qué instalarla?</p>
                    <p className="text-xs text-muted-foreground">
                      Al instalarla como app, aparece en tu pantalla de inicio y las notificaciones funcionan igual que una app nativa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">En Android (Chrome):</p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Abrí LOOPLY en Chrome</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Tocá los 3 puntos (menú) arriba a la derecha</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Seleccioná "Agregar a pantalla de inicio"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Confirmá tocando "Agregar"</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">En iPhone (Safari):</p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Abrí LOOPLY en Safari</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Tocá el ícono de compartir (cuadrado con flecha)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Deslizá y seleccioná "Agregar a pantalla de inicio"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Confirmá tocando "Agregar" arriba a la derecha</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Después de instalarla, abrí la app desde el ícono en tu pantalla de inicio y activá las notificaciones una sola vez.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
