import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Briefcase, MapPin, X } from "lucide-react";
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
    <div className="container mx-auto px-4 pt-3 pb-0">
      <div className="rounded-2xl border border-slate-200/60 dark:border-primary/20 bg-white/80 dark:bg-primary/5 px-4 py-3 relative shadow-sm dark:shadow-none backdrop-blur-sm stagger-fade" style={{ ["--stagger-delay" as string]: "0ms" }}>
        <button
          onClick={handleDismiss}
          aria-label="Fechar"
          className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-foreground">Complete seu perfil</span>
              <span className="text-[11px] text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1 mb-2" />
            <div className="flex flex-wrap gap-1.5">
              {steps.filter(step => !step.done).map((step, i) => (
                <Link
                  key={i}
                  to={step.href}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border border-border/70 bg-transparent text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-200"
                >
                  <step.icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {step.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
