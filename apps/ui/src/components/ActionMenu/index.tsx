import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";

interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  hidden?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerLabel?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ActionMenu({ items, triggerLabel = "Open actions", defaultOpen, onOpenChange }: ActionMenuProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <DropdownMenu defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="icon-only" size="icon" aria-label={triggerLabel}>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleItems.map((item) => (
          <DropdownMenuItem key={item.label} onClick={item.onClick}>
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ActionMenu, type ActionMenuProps, type ActionMenuItem };
