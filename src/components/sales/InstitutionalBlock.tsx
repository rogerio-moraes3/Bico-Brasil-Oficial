export const InstitutionalBlock = () => {
  return (
    <section className="bg-[#d4fddf] dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-blue-900 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight px-4">
          Renda Rápida Local, Sem Leilão de Preços e com Perfis Verificados
        </h2>

        <p className="text-lg md:text-xl text-slate-600 dark:text-blue-100 max-w-4xl mx-auto mb-14">
          O Bico Brasil foi criado para eliminar comissões abusivas, disputas por preço
          e intermediários desnecessários. Aqui, a conexão é direta entre quem precisa
          do serviço e quem sabe fazer, com foco na sua cidade e em perfis verificados.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-blue-900 dark:bg-blue-800 border-2 border-blue-700 rounded-xl p-8 shadow-md">
            <h3 className="text-xl font-semibold text-white mb-3">
              Renda Local e Imediata
            </h3>
            <p className="text-blue-100">
              Serviços próximos, com mais chance de fechamento e sem concorrência desleal.
            </p>
          </div>

          <div className="bg-blue-900 dark:bg-blue-800 border-2 border-blue-700 rounded-xl p-8 shadow-md">
            <h3 className="text-xl font-semibold text-white mb-3">
              Sem Leilão de Preços
            </h3>
            <p className="text-blue-100">
              O contato é direto. Seus dados não são vendidos para vários profissionais.
            </p>
          </div>

          <div className="bg-blue-900 dark:bg-blue-800 border-2 border-blue-700 rounded-xl p-8 shadow-md">
            <h3 className="text-xl font-semibold text-white mb-3">
              Perfis Verificados
            </h3>
            <p className="text-blue-100">
              Validação de documentos e sistema de avaliações reais para mais segurança.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
