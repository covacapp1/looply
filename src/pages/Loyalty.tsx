import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Settings, CreditCard, QrCode, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";
import { StampCard } from "@/components/loyalty/StampCard";
import { PointsDisplay } from "@/components/loyalty/PointsDisplay";
import { TierBadge } from "@/components/loyalty/TierBadge";
import { mockLoyaltyProgram, mockCustomers } from "@/services/mock";
import { LOYALTY_TYPES } from "@/lib/constants";

export default function LoyaltyPage() {
  const program = mockLoyaltyProgram;
  const [selectedType, setSelectedType] = useState(program.type);

  return (
    <div>
      <PageHeader
        title="Programa de Fidelización"
        description="Configura y gestiona tu programa de fidelización"
        actions={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Fidelización" },
        ]}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="tiers">Niveles</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Programa</p>
                    <p className="font-semibold text-foreground capitalize">{program.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <PointsDisplay points={program.pointsPerDollar} label="Puntos por $" size="sm" />
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <PointsDisplay points={program.stampsRequired} label="Sellos requeridos" size="sm" />
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{program.tiers.length}</p>
                  <p className="text-sm text-muted-foreground">Niveles activos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Seleccionar Tipo de Programa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {LOYALTY_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as typeof selectedType)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-lg">{type.icon === "Coins" ? "💰" : type.icon === "Stamp" ? "🎫" : type.icon === "Footprints" ? "👣" : type.icon === "Wallet" ? "💳" : "⚙️"}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {program.tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${tier.color}20` }}
                      >
                        <span className="text-lg">🏆</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tier.name}</p>
                        <TierBadge tier={tier.id} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Mínimo: {tier.minPoints.toLocaleString()} puntos
                    </p>
                    <ul className="space-y-1.5">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <LoyaltyCard
              businessName={program.name}
              customerName="María García"
              points={2350}
              tier={program.tiers[2]}
            />
            <StampCard
              totalStamps={program.stampsRequired}
              completedStamps={7}
              reward={program.stampReward}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
