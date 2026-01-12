# 🛠️ REPARO DO CADASTRO - PLANO DE AÇÃO

## ❌ PROBLEMA IDENTIFICADO

**Erro:** `TypeError: Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'`

**Linha:** 410 em Auth.tsx

**Causa:** `e.currentTarget` pode não ser o formulário (pode ser botão ou componente aninhado)

---

## ✂️ CAMPOS A REMOVER (Área Vermelha)

Linhas 843-900 em Auth.tsx:

1. **Tipo de Usuário** (linhas 843-854)
2. **Oferece Vagas** (linhas 855-869)
3. **Categoria Principal** (linhas 870-882)
4. **Descrição** (linhas 883-886)
5. **Preço Sugerido** (linhas 887-890)
6. **Melhor forma de contato** (linhas 892-903)

---

## ✅ CAMPOS A MANTER (Área Verde)

1. Nome Completo
2. CPF (obrigatório)
3. E-mail
4. Senha
5. Confirmar Senha
6. WhatsApp
7. Cidade
8. Bairro

---

## 🔧 CORREÇÃO TÉCNICA

### handleSignup (linha 340-510)

**ANTES:**
```typescript
const formData = new FormData(e.currentTarget); // ❌ ERRO
const categorySlug = formData.get('category') as string;
const selectedCat = categories.find(c => c.slug === categorySlug);
```

**DEPOIS:**
```typescript
// Usar e.target ao invés de e.currentTarget
const form = e.target as HTMLFormElement;
const formData = new FormData(form);

// Remover lógica de categoria (não existe mais)
const neighborhood = (formData.get('neighborhood') as string || '').trim();
```

---

## 📊 DADOS ENVIADOS (Simplificado)

```typescript
const data = {
  name: formData.get('name') as string,
  email: formData.get('email') as string,
  password: signupPassword,
  phone: formData.get('phone') as string,
  neighborhood: formattedNeighborhood,
  city_id: selectedCity,
  cpf: cleanCpf
  // ❌ Removido: type, user_role, category, description, price, primary_contact_method
};
```

---

## 🗄️ AJUSTE NO BANCO (Supabase)

Campos que podem estar como `NOT NULL` e precisam ser `NULL` ou ter default:

- `type`
- `user_role` 
- `category`
- `description`
- `price`
- `primary_contact_method`

**SQL para executar no Supabase:**

```sql
-- Tornar campos opcionais na tabela users
ALTER TABLE users 
  ALTER COLUMN type DROP NOT NULL,
  ALTER COLUMN user_role SET DEFAULT 'prestador',
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN price DROP NOT NULL,
  ALTER COLUMN primary_contact_method SET DEFAULT 'whatsapp';
```

---

**Executando correção agora...**
