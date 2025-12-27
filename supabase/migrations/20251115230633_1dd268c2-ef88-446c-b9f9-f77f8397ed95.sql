-- Create view for top job opportunities ranked by popularity
CREATE OR REPLACE VIEW ranking_top_jobs AS
SELECT 
  jp.id,
  jp.title,
  jp.description,
  jp.category_id,
  u.name as contractor_name,
  u.profile_photo as contractor_photo,
  COUNT(DISTINCT jv.id) as views_count,
  COUNT(DISTINCT jc.id) as contacts_count,
  (COUNT(DISTINCT jv.id) + COUNT(DISTINCT jc.id) * 5) as popularity_score,
  jp.created_at,
  jp.urgent
FROM job_postings jp
LEFT JOIN users u ON jp.user_id = u.id
LEFT JOIN job_views jv ON jp.id = jv.job_id
LEFT JOIN job_contacts jc ON jp.id = jc.job_id
WHERE jp.status = 'open'
GROUP BY jp.id, jp.title, jp.description, jp.category_id, u.name, u.profile_photo, jp.created_at, jp.urgent
ORDER BY popularity_score DESC, jp.created_at DESC
LIMIT 50;

-- Create view for top workers ranked by completed jobs
CREATE OR REPLACE VIEW ranking_top_workers AS
SELECT 
  u.id,
  u.name,
  u.profile_photo,
  u.category,
  u.subcategory,
  u.rating_avg,
  u.rating_count,
  u.jobs_done,
  u.verified,
  u.destaque_expires_at,
  COUNT(DISTINCT j.id) as total_jobs,
  COUNT(DISTINCT CASE WHEN j.status = 'done' THEN j.id END) as completed_jobs
FROM users u
LEFT JOIN jobs j ON u.id = j.worker_id
WHERE u.type = 'worker' 
  AND u.plan_active = true
GROUP BY u.id, u.name, u.profile_photo, u.category, u.subcategory, 
         u.rating_avg, u.rating_count, u.jobs_done, u.verified, u.destaque_expires_at
ORDER BY completed_jobs DESC, u.rating_avg DESC, u.rating_count DESC
LIMIT 50;

-- Create view for top contractors ranked by activity
CREATE OR REPLACE VIEW ranking_top_contractors AS
SELECT 
  u.id,
  u.name,
  u.profile_photo,
  u.usage_count,
  u.last_usage_at,
  COUNT(DISTINCT jp.id) as total_job_postings,
  COUNT(DISTINCT j.id) as total_jobs,
  COUNT(DISTINCT CASE WHEN j.status = 'done' THEN j.id END) as completed_jobs,
  (u.usage_count + COUNT(DISTINCT jp.id) * 2 + COUNT(DISTINCT j.id) * 5) as activity_score
FROM users u
LEFT JOIN job_postings jp ON u.id = jp.user_id
LEFT JOIN jobs j ON u.id = j.contractor_id
WHERE u.type = 'contractor'
GROUP BY u.id, u.name, u.profile_photo, u.usage_count, u.last_usage_at
HAVING COUNT(DISTINCT jp.id) > 0 OR COUNT(DISTINCT j.id) > 0
ORDER BY activity_score DESC, u.last_usage_at DESC
LIMIT 50;

-- Enable realtime on relevant tables for ranking updates
ALTER TABLE job_postings REPLICA IDENTITY FULL;
ALTER TABLE job_views REPLICA IDENTITY FULL;
ALTER TABLE job_contacts REPLICA IDENTITY FULL;
ALTER TABLE jobs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE job_postings;
ALTER PUBLICATION supabase_realtime ADD TABLE job_views;
ALTER PUBLICATION supabase_realtime ADD TABLE job_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;