# Auditoria: Fluxo de Cadastro e Autenticação

## 1. Campos Desnecessários

- **Campos Atuais no Cadastro:**  
  O formulário de cadastro coleta: `name`, `email`, `phone`, `cpf`, senha e confirmação de senha, além de cidade e categoria (profissional).  
  A obrigatoriedade de `cpf` e `phone` pode desestimular usuários sem necessidade legal, especialmente na primeira entrega.  
  O campo de cidade parece obrigatório, embora muitos usuários possam preferir completar o perfil depois.

- **Ponto de Melhoria:**  
  Avaliar tornar `phone`, `cpf` e escolha de cidade opcionais para cadastro inicial — exigindo-os apenas no momento oportuno.

---

## 2. Fragilidades de Erro

- **Perda de Conexão:**  
  Não há tratamento explícito para perda de conexão durante o cadastro (ex: submit sem internet). Possível experiência: a tela fica travada com loading ou mostra erro genérico.
- **Mensagens de Erro:**  
  O sistema utiliza `toast()` para mensagens, mas a personalização depende do retorno do Supabase. Erros técnicos (ex: duplicidade de CPF) podem aparecer com mensagem pouco amigável como "duplicate key value violates unique constraint", em vez de "CPF já cadastrado".
- **Melhoria:**  
  Mapear mensagens do Supabase para português claro para os principais erros (`cpf já cadastrado`, `email já usado`, etc.) no frontend.

---

## 3. Consistência de Dados / Trigger handle_new_user

- **full_name:**  
  Após a última correção, o payload inclui corretamente `full_name` no metadata, atendendo ao trigger do Supabase. Assim, não há travas óbvias que impeçam a criação de perfil.
- **Risco:**  
  Caso o campo `full_name` seja enviado vazio, o trigger fallback para `email` como nome. O cadastro não deve falhar.
- **Validação Recomendada:**  
  O frontend deve sempre garantir que o campo `full_name` nunca seja string vazia; se possível forçar via schema de validação.

---

## 4. Segurança de Rota

- **Proteção:**  
  O fluxo utiliza o componente `<ProtectedRoute>` e `<ProfileCompletionGuard>`, que redirecionam usuários não autenticados para a tela de login.
- **Possível Loop/Tela Branca:**  
  Não há indício de loop infinito enquanto o contexto de autenticação carrega (uso correto do loading). Porém, se o contexto Autenticator travar em erro/estado inconsistente, pode ocorrer tela branca.
- **Melhorias:**  
  - Garantir sempre estado de loading visível durante verificações de sessão/autenticação.
  - Adicionar fallback amigável (mensagem ou botão) caso a autenticação não possa ser checada.

---

## Resumo das Recomendações

1. **Rever obrigatoriedade imediata de CPF/phone/cidade** — tornar opcionais no cadastro, exigir depois.
2. **Mapear erros do Supabase para mensagens claras** no toast: priorizar CPF/email já cadastrado.
3. **Garantir front-end nunca envia full_name vazio**.
4. **Manter loading sempre visível enquanto o usuário não está autenticado e session é incerta.**

---