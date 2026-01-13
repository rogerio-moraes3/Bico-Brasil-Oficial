import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Briefcase, Search } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bb-white)' }}>
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-8">
                <div className="text-center max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--bb-text-dark)' }}>
                        Bico Brasil
                    </h1>
                    <p className="text-xl md:text-2xl font-medium mb-12" style={{ color: 'var(--bb-text-dark)' }}>
                        O que você precisa agora?
                    </p>
                </div>

                <div className="w-full max-w-md flex flex-col gap-4">
                    <button
                        onClick={() => navigate('/want-to-work')}
                        className="bb-button w-full h-14 flex items-center justify-center gap-3 text-lg"
                    >
                        <Briefcase className="w-5 h-5" />
                        Quero trabalhar
                    </button>

                    <button
                        onClick={() => navigate('/want-someone')}
                        className="bb-button w-full h-14 flex items-center justify-center gap-3 text-lg"
                    >
                        <Search className="w-5 h-5" />
                        Quero alguém pra trabalhar
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
