import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StampCardVisual } from "@/components/loyalty/StampCardVisual";
import { mockCustomers, mockStampProgram } from "@/services/mock/mock-data";
import type { Customer } from "@/types";
import {
  Search,
  UserPlus,
  Plus,
  MessageCircle,
  Phone,
  User,
  Calendar,
  Check,
  X,
} from "lucide-react";

export default function AddStampPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showAddStampDialog, setShowAddStampDialog] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [stampHistory, setStampHistory] = useState<any[]>([]);

  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+54",
  });

  const program = mockStampProgram;

  const filteredCustomers = customers.filter(
    (c) =>
      c.phone.includes(searchQuery) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      const found = customers.find((c) => c.phone === query);
      if (found) {
        setSelectedCustomer(found);
      }
    }
  };

  const handleRegisterCustomer = () => {
    const customer: Customer = {
      id: Date.now().toString(),
      businessId: "1",
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      phone: newCustomer.phone,
      countryCode: newCustomer.countryCode,
      stamps: 0,
      totalStamps: program.stampsRequired,
      rewardName: program.rewardName,
      rewardDescription: program.rewardDescription,
      stampsRequired: program.stampsRequired,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
    };

    setCustomers([...customers, customer]);
    setSelectedCustomer(customer);
    setShowRegisterDialog(false);
    setNewCustomer({ firstName: "", lastName: "", phone: "", countryCode: "+54" });
  };

  const handleAddStamp = () => {
    if (!selectedCustomer) return;

    const newStamps = selectedCustomer.stamps + 1;
    const isCompleted = newStamps >= selectedCustomer.stampsRequired;

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      stamps: newStamps,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    };

    setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? updatedCustomer : c)));
    setSelectedCustomer(updatedCustomer);

    const history = {
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      customerPhone: selectedCustomer.phone,
      stampsAdded: 1,
      totalStamps: newStamps,
      message: isCompleted
        ? `🎉 ¡Felicitaciones! Ya puedes canjear tu premio: ${program.rewardName}`
        : `Gracias por elegir ${program.rewardName}. Tu tarjeta tiene ${newStamps} de ${program.stampsRequired} sellos`,
      timestamp: new Date(),
      sent: true,
    };

    setStampHistory([history, ...stampHistory]);
    setShowAddStampDialog(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Agregar Sello" subtitle="Busca o registra un cliente para agregar sellos" />

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowRegisterDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </div>

          {searchQuery.length >= 3 && filteredCustomers.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No se encontró ningún cliente con "{searchQuery}"</p>
              <Button variant="link" onClick={() => setShowRegisterDialog(true)} className="mt-2">
                Registrar nuevo cliente
              </Button>
            </div>
          )}

          {filteredCustomers.length > 0 && (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <Badge variant={customer.isCompleted ? "default" : "secondary"}>
                      {customer.stamps}/{customer.stampsRequired}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stamp Card */}
      {selectedCustomer && (
        <StampCardVisual
          customerName={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
          businessName={program.rewardName || "Mi Negocio"}
          stampsRequired={selectedCustomer.stampsRequired}
          currentStamps={selectedCustomer.stamps}
          rewardName={selectedCustomer.rewardName}
          rewardDescription={selectedCustomer.rewardDescription}
          stampAction={program.stampAction || "Compra para ganar un sello"}
          isCompleted={selectedCustomer.isCompleted}
        />
      )}

      {/* Add Stamp Button */}
      {selectedCustomer && !selectedCustomer.isCompleted && (
        <Button onClick={handleAddStamp} className="w-full" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Agregar un sello a la tarjeta
        </Button>
      )}

      {selectedCustomer?.isCompleted && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-semibold text-emerald-600">¡Tarjeta completa!</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.firstName} ya puede canjear su premio: {selectedCustomer.rewardName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stamp History */}
      {stampHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de Sellos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stampHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{entry.customerName}</p>
                    <p className="text-sm text-muted-foreground">{entry.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{entry.customerPhone}</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.totalStamps} sellos
                      </Badge>
                      {entry.sent && (
                        <Badge variant="default" className="text-xs bg-emerald-500">
                          Enviado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Nombre del cliente"
                value={newCustomer.firstName}
                onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input
                placeholder="Apellido del cliente"
                value={newCustomer.lastName}
                onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Celular</Label>
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
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleRegisterCustomer}
                disabled={!newCustomer.firstName || !newCustomer.phone}
                className="flex-1"
              >
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Stamp Success Dialog */}
      <Dialog open={showAddStampDialog} onOpenChange={setShowAddStampDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sello Agregado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-semibold">Sello agregado exitosamente</p>
              <p className="text-muted-foreground mt-2">
                Se envió un WhatsApp a {selectedCustomer?.firstName} con su progreso
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Mensaje enviado:</p>
              <p className="text-sm font-medium mt-1">
                {stampHistory[0]?.message}
              </p>
            </div>
            <Button onClick={() => setShowAddStampDialog(false)} className="w-full">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
