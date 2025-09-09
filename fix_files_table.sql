-- Fix files table to match what AdminDashboard expects for "View System Logs"

-- The AdminDashboard is looking for these columns in files table:
-- filename, original_filename, file_url, mime_type, folder_id, ai_summary, ai_keywords, 
-- ai_category, ai_priority, ai_suggested_tags, ai_confidence, ai_content_analysis, 
-- user_tags, user_description, is_favorite, upload_status, is_deleted, deleted_at

-- Add missing columns to files table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='filename') THEN
        ALTER TABLE files ADD COLUMN filename VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='original_filename') THEN
        ALTER TABLE files ADD COLUMN original_filename VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='file_url') THEN
        ALTER TABLE files ADD COLUMN file_url TEXT;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='mime_type') THEN
        ALTER TABLE files ADD COLUMN mime_type VARCHAR(100);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='folder_id') THEN
        ALTER TABLE files ADD COLUMN folder_id INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='ai_summary') THEN
        ALTER TABLE files ADD COLUMN ai_summary TEXT;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='ai_keywords') THEN
        ALTER TABLE files ADD COLUMN ai_keywords TEXT[];
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='ai_category') THEN
        ALTER TABLE files ADD COLUMN ai_category VARCHAR(100);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='ai_priority') THEN
        ALTER TABLE files ADD COLUMN ai_priority VARCHAR(50);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='ai_suggested_tags') THEN
        ALTER TABLE files ADD COLUMN ai_suggested_tags TEXT[];
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='ai_confidence') THEN
        ALTER TABLE files ADD COLUMN ai_confidence DECIMAL(5,2);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='ai_content_analysis') THEN
        ALTER TABLE files ADD COLUMN ai_content_analysis JSONB;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='user_tags') THEN
        ALTER TABLE files ADD COLUMN user_tags TEXT[];
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='user_description') THEN
        ALTER TABLE files ADD COLUMN user_description TEXT;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='is_favorite') THEN
        ALTER TABLE files ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='upload_status') THEN
        ALTER TABLE files ADD COLUMN upload_status VARCHAR(50) DEFAULT 'completed';
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='is_deleted') THEN
        ALTER TABLE files ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='deleted_at') THEN
        ALTER TABLE files ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update existing files to have proper values
UPDATE files SET 
    filename = file_name,
    original_filename = file_name,
    mime_type = file_type,
    upload_status = 'completed',
    is_deleted = false
WHERE filename IS NULL;

-- Verify the columns exist
SELECT 'Files table columns after fix:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'files'
ORDER BY column_name;

SELECT 'Fix completed successfully!' as status;