import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { mockStampProgram } from "@/services/mock/mock-data";
import { Settings, Gift, Hash, Target, Save, Check } from "lucide-react";

export default function LoyaltyPage() {
  const [program, setProgram] = useState(mockStampProgram);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configurar Programa" subtitle="Define tu programa de fidelización" />

      {/* Program Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Datos del Programa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Nombre del Premio
            </Label>
            <Input
              placeholder="Ej: Desayuno GRATIS"
              value={program.rewardName}
              onChange={(e) => setProgram({ ...program, rewardName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              ¿Qué debe hacer el cliente para ganar un sello?
            </Label>
            <Input
              placeholder="Ej: Consumir un café"
              value={program.stampAction}
              onChange={(e) => setProgram({ ...program, stampAction: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Cantidad de Sellos Requeridos
            </Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={program.stampsRequired}
              onChange={(e) => setProgram({ ...program, stampsRequired: parseInt(e.target.value) || 6 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción del Premio</Label>
            <Input
              placeholder="Ej: 1 café con media luna"
              value={program.rewardDescription}
              onChange={(e) => setProgram({ ...program, rewardDescription: e.target.value })}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Guardado
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      {program.rewardName && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="bg-primary p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-foreground/80">Tu Negocio</p>
                    <h3 className="text-lg font-bold text-primary-foreground">{program.rewardName}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary-foreground/80">SELLOS</p>
                    <p className="text-2xl font-bold text-primary-foreground">0/{program.stampsRequired}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.from({ length: program.stampsRequired }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-full flex items-center justify-center border-2 bg-muted border-border text-muted-foreground"
                    >
                      <span className="text-lg font-bold">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="rounded-xl p-3 bg-primary/10 border border-primary/20 flex items-center gap-3">
                  <Gift className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{program.stampsRequired} más</span> y consigues: {program.rewardDescription || program.rewardName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Configura tu programa con el nombre del premio, cantidad de sellos y qué debe hacer el cliente
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ve a "Agregar Sello" y busca o registra a tu cliente por teléfono
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Toca "Agregar sello" y se enviará un WhatsApp automáticamente al cliente con su progreso
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Cuando complete todos los sellos, recibirá un mensaje de felicitación para canjear su premio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
