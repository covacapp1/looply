import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Contact, Phone, MapPin, StickyNote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getShopCustomers } from "@/services/supabase";
import type { ShopCustomer } from "@/types";

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<ShopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    if (!user) return;
    const data = await getShopCustomers(user.id);
    setCustomers(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${customers.length} cliente${customers.length !== 1 ? "s" : ""} registrado${customers.length !== 1 ? "s" : ""}`}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Contact className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay clientes</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Los clientes aparecerán cuando se registren desde tu link de tienda
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.address && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                      {customer.notes && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <StickyNote className="h-3.5 w-3.5" />
                          <span>{customer.notes}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Registrado: {new Date(customer.createdAt).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
