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

function getVariantStorageKey(userId: string) {
  return `looply_variants_${userId}`;
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

function loadVariantTemplates(userId: string): ProductVariant[] {
  const stored = localStorage.getItem(getVariantStorageKey(userId));
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  return parsed.map((v: any) => ({
    name: v.name,
    options: v.options.map((o: any) =>
      typeof o === "string"
        ? { name: o, price: 0, cost: 0 }
        : { name: o.name, price: o.price || 0, cost: o.cost || 0 }
    ),
  }));
}

function saveVariantTemplates(userId: string, variants: ProductVariant[]) {
  localStorage.setItem(getVariantStorageKey(userId), JSON.stringify(variants));
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

  // Global variant templates
  const [variantTemplates, setVariantTemplates] = useState<ProductVariant[]>([]);

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
  const [newVariantOptions, setNewVariantOptions] = useState<{ name: string; price: string; cost: string }[]>([{ name: "", price: "", cost: "" }]);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  // New category
  const [newCatName, setNewCatName] = useState("");

  const loadItems = useCallback(async () => {
    if (!user) return;
    const data = await getMenuItems(user.id);
    setItems(data);
    setCategories(loadCategories(user.id));
    setVariantTemplates(loadVariantTemplates(user.id));
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
    if (!user || !name.trim()) return;
    if (variants.length === 0 && (!price || parseFloat(price) <= 0)) return;
    setSaving(true);

    const productPrice = variants.length > 0 ? 0 : parseFloat(price) || 0;
    const productCost = variants.length > 0 ? 0 : parseFloat(cost) || 0;

    if (editingItem) {
      const updated = await updateMenuItem(editingItem.id, {
        name: name.trim(),
        description: description.trim(),
        price: productPrice,
        cost: productCost,
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
        price: productPrice,
        cost: productCost,
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
    if (editIndex !== null && variantTemplates[editIndex]) {
      setNewVariantName(variantTemplates[editIndex].name);
      setNewVariantOptions(variantTemplates[editIndex].options.map((o) => ({ name: o.name, price: o.price.toString(), cost: o.cost.toString() })));
    } else {
      setNewVariantName("");
      setNewVariantOptions([{ name: "", price: "", cost: "" }]);
    }
    setVariantDialogOpen(true);
  }

  function handleSaveVariant() {
    if (!newVariantName.trim()) {
      toast.error("Poné un nombre para la variante");
      return;
    }
    const validOptions = newVariantOptions.filter((o) => o.name.trim());
    if (validOptions.length < 1) {
      toast.error("Agregá al menos 1 opción");
      return;
    }
    const options = validOptions.map((o) => ({ name: o.name.trim(), price: parseFloat(o.price) || 0, cost: parseFloat(o.cost) || 0 }));
    const newVariant: ProductVariant = { name: newVariantName.trim(), options };
    let updated: ProductVariant[];
    if (editingVariantIndex !== null) {
      updated = [...variantTemplates];
      updated[editingVariantIndex] = newVariant;
    } else {
      updated = [...variantTemplates, newVariant];
    }
    setVariantTemplates(updated);
    if (user) saveVariantTemplates(user.id, updated);
    setVariantDialogOpen(false);
    setNewVariantName("");
    setNewVariantOptions([{ name: "", price: "", cost: "" }]);
    setEditingVariantIndex(null);
    toast.success(editingVariantIndex !== null ? "Variante actualizada" : "Variante creada");
  }

  function handleDeleteVariantTemplate(index: number) {
    const updated = variantTemplates.filter((_, i) => i !== index);
    setVariantTemplates(updated);
    if (user) saveVariantTemplates(user.id, updated);
    toast.success("Variante eliminada");
  }

  function handleToggleVariant(variant: ProductVariant) {
    setVariants((prev) => {
      const exists = prev.some((v) => v.name === variant.name);
      if (exists) {
        return prev.filter((v) => v.name !== variant.name);
      }
      return [...prev, variant];
    });
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
            <Button size="sm" variant="outline" onClick={() => setVariantDialogOpen(true)}>
              <ListPlus className="h-4 w-4 mr-2" />
              Variantes
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
                <Label>Precio ($){variants.length === 0 && " *"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={variants.length > 0 ? "Opcional (usar variante)" : "0.00"}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={variants.length > 0}
                />
                {variants.length > 0 && (
                  <p className="text-[10px] text-muted-foreground">Precio en variante</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Costo ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={variants.length > 0 ? "Opcional (usar variante)" : "0.00"}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  disabled={variants.length > 0}
                />
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

            {/* Variants assigned to product */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variantes</Label>
                {variantTemplates.length === 0 && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setVariantDialogOpen(true)}>
                    <ListPlus className="h-3.5 w-3.5 mr-1" />
                    Crear variante
                  </Button>
                )}
              </div>
              {variantTemplates.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {variantTemplates.map((vt) => {
                    const isSelected = variants.some((v) => v.name === vt.name);
                    return (
                      <button
                        key={vt.name}
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => handleToggleVariant(vt)}
                      >
                        {vt.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Creá variantes desde el botón "Variantes" arriba</p>
              )}
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving || !name.trim() || (variants.length === 0 && !price)}>
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

      {/* Variant Templates Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Variantes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {variantTemplates.length > 0 ? (
              <div className="space-y-2">
                {variantTemplates.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.options.map((o) => `${o.name} $${o.price} (costo $${o.cost})`).join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openVariantDialog(i)}>
                        ✏️
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteVariantTemplate(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No hay variantes creadas</p>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">{editingVariantIndex !== null ? "Editar variante" : "Nueva variante"}</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Nombre de la variante *</Label>
                  <Input placeholder="Ej: Bebida, Tamaño, Sabor" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Opciones</Label>
                  {newVariantOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder="Nombre"
                        value={opt.name}
                        onChange={(e) => {
                          const updated = [...newVariantOptions];
                          updated[i].name = e.target.value;
                          setNewVariantOptions(updated);
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Precio"
                        value={opt.price}
                        onChange={(e) => {
                          const updated = [...newVariantOptions];
                          updated[i].price = e.target.value;
                          setNewVariantOptions(updated);
                        }}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Costo"
                        value={opt.cost}
                        onChange={(e) => {
                          const updated = [...newVariantOptions];
                          updated[i].cost = e.target.value;
                          setNewVariantOptions(updated);
                        }}
                        className="w-20"
                      />
                      {newVariantOptions.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => setNewVariantOptions(newVariantOptions.filter((_, j) => j !== i))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setNewVariantOptions([...newVariantOptions, { name: "", price: "", cost: "" }])}
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Agregar opción
                  </Button>
                </div>
                <div className="flex gap-2">
                  {editingVariantIndex !== null && (
                    <Button variant="outline" onClick={() => { setEditingVariantIndex(null); setNewVariantName(""); setNewVariantOptions([{ name: "", price: "", cost: "" }]); }} className="flex-1">
                      Cancelar edición
                    </Button>
                  )}
                  <Button onClick={handleSaveVariant} className="flex-1" disabled={!newVariantName.trim()}>
                    {editingVariantIndex !== null ? "Guardar" : "Crear"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
