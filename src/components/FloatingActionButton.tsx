import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const FloatingActionButton = () => {
  return (
    <Link to="/post-job">
      <Button
        size="lg"
        className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-[0_4px_14px_hsl(var(--xp-primary-glow))] hover:shadow-[0_6px_20px_hsl(var(--xp-primary-glow))] transition-all z-[45]"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </Link>
  );
};
