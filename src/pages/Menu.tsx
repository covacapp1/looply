import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed, PlusCircle, Trash2, Eye, EyeOff, Camera, X, Tag, ListPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/services/supabase";
import type { MenuItem, ProductVariant } from "@/types";
import { toast } from "sonner";

const DEFAULT_CATEGORIES = ["General", "Entradas", "Platos", "Bebidas", "Postres", "Otros"];

function getStorageKey(userId: string) {
  return `looply_categories_${userId}`;
}

function loadCategories(userId: string): string[] {
  const stored = localStorage.getItem(getStorageKey(userId));
  if (stored) return JSON.parse(stored);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
}

function saveCategories(userId: string, cats: string[]) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(cats));
}

export default function MenuPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);

  // Categories
  const [categories, setCategories] = useState<string[]>([]);

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantOptions, setNewVariantOptions] = useState("");
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  // New category
  const [newCatName, setNewCatName] = useState("");

  const loadItems = useCallback(async () => {
    if (!user) return;
    const data = await getMenuItems(user.id);
    setItems(data);
    setCategories(loadCategories(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    setEditingItem(null);
    setName("");
    setDescription("");
    setPrice("");
    setCost("");
    setCategory(categories[0] || "General");
    setImageUrl("");
    setVariants([]);
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCost(item.cost.toString());
    setCategory(item.category);
    setImageUrl(item.imageUrl || "");
    setVariants(item.variants || []);
    setDialogOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir imagen");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(fileName);

    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    if (!user || !name.trim() || !price) return;
    setSaving(true);

    if (editingItem) {
      const updated = await updateMenuItem(editingItem.id, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        category,
        isAvailable: editingItem.isAvailable,
        imageUrl,
        variants,
      });
      if (updated) {
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast.success("Producto actualizado");
      }
    } else {
      const created = await createMenuItem({
        merchantId: user.id,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        category,
        isAvailable: true,
        imageUrl,
        variants,
      });
      if (created) {
        setItems((prev) => [...prev, created]);
        toast.success("Producto agregado");
      }
    }

    setDialogOpen(false);
    setSaving(false);
  }

  async function handleToggle(item: MenuItem) {
    const updated = await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const ok = await deleteMenuItem(id);
    if (ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Producto eliminado");
    }
  }

  function handleAddCategory() {
    if (!newCatName.trim() || !user) return;
    const trimmed = newCatName.trim();
    if (categories.includes(trimmed)) {
      toast.error("La categoría ya existe");
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveCategories(user.id, updated);
    setNewCatName("");
    toast.success("Categoría agregada");
  }

  function handleDeleteCategory(cat: string) {
    if (!user) return;
    const productsInCat = items.filter((i) => i.category === cat);
    if (productsInCat.length > 0) {
      toast.error(`No podés eliminar "${cat}" porque tiene ${productsInCat.length} producto(s)`);
      return;
    }
    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    saveCategories(user.id, updated);
    toast.success("Categoría eliminada");
  }

  function openVariantDialog(editIndex: number | null = null) {
    setEditingVariantIndex(editIndex);
    if (editIndex !== null && variants[editIndex]) {
      setNewVariantName(variants[editIndex].name);
      setNewVariantOptions(variants[editIndex].options.join(", "));
    } else {
      setNewVariantName("");
      setNewVariantOptions("");
    }
    setVariantDialogOpen(true);
  }

  function handleSaveVariant() {
    if (!newVariantName.trim() || !newVariantOptions.trim()) {
      toast.error("Completá nombre y opciones");
      return;
    }
    const options = newVariantOptions.split(",").map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) {
      toast.error("Agregá al menos 2 opciones separadas por coma");
      return;
    }
    const newVariant: ProductVariant = { name: newVariantName.trim(), options };
    if (editingVariantIndex !== null) {
      const updated = [...variants];
      updated[editingVariantIndex] = newVariant;
      setVariants(updated);
    } else {
      setVariants([...variants, newVariant]);
    }
    setVariantDialogOpen(false);
    setNewVariantName("");
    setNewVariantOptions("");
    setEditingVariantIndex(null);
  }

  function handleDeleteVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  const itemsByCategory = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader
        title="Menú Digital"
        description="Gestioná los productos de tu negocio"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCatDialogOpen(true)}>
              <Tag className="h-4 w-4 mr-2" />
              Categorías
            </Button>
            <Button size="sm" onClick={openCreate}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-6">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay productos</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Agregá productos para que tus clientes puedan ver tu menú y hacer pedidos
          </p>
          <Button onClick={openCreate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {itemsByCategory.map((group) => (
            <div key={group.category}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {group.category}
              </h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <Card key={item.id} className={`border-border ${!item.isAvailable ? "opacity-50" : ""}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{item.name}</p>
                          {!item.isAvailable && <Badge variant="outline" className="text-[10px]">Agotado</Badge>}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-sm font-bold text-primary">
                            ${item.price.toLocaleString("es-AR")}
                          </p>
                          {item.cost > 0 && (
                            <p className="text-xs text-muted-foreground">
                              (Costo: ${item.cost.toLocaleString("es-AR")})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggle(item)}>
                          {item.isAvailable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                          ✏️
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Foto del producto</Label>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7 p-0"
                    onClick={() => setImageUrl("")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Subiendo..." : "Elegir foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input placeholder="Ej: Hamburguesa Clásica" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea placeholder="Ingredientes, opciones, etc." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Precio ($) *</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Costo ($)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variantes (opcional)</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => openVariantDialog()}>
                  <ListPlus className="h-3.5 w-3.5 mr-1" />
                  Agregar
                </Button>
              </div>
              {variants.length > 0 ? (
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.options.join(", ")}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openVariantDialog(i)}>
                          ✏️
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteVariant(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Ej: Tamaño (Chico, Mediano, Grande)</p>
              )}
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving || !name.trim() || !price}>
              {saving ? "Guardando..." : editingItem ? "Guardar Cambios" : "Agregar Producto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Categorías</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nueva categoría"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} disabled={!newCatName.trim()}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                return (
                  <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{cat}</span>
                      <Badge variant="outline" className="text-[10px]">{count}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => handleDeleteCategory(cat)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariantIndex !== null ? "Editar Variante" : "Agregar Variante"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nombre de la variante *</Label>
              <Input placeholder="Ej: Tamaño, Color, Sabor" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Opciones (separadas por coma) *</Label>
              <Input placeholder="Ej: Chico, Mediano, Grande" value={newVariantOptions} onChange={(e) => setNewVariantOptions(e.target.value)} />
              <p className="text-xs text-muted-foreground">Mínimo 2 opciones</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setVariantDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveVariant} className="flex-1">
                {editingVariantIndex !== null ? "Guardar" : "Agregar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
