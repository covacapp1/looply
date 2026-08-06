import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { StampCardVisual } from "@/components/loyalty/StampCardVisual";
import type { LoyaltyReward, Customer, StampHistory } from "@/types";
import {
  Plus,
  Gift,
  Users,
  QrCode,
  Search,
  Check,
  MessageCircle,
  Phone,
  User,
  Star,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoyaltyPage() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stampHistory, setStampHistory] = useState<StampHistory[]>([]);

  const [showCreateReward, setShowCreateReward] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showStampDialog, setShowStampDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    stampsRequired: 6,
    stampAction: "",
  });

  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+54",
    loyaltyRewardId: "",
  });

  const handleCreateReward = () => {
    const reward: LoyaltyReward = {
      id: Date.now().toString(),
      businessId: "1",
      ...newReward,
      isActive: true,
      createdAt: new Date(),
    };
    setRewards([...rewards, reward]);
    setShowCreateReward(false);
    setNewReward({ name: "", description: "", stampsRequired: 6, stampAction: "" });
  };

  const handleAddCustomer = () => {
    const reward = rewards.find((r) => r.id === newCustomer.loyaltyRewardId);
    if (!reward) return;

    const customer: Customer = {
      id: Date.now().toString(),
      businessId: "1",
      loyaltyRewardId: newCustomer.loyaltyRewardId,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      phone: newCustomer.phone,
      countryCode: newCustomer.countryCode,
      stamps: 0,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
    };
    setCustomers([...customers, customer]);
    setShowAddCustomer(false);
    setNewCustomer({ firstName: "", lastName: "", phone: "", countryCode: "+54", loyaltyRewardId: "" });
  };

  const handleAddStamp = (customer: Customer) => {
    const reward = rewards.find((r) => r.id === customer.loyaltyRewardId);
    if (!reward) return;

    const newStamps = customer.stamps + 1;
    const isCompleted = newStamps >= reward.stampsRequired;

    const updatedCustomer: Customer = {
      ...customer,
      stamps: newStamps,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    };

    setCustomers(customers.map((c) => (c.id === customer.id ? updatedCustomer : c)));
    setSelectedCustomer(updatedCustomer);

    const history: StampHistory = {
      id: Date.now().toString(),
      customerId: customer.id,
      loyaltyRewardId: reward.id,
      stampsAdded: 1,
      totalStamps: newStamps,
      message: isCompleted
        ? `🎉 ¡Felicitaciones! Ya puedes canjear tu premio: ${reward.name}`
        : `Gracias por elegir ${reward.name}. Tu tarjeta tiene ${newStamps} de ${reward.stampsRequired} sellos`,
      timestamp: new Date(),
      sent: true,
    };
    setStampHistory([history, ...stampHistory]);
    setShowStampDialog(true);
  };

  const getRewardCustomers = (rewardId: string) =>
    customers.filter((c) => c.loyaltyRewardId === rewardId);

  const getRewardStats = (rewardId: string) => {
    const rewardCustomers = getRewardCustomers(rewardId);
    const total = rewardCustomers.length;
    const completed = rewardCustomers.filter((c) => c.isCompleted).length;
    return { total, completed };
  };

  const filteredCustomers = customers.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const selectedRewardForCustomer = rewards.find((r) => r.id === newCustomer.loyaltyRewardId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarjetas de Fidelidad"
        subtitle="Gestiona tus premios y clientes"
        actions={
          <Button onClick={() => setShowAddCustomer(true)}>
            <User className="h-4 w-4 mr-2" />
            Cargar Cliente
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Premios</p>
                <p className="text-lg font-bold">{rewards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="text-lg font-bold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Sellos dados</p>
                <p className="text-lg font-bold">{customers.reduce((acc, c) => acc + c.stamps, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Canjeados</p>
                <p className="text-lg font-bold">{customers.filter((c) => c.isCompleted).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Reward Button */}
      <Button onClick={() => setShowCreateReward(true)} className="w-full" variant="outline" size="lg">
        <Plus className="h-5 w-5 mr-2" />
        Premio de Fidelidad +
      </Button>

      {/* Rewards List */}
      {rewards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay premios creados</p>
            <p className="text-sm text-muted-foreground mt-1">Creá tu primer premio para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => {
            const stats = getRewardStats(reward.id);
            const rewardCustomers = getRewardCustomers(reward.id);

            return (
              <Card key={reward.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        {reward.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowQRDialog(true);
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sellos: </span>
                      <span className="font-semibold">{reward.stampsRequired}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Acción: </span>
                      <span className="font-semibold">{reward.stampAction}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <Badge variant="outline">{stats.total} clientes</Badge>
                    <Badge variant="outline" className="text-emerald-600">{stats.completed} canjeados</Badge>
                  </div>

                  {/* Customers for this reward */}
                  {rewardCustomers.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground">Clientes:</p>
                      {rewardCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{customer.phone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {Array.from({ length: reward.stampsRequired }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-3 w-3 rounded-full ${
                                      i < customer.stamps
                                        ? "bg-primary"
                                        : "bg-border"
                                    }`}
                                  />
                                ))}
                              </div>
                              {!customer.isCompleted ? (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomer(customer);
                                    handleAddStamp(customer);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Sello
                                </Button>
                              ) : (
                                <Badge className="bg-emerald-500">Canjeado</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Reward Dialog */}
      <Dialog open={showCreateReward} onOpenChange={setShowCreateReward}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Premio de Fidelidad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Premio *</Label>
              <Input
                placeholder="Ej: Desayuno GRATIS"
                value={newReward.name}
                onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                placeholder="Ej: 1 café con media luna"
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cantidad de Sellos *</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={newReward.stampsRequired}
                onChange={(e) =>
                  setNewReward({ ...newReward, stampsRequired: parseInt(e.target.value) || 6 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>¿Qué debe hacer el cliente? *</Label>
              <Input
                placeholder="Ej: Consumir un café"
                value={newReward.stampAction}
                onChange={(e) => setNewReward({ ...newReward, stampAction: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreateReward(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleCreateReward}
                disabled={!newReward.name || !newReward.stampAction}
                className="flex-1"
              >
                Crear Premio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cargar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Premio de Fidelidad *</Label>
              <Select
                value={newCustomer.loyaltyRewardId}
                onValueChange={(value) =>
                  setNewCustomer({ ...newCustomer, loyaltyRewardId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar premio" />
                </SelectTrigger>
                <SelectContent>
                  {rewards.map((reward) => (
                    <SelectItem key={reward.id} value={reward.id}>
                      {reward.name} ({reward.stampsRequired} sellos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rewards.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Primero creá un premio de fidelidad
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                placeholder="Nombre del cliente"
                value={newCustomer.firstName}
                onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input
                placeholder="Apellido del cliente"
                value={newCustomer.lastName}
                onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Celular *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="+54"
                  value={newCustomer.countryCode}
                  onChange={(e) => setNewCustomer({ ...newCustomer, countryCode: e.target.value })}
                  className="w-24"
                />
                <Input
                  placeholder="1234567890"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddCustomer(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleAddCustomer}
                disabled={!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone || !newCustomer.loyaltyRewardId}
                className="flex-1"
              >
                Cargar Cliente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR - {selectedReward?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <QRGenerator
              url={`https://looply.app/reward/${selectedReward?.id}`}
              title={selectedReward?.name || ""}
              description="Escaneá para sumar sellos"
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            El cliente escanea este QR, completa sus datos y se carga automáticamente
          </p>
        </DialogContent>
      </Dialog>

      {/* Stamp Success Dialog */}
      <Dialog open={showStampDialog} onOpenChange={setShowStampDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sello Agregado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-7 w-7 text-primary" />
              </div>
              <p className="font-semibold">Sello agregado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Se envió WhatsApp a {selectedCustomer?.firstName}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Mensaje enviado:</p>
              <p className="text-sm font-medium mt-1">
                {stampHistory[0]?.message}
              </p>
            </div>
            <Button onClick={() => setShowStampDialog(false)} className="w-full">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      {selectedCustomer && !showStampDialog && (
        <Dialog
          open={!!selectedCustomer && !showStampDialog}
          onOpenChange={() => setSelectedCustomer(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tarjeta del Cliente</DialogTitle>
            </DialogHeader>
            {(() => {
              const reward = rewards.find((r) => r.id === selectedCustomer.loyaltyRewardId);
              if (!reward) return null;
              return (
                <StampCardVisual
                  customerName={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                  businessName={reward.name}
                  stampsRequired={reward.stampsRequired}
                  currentStamps={selectedCustomer.stamps}
                  rewardName={reward.name}
                  rewardDescription={reward.description}
                  stampAction={reward.stampAction}
                  isCompleted={selectedCustomer.isCompleted}
                />
              );
            })()}
            <div className="flex gap-2">
              {!selectedCustomer.isCompleted && (
                <Button
                  onClick={() => {
                    handleAddStamp(selectedCustomer);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sello
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedCustomer(null)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
