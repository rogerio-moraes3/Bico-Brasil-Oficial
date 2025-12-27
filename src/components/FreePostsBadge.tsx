import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';
import { Gift } from 'lucide-react';

export function FreePostsBadge() {
  const { user } = useAuth();
  const [freePostsRemaining, setFreePostsRemaining] = useState<number | null>(null);
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    loadFreePostsData();
  }, [user]);

  const loadFreePostsData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('user_role, free_posts_remaining')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (data && data.user_role === 'empregador') {
      setIsEmployer(true);
      setFreePostsRemaining(data.free_posts_remaining || 0);
    }
  };

  if (!isEmployer || freePostsRemaining === null || freePostsRemaining === 0) {
    return null;
  }

  return (
    <Badge variant="default" className="hidden md:flex items-center gap-1 bg-gradient-to-r from-primary to-orange-500">
      <Gift className="h-3 w-3" />
      <span className="text-xs font-bold">{freePostsRemaining} grátis</span>
    </Badge>
  );
}
