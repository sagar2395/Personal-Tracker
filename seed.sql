-- Insert test user
INSERT INTO users (email, password_hash, name, timezone, created_at) VALUES
('sagar@tracker.local', '9182875a98c4660df8084391585b42dd602d413664022f55bfe4f41d74375a75', 'Sagar', 'Asia/Kolkata', '2026-06-24T00:00:00Z');

-- Insert life areas
INSERT INTO life_areas (user_id, name, icon, color, priority_weight, target_weekly_hours, is_season, sort_order, created_at) VALUES
(1, 'Work — Valuelabs', 'briefcase', '#3b82f6', 9, 40, 1, 1, '2026-06-24T00:00:00Z'),
(1, 'Work — Avyka', 'laptop', '#8b5cf6', 7, 10, 1, 2, '2026-06-24T00:00:00Z'),
(1, 'Health', 'heart', '#10b981', 8, 7, 1, 3, '2026-06-24T00:00:00Z'),
(1, 'Personal & Home', 'home', '#f59e0b', 6, 5, 1, 4, '2026-06-24T00:00:00Z'),
(1, 'Finance', 'wallet', '#06b6d4', 5, 2, 1, 5, '2026-06-24T00:00:00Z'),
(1, 'Snowops', 'rocket', '#ec4899', 4, 5, 1, 6, '2026-06-24T00:00:00Z'),
(1, 'Side Hustle', 'zap', '#f97316', 2, 0, 0, 7, '2026-06-24T00:00:00Z');
