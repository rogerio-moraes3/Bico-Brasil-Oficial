import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FAQ as FAQComponent } from '@/components/FAQ';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { safeGoBack } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function FAQPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-white selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow overflow-hidden">
        {/* Header Section */}
        <section className="relative pt-32 pb-12 md:pt-48 md:pb-20 border-b border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Button
                variant="ghost"
                onClick={() => safeGoBack(navigate)}
                className="mb-12 text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-xl font-bold flex items-center gap-2 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Voltar
              </Button>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 mb-10">
                <Sparkles className="w-3 h-3" />
                <span>Central de Ajuda</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
                Como podemos <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">ajudar?</span>
              </h1>
            </motion.div>
          </div>
        </section>

        {/* FAQ Component Section */}
        <div className="relative">
          <FAQComponent />
        </div>
      </main>

      <Footer />
    </div>
  );
}

