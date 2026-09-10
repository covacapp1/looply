import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Plus, Trash2, Loader2, FileText, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from "@/services/supabase";
import type { Recipe } from "@/types";
import { toast } from "sonner";

export default function RecetasPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    if (!user) return;
    const data = await getRecipes(user.id);
    setRecipes(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  function openCreate() {
    setEditingId(null);
    setForm({ title: "", content: "" });
    setShowDialog(true);
  }

  function openEdit(recipe: Recipe) {
    setEditingId(recipe.id);
    setForm({ title: recipe.title, content: recipe.content });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !user) return;
    setSaving(true);
    if (editingId) {
      const ok = await updateRecipe(editingId, form.title.trim(), form.content.trim());
      if (ok) toast.success("Receta actualizada");
    } else {
      const r = await createRecipe(user.id, form.title.trim(), form.content.trim());
      if (r) toast.success("Receta creada");
    }
    setShowDialog(false);
    setForm({ title: "", content: "" });
    setEditingId(null);
    loadRecipes();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta receta?")) return;
    const ok = await deleteRecipe(id);
    if (ok) {
      toast.success("Receta eliminada");
      loadRecipes();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recetas"
        subtitle={`${recipes.length} receta${recipes.length !== 1 ? "s" : ""}`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Receta
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : recipes.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <div className="rounded-full bg-muted p-4 mx-auto mb-4 w-fit">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-1">No hay recetas guardadas</p>
            <p className="text-xs text-muted-foreground">Anotá las recetas de tus clientes para tenerlas siempre a mano</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="border-border">
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{recipe.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(recipe.createdAt).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openEdit(recipe); }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(recipe.id); }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expandedId === recipe.id && recipe.content && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{recipe.content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Receta" : "Nueva Receta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ej: Receta de Juan - Crema hidratante"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Detalle</Label>
              <Textarea
                placeholder="Anotá los ingredientes, proporciones, instrucciones..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
              />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              {editingId ? "Guardar Cambios" : "Crear Receta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
