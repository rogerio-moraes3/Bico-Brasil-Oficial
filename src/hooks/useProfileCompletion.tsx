import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Data de lançamento do item 11 (cadastro obrigatoriamente completo).
// Contas com auth.users.created_at anterior a esta data são "legadas": nunca
// bloqueadas na navegação geral, só nas ações de alto valor, e só depois do
// fim da carência abaixo.
export const PROFILE_COMPLETION_LAUNCH_DATE = new Date('2026-08-24T00:00:00Z');
const GRACE_PERIOD_DAYS = 30;
const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export const PROFILE_FIELD_LABELS: Record<string, string> = {
  cpf: 'CPF',
  phone: 'Telefone/WhatsApp',
  phone_verified: 'Telefone/WhatsApp confirmado',
  city_id: 'Cidade',
  neighborhood: 'Bairro',
  cep: 'CEP',
  house_number: 'Número da residência',
  category: 'Categoria de trabalho',
};

interface ProfileRow {
  cpf: string | null;
  phone: string | null;
  phone_verified: boolean | null;
  city_id: string | null;
  neighborhood: string | null;
  cep: string | null;
  house_number: string | null;
  type: string | null;
  category: string | null;
  name: string | null;
  email: string | null;
}

export interface ProfileCompletionState {
  loading: boolean;
  profile: ProfileRow | null;
  /** chaves de PROFILE_FIELD_LABELS que faltam preencher */
  missingFields: string[];
  isComplete: boolean;
  /** conta criada antes do lançamento do item 11 */
  isLegacyAccount: boolean;
  /** só definido para contas legadas */
  gracePeriodEndsAt: Date | null;
  isGracePeriodActive: boolean;
  /** true quando a navegação geral do app deve ser bloqueada (Gatekeeper) */
  blockGeneralNavigation: boolean;
  /** true quando só ações de alto valor devem ser bloqueadas (ProfileCompletionGuard) */
  blockHighValueActions: boolean;
  refresh: () => Promise<void>;
}

const isFilled = (v: string | null | undefined) => !!v && v.trim() !== '';

function computeMissingFields(profile: ProfileRow | null): string[] {
  if (!profile) return Object.keys(PROFILE_FIELD_LABELS);

  const missing: string[] = [];
  if (!isFilled(profile.cpf)) missing.push('cpf');
  if (!isFilled(profile.phone)) missing.push('phone');
  if (!profile.phone_verified) missing.push('phone_verified');
  if (!profile.city_id) missing.push('city_id');
  if (!isFilled(profile.neighborhood)) missing.push('neighborhood');
  if (!isFilled(profile.cep)) missing.push('cep');
  if (!isFilled(profile.house_number)) missing.push('house_number');
  if (profile.type === 'worker' && !isFilled(profile.category)) missing.push('category');
  return missing;
}

const ProfileCompletionContext = createContext<ProfileCompletionState | null>(null);

/**
 * Fonte única de verdade sobre completude de perfil — substitui as checagens
 * duplicadas e divergentes que existiam em Gatekeeper.tsx (cpf/phone/city_id)
 * e ProfileCompletionGuard.tsx (phone/neighborhood/city_id/category), que
 * nunca concordavam sobre o que "perfil completo" significa.
 *
 * É Context (não só hook) de propósito: Gatekeeper (montado uma vez, fora
 * das rotas) e ProfileCompletionGuard (em várias rotas) precisam enxergar o
 * mesmo estado — sem isso, salvar o perfil em CompleteProfile.tsx não
 * atualizaria o Gatekeeper, que ficaria bloqueando com dado velho.
 */
export function ProfileCompletionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  // Guarda pra qual user.id o `profile` atual corresponde (null = já
  // resolvido como deslogado; undefined = nunca buscou ainda). `loading` é
  // DERIVADO disso a cada render, nunca um setState separado — se fosse um
  // setState próprio, existe uma janela real entre "user vira não-nulo" e o
  // useEffect rodar de novo onde loading ainda estaria com o valor antigo
  // (false, do fetch anterior pra usuário deslogado), e os guards (Gatekeeper/
  // ProfileCompletionGuard) decidiriam com profile=null ainda stale — foi
  // exatamente o bug que me mandou de volta pra /complete-profile com o
  // cadastro já completo no banco.
  const [loadedForUserId, setLoadedForUserId] = useState<string | null | undefined>(undefined);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoadedForUserId(null);
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('cpf, phone, phone_verified, city_id, neighborhood, cep, house_number, type, category, name, email')
      .eq('auth_id', user.id)
      .maybeSingle();

    setProfile((data as ProfileRow) ?? null);
    setLoadedForUserId(user.id);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const loading = user ? loadedForUserId !== user.id : loadedForUserId !== null;

  const missingFields = computeMissingFields(profile);
  const isComplete = missingFields.length === 0;

  const isLegacyAccount = !!user?.created_at && new Date(user.created_at) < PROFILE_COMPLETION_LAUNCH_DATE;
  const gracePeriodEndsAt = isLegacyAccount
    ? new Date(PROFILE_COMPLETION_LAUNCH_DATE.getTime() + GRACE_PERIOD_MS)
    : null;
  const isGracePeriodActive = !!gracePeriodEndsAt && Date.now() < gracePeriodEndsAt.getTime();

  const value: ProfileCompletionState = {
    loading,
    profile,
    missingFields,
    isComplete,
    isLegacyAccount,
    gracePeriodEndsAt,
    isGracePeriodActive,
    // Sem usuário logado não há o que bloquear — essas flags são só pra
    // depois do login (visitante anônimo nunca deve cair aqui: sem isso,
    // profile null == "incompleto" e isLegacyAccount == false por falta de
    // user.created_at, o que bloquearia o site inteiro pra quem nem entrou).
    // Conta nova incompleta: bloqueia tudo. Conta legada: nunca bloqueia
    // navegação geral, só ações de alto valor (e só depois da carência).
    blockGeneralNavigation: !!user && !isComplete && !isLegacyAccount,
    blockHighValueActions: !!user && !isComplete && (!isLegacyAccount || !isGracePeriodActive),
    refresh: load,
  };

  return <ProfileCompletionContext.Provider value={value}>{children}</ProfileCompletionContext.Provider>;
}

export function useProfileCompletion(): ProfileCompletionState {
  const ctx = useContext(ProfileCompletionContext);
  if (!ctx) {
    throw new Error('useProfileCompletion must be used within ProfileCompletionProvider');
  }
  return ctx;
}
