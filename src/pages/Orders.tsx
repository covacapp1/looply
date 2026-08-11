import { Link } from "react-router-dom";
import { LayoutDashboard, ShoppingBag } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="h-20 w-20 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-violet-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Pedidos</h1>
        <p className="text-muted-foreground mb-6">
          Gestioná los pedidos de tus clientes desde acá.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Menú
        </Link>
      </div>
    </div>
  );
}
