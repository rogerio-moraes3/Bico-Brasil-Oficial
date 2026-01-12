-- Enable realtime for community tables
ALTER TABLE community_posts REPLICA IDENTITY FULL;
ALTER TABLE community_comments REPLICA IDENTITY FULL;
ALTER TABLE community_likes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE community_likes;