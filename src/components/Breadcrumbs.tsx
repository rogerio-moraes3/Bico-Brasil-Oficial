import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  "": "Início",
  "jobs": "Buscar Profissionais",
  "post-job": "Publicar Trabalho",
  "edit-job": "Editar Trabalho",
  "edit-service": "Editar Serviço",
  "auth": "Autenticação",
  "admin": "Admin",
  "profile": "Perfil",
  "myads": "Meus Anúncios",
  "terms": "Termos de Uso",
  "privacy": "Política de Privacidade",
  "contact": "Central de Ajuda",
  "payment-success": "Pagamento Confirmado",
  "payment-failed": "Pagamento Falhou",
  "payment-pending": "Pagamento Pendente",
  "worker": "Profissionais",
  "offer-services": "Oferecer Serviços",
  "search-workers": "Buscar Profissionais",
  "procurar-bicos": "Procurar Bicos",
  "premium": "Planos Premium",
};

interface BreadcrumbsProps {
  workerName?: string;
}

export function Breadcrumbs({ workerName }: BreadcrumbsProps = {}) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 animate-fade-in">
      <Link
        to="/"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        
        // Se for rota de worker e temos workerName, usar o nome
        const isWorkerRoute = pathnames[0] === 'worker' && index === 1;
        const name = isWorkerRoute && workerName ? workerName : (routeNames[pathname] || pathname);

        return (
          <div key={routeTo} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{name}</span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-primary transition-colors"
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
