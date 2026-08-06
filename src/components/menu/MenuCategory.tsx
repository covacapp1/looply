import { motion } from "framer-motion";
import type { MenuCategory } from "@/types";
import { MenuItem } from "./MenuItem";

interface MenuCategoryProps {
  category: MenuCategory;
}

export function MenuCategoryCard({ category }: MenuCategoryProps) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-muted-foreground">{category.description}</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
}
