-- V4__add_batch_id_to_transactions.sql
-- Add batch_id to transactions table for multi-entry tracking

ALTER TABLE transactions ADD COLUMN batch_id UUID;
CREATE INDEX idx_transactions_batch_id ON transactions(batch_id);
