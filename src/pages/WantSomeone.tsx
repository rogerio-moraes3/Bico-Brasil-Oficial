import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Search, UserPlus } from 'lucide-react';

export default function WantSomeone() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bb-white)' }}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--bb-text-dark)' }}>Quero alguém pra trabalhar</h1>
        <p className="text-muted-foreground">Como você quer encontrar alguém?</p>

        <div className="w-full max-w-md flex flex-col gap-3 mt-6">
          <button onClick={() => navigate('/search-workers')} className="bb-button w-full h-12 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Buscar pessoas
          </button>
          <button onClick={() => navigate('/post-job')} className="bb-button w-full h-12 flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            Publicar um bico
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
