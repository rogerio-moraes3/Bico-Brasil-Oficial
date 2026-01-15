import { processQueue, getQueue } from './offlineQueue';
import { supabase } from '@/integrations/supabase/client';

/**
 * Process offline queue items using supabase handlers.
 * Emits a `offlineQueueProcessed` window event at the end with a summary.
 */
export const processOfflineQueue = async (onProgress?: (item: any) => void) => {
  let processedCount = 0;
  let failedCount = 0;

  await processQueue({
    publishJob: async (payload) => {
      const authId = payload._auth_id;
      if (!authId) throw new Error('missing auth id');

      // find user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, user_role, free_posts_remaining')
        .eq('auth_id', authId)
        .single();

      if (userError || !userData) throw new Error('Usuario nao encontrado');

      // map availability
      const availability = payload.available_today ? 'hoje' : payload.availability || null;

      // Check schema and include availability only if the column exists; fallback retry without it on error
      const { hasColumn } = await import('@/lib/schemaCheck');
      const availabilityExists = await hasColumn('job_postings', 'availability');

      const insertPayload: any = {
        user_id: userData.id,
        title: payload.title,
        description: payload.description,
        price: payload.price ? parseFloat(payload.price) : null,
        location: payload.location || null,
        category_id: payload.isCustomCategory ? null : payload.category,
        custom_category: payload.isCustomCategory ? payload.customCategory : null,
        city_id: payload.city_id,
        neighborhood: payload.neighborhood,
        urgent: payload.urgent || false,
        date_time: payload.date_time ? new Date(payload.date_time).toISOString() : null,
        status: 'open'
      };

      if (availabilityExists) {
        insertPayload.availability = availability;
      }

      let insertError: any = null;
      const insertRes = await supabase.from('job_postings').insert(insertPayload);
      if (insertRes.error) {
        insertError = insertRes.error;
        // Last resort fallback: retry without availability if error references it
        if (insertError.message?.toLowerCase?.().includes('availability')) {
          delete insertPayload.availability;
          const retryRes = await supabase.from('job_postings').insert(insertPayload);
          if (retryRes.error) throw retryRes.error;
        } else {
          throw insertError;
        }
      }

      // decrement free posts if employer
      if (userData.user_role === 'empregador' && userData.free_posts_remaining > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ free_posts_remaining: userData.free_posts_remaining - 1 })
          .eq('id', userData.id);
        if (updateError) console.warn('Failed to decrement free posts', updateError);
      }

      processedCount++;
    },

    offerService: async (payload) => {
      const authId = payload._auth_id;
      if (!authId) throw new Error('missing auth id');

      // Update user profile
      const { error: userErr } = await supabase
        .from('users')
        .update({
          type: 'worker',
          phone: payload.phone,
          city_id: payload.city_id,
          neighborhood: payload.neighborhood,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', authId);

      if (userErr) throw userErr;

      // get user id
      const { data: userData, error: getUserError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authId)
        .single();

      if (getUserError || !userData) throw new Error('Usuario nao encontrado');

      // insert worker service
      const { hasColumn } = await import('@/lib/schemaCheck');
      const availabilityExistsSvc = await hasColumn('worker_services', 'availability');

      const servicePayload: any = {
        user_id: userData.id,
        title: payload.service_title,
        description: payload.description,
        category_id: payload.isCustomCategory ? null : payload.category,
        custom_category: payload.isCustomCategory ? payload.customCategory : null,
        subcategory_id: payload.subcategory || null,
        price: payload.price ? parseFloat(payload.price) : null,
        active: true
      };

      if (availabilityExistsSvc) {
        servicePayload.availability = payload.available_today ? 'hoje' : payload.availability;
      }

      const svcRes = await supabase.from('worker_services').insert(servicePayload);
      if (svcRes.error) {
        const svcErr = svcRes.error;
        if (svcErr.message?.toLowerCase?.().includes('availability')) {
          delete servicePayload.availability;
          const retry = await supabase.from('worker_services').insert(servicePayload);
          if (retry.error) throw retry.error;
        } else {
          throw svcErr;
        }
      }

      processedCount++;
    }
  }, (item) => {
    onProgress?.(item);
  }).catch(err => {
    // Don't rethrow — processQueue handles marking failures. We'll log and report.
    console.error('processQueue error', err);
  });

  const remaining = getQueue();
  // Dispatch event summarizing the result
  window.dispatchEvent(new CustomEvent('offlineQueueProcessed', { detail: { processed: processedCount, remaining: remaining.length } }));

  return { processed: processedCount, remaining: remaining.length };
};
