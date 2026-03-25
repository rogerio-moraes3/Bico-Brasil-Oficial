export const InstitutionalBlock = () => {
  return (
    <section className="bg-muted/30 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-blue-900 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground dark:text-white mb-6 leading-tight px-4">
          Renda Rápida Local, Sem Leilão de Preços e com Perfis Verificados
        </h2>

        <p className="text-lg md:text-xl text-muted-foreground dark:text-blue-100 max-w-4xl mx-auto mb-14 px-4">
          O Bico Brasil foi criado para eliminar comissões abusivas, disputas por preço
          e intermediários desnecessários. Aqui, a conexão é direta entre quem precisa
          do serviço e quem sabe fazer, com foco na sua cidade e em perfis verificados.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-card dark:bg-blue-900/60 border border-border dark:border-blue-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">📍</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">
              Renda Local e Imediata
            </h3>
            <p className="text-muted-foreground dark:text-blue-100 text-sm leading-relaxed">
              Serviços próximos, com mais chance de fechamento e sem concorrência desleal.
            </p>
          </div>

          <div className="bg-card dark:bg-blue-900/60 border border-border dark:border-blue-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">🚫</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">
              Sem Leilão de Preços
            </h3>
            <p className="text-muted-foreground dark:text-blue-100 text-sm leading-relaxed">
              O contato é direto. Seus dados não são vendidos para vários profissionais.
            </p>
          </div>

          <div className="bg-card dark:bg-blue-900/60 border border-border dark:border-blue-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-lg">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">
              Perfis Verificados
            </h3>
            <p className="text-muted-foreground dark:text-blue-100 text-sm leading-relaxed">
              Validação de documentos e sistema de avaliações reais para mais segurança.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
