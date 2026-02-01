import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type EmptyAction = {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  actions?: EmptyAction[];
  className?: string;
}

export const EmptyState = ({ icon, title, description, actions = [], className }: EmptyStateProps) => {
  return (
    <div className={cn("text-center py-12 px-4", className)}>
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      {actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              variant={action.variant ?? "outline"}
              size={action.size ?? "default"}
              className={action.className}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
