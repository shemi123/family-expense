-- V2__seed_default_categories.sql
-- Seed global system default categories (family_id IS NULL, is_system = TRUE)

-- Expense Categories
INSERT INTO categories (id, family_id, name, type, icon, color, is_system) VALUES
    (gen_random_uuid(), NULL, 'Housing & Rent', 'EXPENSE', 'Home', '#ef4444', TRUE),
    (gen_random_uuid(), NULL, 'Groceries', 'EXPENSE', 'ShoppingCart', '#f59e0b', TRUE),
    (gen_random_uuid(), NULL, 'Food & Dining', 'EXPENSE', 'Utensils', '#f97316', TRUE),
    (gen_random_uuid(), NULL, 'Utilities & Bills', 'EXPENSE', 'Zap', '#eab308', TRUE),
    (gen_random_uuid(), NULL, 'Transportation & Fuel', 'EXPENSE', 'Car', '#84cc16', TRUE),
    (gen_random_uuid(), NULL, 'Healthcare & Medical', 'EXPENSE', 'HeartPulse', '#10b981', TRUE),
    (gen_random_uuid(), NULL, 'Entertainment & Leisure', 'EXPENSE', 'Film', '#06b6d4', TRUE),
    (gen_random_uuid(), NULL, 'Shopping & Clothing', 'EXPENSE', 'ShoppingBag', '#3b82f6', TRUE),
    (gen_random_uuid(), NULL, 'Education & Courses', 'EXPENSE', 'GraduationCap', '#8b5cf6', TRUE),
    (gen_random_uuid(), NULL, 'Subscriptions & Services', 'EXPENSE', 'CreditCard', '#ec4899', TRUE),
    (gen_random_uuid(), NULL, 'Personal Care', 'EXPENSE', 'Smile', '#14b8a6', TRUE),
    (gen_random_uuid(), NULL, 'Miscellaneous & Other', 'EXPENSE', 'MoreHorizontal', '#64748b', TRUE);

-- Income Categories
INSERT INTO categories (id, family_id, name, type, icon, color, is_system) VALUES
    (gen_random_uuid(), NULL, 'Salary & Wages', 'INCOME', 'Briefcase', '#10b981', TRUE),
    (gen_random_uuid(), NULL, 'Freelance & Consulting', 'INCOME', 'Laptop', '#06b6d4', TRUE),
    (gen_random_uuid(), NULL, 'Investments & Dividends', 'INCOME', 'TrendingUp', '#3b82f6', TRUE),
    (gen_random_uuid(), NULL, 'Gifts & Bonuses', 'INCOME', 'Gift', '#a855f7', TRUE),
    (gen_random_uuid(), NULL, 'Other Income', 'INCOME', 'DollarSign', '#64748b', TRUE);
