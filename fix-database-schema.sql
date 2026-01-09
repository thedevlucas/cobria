-- Fix Database Schema Issues
-- This script fixes the database schema issues identified in the logs

-- 1. Fix Cost table column names (only if the column exists)
DO $$ 
BEGIN
    -- Rename idCompany to id_company if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cost' AND column_name = 'idCompany') THEN
        ALTER TABLE cost RENAME COLUMN "idCompany" TO id_company;
    END IF;
END $$;

-- 2. Add missing columns to cost table if they don't exist
DO $$ 
BEGIN
    -- Add id_user column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cost' AND column_name = 'id_user') THEN
        ALTER TABLE cost ADD COLUMN id_user BIGINT;
    END IF;
    
    -- Add id_debtor column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cost' AND column_name = 'id_debtor') THEN
        ALTER TABLE cost ADD COLUMN id_debtor BIGINT;
    END IF;
    
    -- Add cost_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cost' AND column_name = 'cost_type') THEN
        ALTER TABLE cost ADD COLUMN cost_type VARCHAR(255);
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cost' AND column_name = 'description') THEN
        ALTER TABLE cost ADD COLUMN description TEXT;
    END IF;
    
    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cost' AND column_name = 'phone_number') THEN
        ALTER TABLE cost ADD COLUMN phone_number BIGINT;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cost' AND column_name = 'status') THEN
        ALTER TABLE cost ADD COLUMN status VARCHAR(50) DEFAULT 'processed';
    END IF;
END $$;

-- 3. Create pending_message table if it doesn't exist
CREATE TABLE IF NOT EXISTS pending_message (
    id BIGSERIAL PRIMARY KEY,
    id_user BIGINT NOT NULL,
    id_debtor BIGINT,
    phone_number BIGINT,
    message TEXT,
    type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create cost table if it doesn't exist (with correct schema)
CREATE TABLE IF NOT EXISTS cost (
    id BIGSERIAL PRIMARY KEY,
    id_company BIGINT,
    id_user BIGINT,
    id_debtor BIGINT,
    amount FLOAT NOT NULL,
    type VARCHAR(50),
    cost_type VARCHAR(255),
    description TEXT,
    phone_number BIGINT,
    status VARCHAR(50) DEFAULT 'processed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cost_id_user ON cost(id_user);
CREATE INDEX IF NOT EXISTS idx_cost_id_debtor ON cost(id_debtor);
CREATE INDEX IF NOT EXISTS idx_cost_created_at ON cost(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_message_id_user ON pending_message(id_user);
CREATE INDEX IF NOT EXISTS idx_pending_message_status ON pending_message(status);

-- 6. Update existing cost records to have proper id_user values
UPDATE cost SET id_user = id_company WHERE id_user IS NULL AND id_company IS NOT NULL;

-- 7. Set default values for missing fields
UPDATE cost SET cost_type = type WHERE cost_type IS NULL AND type IS NOT NULL;
UPDATE cost SET status = 'processed' WHERE status IS NULL;

COMMIT;
