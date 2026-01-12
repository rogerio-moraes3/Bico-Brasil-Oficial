import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

interface BadgeDisplayProps {
  userId: string;
}

export function BadgeDisplay({ userId }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        const badgeData = data
          .filter((item: any) => {
            // Validação rigorosa para prevenir UUIDs
            return item.badges 
              && typeof item.badges === 'object'
              && item.badges.icon 
              && typeof item.badges.icon === 'string'
              && item.badges.icon.length <= 10 // Evita UUIDs (36 caracteres)
              && /[\u{1F300}-\u{1F9FF}]/u.test(item.badges.icon); // Valida emoji
          })
          .map((item: any) => ({
            id: item.badges.id,
            name: item.badges.name || '',
            description: item.badges.description || '',
            icon: item.badges.icon,
            earned_at: item.earned_at
          }));
        setBadges(badgeData);
      }
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {badges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {badge.icon}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-semibold">{badge.name}</p>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                {badge.earned_at && (
                  <p className="text-xs mt-1">
                    Conquistado em {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
