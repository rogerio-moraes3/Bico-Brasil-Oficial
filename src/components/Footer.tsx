import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setIsAdmin(false);
          return;
        }

        const { data: colaboradorData } = await supabase
          .from("colaboradores_autorizados")
          .select("email")
          .ilike("email", user.email)
          .maybeSingle();

        setIsAdmin(!!colaboradorData);
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-card text-card-foreground mt-12 border-t border-border">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Coluna 1: Ajuda */}
          <div className="pb-3 md:pb-0 md:pr-6">
            <h3 className="font-semibold text-card-foreground mb-3 text-sm md:text-base">Ajuda</h3>
            <ul className="space-y-2 text-sm text-card-foreground/80">
              <li>
                <Link to="/about" onClick={scrollToTop} className="hover:text-foreground transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/relacao-usuarios" onClick={scrollToTop} className="hover:text-foreground transition-colors">
                  Relação com usuários
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={scrollToTop} className="hover:text-foreground transition-colors">
                  Tire sua dúvida
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 2: Redes Sociais */}
          <div className="pt-3 pb-3 md:pt-0 md:pb-0 md:px-6">
            <h3 className="font-semibold text-card-foreground mb-3 text-sm md:text-base">Redes Sociais</h3>
            <ul className="space-y-2 text-sm text-card-foreground/80">
              <li>
                <a href="https://www.instagram.com/bicobrasil_" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/profile.php?id=61584453683707" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@bicobrasil" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  TikTok
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@BicoBrasil-l8r" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  YouTube
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/bico-brasil-1bb190397/" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento */}
          <div className="pt-3 pb-3 md:pt-0 md:pb-0 md:px-6">
            <h3 className="font-semibold text-card-foreground mb-3 text-sm md:text-base">Atendimento</h3>
            <p className="text-sm text-card-foreground/80 mb-2">Segunda a sexta, 9h às 18h</p>
            <p className="text-sm text-card-foreground/80 mb-3">Ainda está com dúvidas?</p>
            <Link
              to="/faq"
              onClick={scrollToTop}
              className="inline-block px-6 py-2 border-2 border-card-foreground/50 text-card-foreground rounded-full hover:bg-card-foreground/10 transition-colors text-sm font-medium"
            >
              TIRE SUAS DÚVIDAS AQUI!
            </Link>
          </div>

          {/* Coluna 4: Legal */}
          <div className="pt-4 md:pt-0 md:pl-6">
            <h3 className="font-semibold text-card-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-card-foreground/80">
              <li>
                <Link to="/terms" onClick={scrollToTop} className="hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" onClick={scrollToTop} className="hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={scrollToTop} className="hover:text-foreground transition-colors">
                  Perguntas e respostas
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={scrollToTop} className="hover:text-foreground transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA de Cadastro - apenas para usuários não logados */}
        {!user && (
          <div className="mt-6 pt-6 border-t border-border text-center">
            <h3 className="text-lg md:text-2xl font-bold text-card-foreground mb-2">Pronto para começar?</h3>
            <p className="text-card-foreground/80 mb-4 max-w-md mx-auto text-sm md:text-base">
              Crie sua conta gratuitamente e comece a receber oportunidades de trabalho hoje mesmo.
            </p>
            <Button
              size="lg"
              onClick={() => {
                navigate("/cadastro");
                setTimeout(() => {
                  const firstInput = document.querySelector('input[type="text"], input[type="email"]') as HTMLInputElement;
                  firstInput?.focus();
                }, 150);
              }}
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Criar Conta Grátis
            </Button>
          </div>
        )}

        {/* Logo e descrição */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Bico Brasil" className="h-10 w-10" />
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg md:text-xl text-card-foreground leading-tight w-[140px] inline-block">
                  Bico Brasil
                </span>
                <span className="text-sm md:text-[16px] text-card-foreground/80 leading-tight font-medium w-[140px] inline-block">
                  Trabalhou, Tá Pago.
                </span>
              </div>
            </Link>
            <p className="text-sm text-card-foreground/80 max-w-md text-center md:text-left">
              Conectamos pessoas que precisam de ajuda urgente com profissionais qualificados. Rápido, fácil e seguro.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-card-foreground/60">
          <p>© {new Date().getFullYear()} Bico Brasil. Todos os direitos reservados.</p>
          <p className="mt-2">Contato para LGPD: privacidade@bicobrasil.com.br</p>

          {/* Link discreto para Admin - SEMPRE VISÍVEL */}
          <Link
            to={isAdmin ? "/admin" : "/auth"}
            className="mt-4 inline-flex items-center gap-2 text-card-foreground/40 hover:text-card-foreground/70 transition-colors"
          >
            <Settings size={14} />
            <span>Área Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
