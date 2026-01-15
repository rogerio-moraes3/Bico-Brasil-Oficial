import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
    isActive: boolean;
    subscriptionEnd: string | null;
    subscriptionStart: string | null;
    planType: string | null;
}

/**
 * Get subscription status from payments table (single source of truth)
 */
export const getSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus> => {
    const { data: payment } = await supabase
        .from('payments')
        .select('subscription_end, subscription_start, plan_type')
        .eq('user_id', userId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const isActive = payment?.subscription_end
        ? new Date(payment.subscription_end) > new Date()
        : false;

    return {
        isActive,
        subscriptionEnd: payment?.subscription_end || null,
        subscriptionStart: payment?.subscription_start || null,
        planType: payment?.plan_type || null
    };
};

/**
 * Check if user has active premium subscription
 */
export const hasActivePremium = async (userId: string): Promise<boolean> => {
    const status = await getSubscriptionStatus(userId);
    return status.isActive;
};
