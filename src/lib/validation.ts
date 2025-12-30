import { z } from 'zod';

// Phone validation for Brazilian numbers
export const phoneSchema = z.string()
  .regex(/^(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}$/, "Telefone inválido. Use formato: (XX) 9XXXX-XXXX")
  .transform(val => val.replace(/\D/g, ''));

// Email validation
export const emailSchema = z.string()
  .email("E-mail inválido")
  .max(255, "E-mail muito longo");

// Name validation
export const nameSchema = z.string()
  .trim()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres");

// Job posting validation
export const jobSchema = z.object({
  title: z.string()
    .trim()
    .min(10, "Título deve ter pelo menos 10 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  description: z.string()
    .trim()
    .min(20, "Descrição deve ter pelo menos 20 caracteres")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  category: z.string()
    .min(1, "Selecione uma categoria"),
  subcategory: z.string().optional(),
  phone: phoneSchema,
  contractorName: nameSchema,
  neighborhood: z.string()
    .trim()
    .max(100, "Bairro muito longo")
    .optional()
    .or(z.literal('')),
  address: z.string()
    .trim()
    .max(200, "Endereço muito longo")
    .optional()
});

// User signup validation
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(72, "Senha muito longa"),
  phone: phoneSchema,
  cpf: z.string()
    .min(11, "CPF incompleto")
    .max(14, "CPF muito longo")
    .transform(val => val.replace(/\D/g, '')),
  neighborhood: z.string()
    .trim()
    .max(100, "Bairro muito longo")
    .optional()
    .or(z.literal('')),
  type: z.enum(['worker', 'contractor'], {
    errorMap: () => ({ message: "Selecione o tipo de usuário" })
  }),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string()
    .max(500, "Descrição muito longa")
    .optional(),
  price: z.string()
    .max(50, "Preço muito longo")
    .optional()
});

// WhatsApp URL validation
// Contact form validation schema
export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  email: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email deve ter no máximo 255 caracteres" }),
  subject: z.string()
    .trim()
    .min(3, { message: "Assunto deve ter no mínimo 3 caracteres" })
    .max(200, { message: "Assunto deve ter no máximo 200 caracteres" }),
  message: z.string()
    .trim()
    .min(10, { message: "Mensagem deve ter no mínimo 10 caracteres" })
    .max(2000, { message: "Mensagem deve ter no máximo 2000 caracteres" })
});

export const validateWhatsAppUrl = (phone: string, name: string): { valid: boolean; url?: string; error?: string } => {
  try {
    const validatedPhone = phoneSchema.parse(phone);
    const validatedName = nameSchema.parse(name);

    const url = `https://wa.me/55${validatedPhone}?text=${encodeURIComponent(
      `Olá ${validatedName}, vi seu perfil no Bico Brasil e gostaria de conversar sobre um trabalho.`
    )}`;

    return { valid: true, url };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: "Erro ao validar dados" };
  }
};
