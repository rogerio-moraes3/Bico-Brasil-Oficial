import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

const DISMISS_KEY = 'grace-period-banner-dismissed';

// Só aparece pra contas legadas, incompletas, dentro dos 30 dias de
// carência (useProfileCompletion já calcula tudo isso). Nunca bloqueia —
// é só aviso. Some por esta sessão ao fechar, mas volta no próximo login
// enquanto o perfil continuar incompleto (mesmo padrão dos outros banners
// dispensáveis do app).
export const GracePeriodBanner = () => {
  const { loading, isLegacyAccount, isGracePeriodActive, isComplete, gracePeriodEndsAt } = useProfileCompletion();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === 'true');

  if (loading || dismissed || isComplete || !isLegacyAccount || !isGracePeriodActive || !gracePeriodEndsAt) {
    return null;
  }

  const daysLeft = Math.max(0, Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
  const deadlineLabel = gracePeriodEndsAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="bg-primary/10 border-b border-primary/30 py-3">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm text-foreground">
            Confirme seu WhatsApp e complete seu endereço até <strong>{deadlineLabel}</strong> ({daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}) para continuar contatando profissionais e publicando vagas.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => navigate('/complete-profile')}>
            Completar agora
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss} aria-label="Fechar aviso">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
