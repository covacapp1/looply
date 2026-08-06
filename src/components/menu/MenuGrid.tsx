import type { MenuCategory as MenuCategoryType } from "@/types";
import { MenuCategoryCard } from "./MenuCategory";

interface MenuGridProps {
  categories: MenuCategoryType[];
}

export function MenuGrid({ categories }: MenuGridProps) {
  return (
    <div>
      {categories.map((category) => (
        <MenuCategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
