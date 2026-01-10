import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, Instagram, Facebook, Mail, ArrowRight } from "lucide-react";

export const SalesFooter = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Junte-se a milhares de brasileiros que já usam o Bico Brasil para resolver e faturar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/app")}
              className="bg-white hover:bg-gray-50 font-bold px-8 py-4 rounded-lg shadow-lg transition-all border border-slate-200 text-gray-900 dark:text-white"
            >
              Buscar Profissional
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/app")}
              className="bg-white hover:bg-gray-50 font-bold px-8 py-4 rounded-lg shadow-lg transition-all border border-slate-200 text-gray-900 dark:text-white"
            >
              Oferecer Serviços
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo.png"
                  alt="Bico Brasil"
                  className="h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-2xl font-bold">Bico Brasil</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                A plataforma que conecta quem precisa de serviços a profissionais qualificados.
                Sem intermediários, sem comissões abusivas.
              </p>
              <p className="text-slate-500 text-sm">
                Trabalhou, Tá Pago.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                    Quem Somos
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-slate-400 hover:text-white transition-colors">
                    Perguntas Frequentes
                  </Link>
                </li>
                <li>
                  <Link to="/premium" className="text-slate-400 hover:text-white transition-colors">
                    Planos e Preços
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>

              <h4 className="font-semibold mt-6 mb-4">Redes Sociais</h4>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/bicobrasil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/bicobrasil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="mailto:contato@bicobrasil.com.br"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Bico Brasil. Todos os direitos reservados.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
              className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
            >
              Área Admin
            </Button>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
        <Button
          onClick={() => {
            const event = new Event('show-pwa-prompt');
            window.dispatchEvent(event);
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg"
        >
          <Smartphone className="w-5 h-5 mr-2" />
          Instalar App Grátis
        </Button>
      </div>
    </>
  );
};
