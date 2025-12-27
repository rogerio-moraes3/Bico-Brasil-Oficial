import { ReactNode } from 'react';

interface AccessGuardProps {
  children: ReactNode;
}

// App agora é público - sem bloqueio de acesso
// Admin panel tem sua própria verificação de role
export const AccessGuard = ({ children }: AccessGuardProps) => {
  return <>{children}</>;
};
