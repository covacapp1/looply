import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo salió mal",
  description = "Hubo un error al cargar la información. Por favor, intenta de nuevo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-border">
          Intentar de nuevo
        </Button>
      )}
    </motion.div>
  );
}
