import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Briefcase, MapPin, X, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface StepItem {
  icon: React.ElementType;
  label: string;
  done: boolean;
  href: string;
}

export const ProfileCompletionWidget = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepItem[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Use sessionStorage so the widget reappears on next session if still incomplete,
    // but doesn't nag the user repeatedly within the same browsing session.
    const key = `bb_pcw_dismissed_${user.id}`;
    if (sessionStorage.getItem(key)) {
      setDismissed(true);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("profile_photo, category, city_id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (!data) return;

      const built: StepItem[] = [
        {
          icon: Camera,
          label: "Adicionar foto",
          done: !!data.profile_photo,
          href: "/profile",
        },
        {
          icon: Briefcase,
          label: "Adicionar profissão",
          done: !!data.category,
          href: "/profile",
        },
        {
          icon: MapPin,
          label: "Adicionar cidade",
          done: !!data.city_id,
          href: "/profile",
        },
      ];

      // Only show if profile is incomplete
      const incomplete = built.some((s) => !s.done);
      if (incomplete) setSteps(built);
    };

    fetchProfile();
  }, [user]);

  const handleDismiss = () => {
    if (user) sessionStorage.setItem(`bb_pcw_dismissed_${user.id}`, "1");
    setDismissed(true);
  };

  if (!user || dismissed || !steps) return null;

  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className="container mx-auto px-4 pt-4 pb-0">
      <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] dark:border-primary/20 bg-[#fbfdff] dark:bg-primary/5 p-4 relative shadow-[0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-none">
        <button
          onClick={handleDismiss}
          aria-label="Fechar"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground">Complete seu perfil</span>
          <span className="text-xs text-muted-foreground">{done}/{steps.length} etapas</span>
        </div>

        <Progress value={pct} className="h-1.5 mb-3" />

        <div className="flex flex-wrap gap-2">
          {steps.map((step, i) => (
            <Link
              key={i}
              to={step.href}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                step.done
                  ? "border-primary/20 bg-primary/10 text-primary line-through opacity-60 pointer-events-none"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
              }`}
              aria-disabled={step.done}
            >
              <step.icon className="w-3 h-3 shrink-0" aria-hidden="true" />
              {step.label}
              {!step.done && <ChevronRight className="w-3 h-3 ml-0.5 text-primary" aria-hidden="true" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
