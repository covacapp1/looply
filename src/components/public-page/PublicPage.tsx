import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Camera, Users, Globe, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockBusiness, mockMenuCategories, mockPromotions } from "@/services/mock";

export function PublicPage() {
  const business = mockBusiness;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">CA</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{business.name}</h1>
            <p className="text-muted-foreground mt-1">{business.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-auto py-4 flex-col gap-1">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-1">
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Ubicación</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-1">
            <Clock className="h-5 w-5" />
            <span className="text-xs">Horarios</span>
          </Button>
        </div>

        {/* Menu Preview */}
        <Card className="mb-6 border-border">
          <CardContent className="p-4">
            <h2 className="font-semibold text-foreground mb-3">Menú</h2>
            <div className="space-y-2">
              {mockMenuCategories[0].items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="font-semibold text-primary">${item.price}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-3">
              Ver Menú Completo
            </Button>
          </CardContent>
        </Card>

        {/* Promotions */}
        <Card className="mb-6 border-border">
          <CardContent className="p-4">
            <h2 className="font-semibold text-foreground mb-3">Promociones Activas</h2>
            <div className="space-y-3">
              {mockPromotions.slice(0, 2).map((promo) => (
                <div key={promo.id} className="rounded-lg bg-primary/5 p-3">
                  <p className="font-medium text-foreground">{promo.title}</p>
                  <p className="text-sm text-muted-foreground">{promo.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-8">
          <a href={business.instagram} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <Camera className="h-5 w-5" />
          </a>
          <a href={business.facebook} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <Users className="h-5 w-5" />
          </a>
          <a href={business.website} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <Globe className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
