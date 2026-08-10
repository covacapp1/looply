import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
    </header>
  );
}
