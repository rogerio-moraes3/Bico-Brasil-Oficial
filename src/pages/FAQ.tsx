import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FAQ as FAQComponent } from '@/components/FAQ';


export default function FAQPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      
      <main className="flex-grow container mx-auto px-4 py-16 pb-20 md:pb-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Perguntas Frequentes</h1>
        <FAQComponent />
      </main>

      <Footer />
    </div>
  );
}
