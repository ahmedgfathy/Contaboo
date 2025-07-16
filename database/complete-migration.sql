-- Real Estate Chat Application - Complete Database Migration
-- This script creates the structured_properties table and updates existing schema

-- Step 1: Create structured_properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS structured_properties (
  id SERIAL PRIMARY KEY,
  purpose TEXT CHECK (purpose IN ('sale', 'rent', 'wanted', 'unknown')),
  area TEXT,
  price DECIMAL(15,2),
  description TEXT,
  broker_name TEXT,
  broker_mobile TEXT CHECK (broker_mobile ~ '^(\+?2?01[0-2,5]{1}[0-9]{8})$'),
  source_message_id INTEGER REFERENCES chat_messages(id),
  property_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Add missing columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS purpose TEXT,
ADD COLUMN IF NOT EXISTS area TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS broker_name TEXT,
ADD COLUMN IF NOT EXISTS broker_mobile TEXT;

-- Step 3: Update data types for better performance
ALTER TABLE chat_messages 
ALTER COLUMN created_at TYPE TIMESTAMP USING created_at::timestamp,
ALTER COLUMN updated_at TYPE TIMESTAMP USING updated_at::timestamp;

-- Step 4: Add constraints and indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_purpose ON chat_messages(purpose);
CREATE INDEX IF NOT EXISTS idx_chat_messages_area ON chat_messages(area);
CREATE INDEX IF NOT EXISTS idx_chat_messages_price ON chat_messages(price);
CREATE INDEX IF NOT EXISTS idx_chat_messages_broker_mobile ON chat_messages(broker_mobile);

CREATE INDEX IF NOT EXISTS idx_structured_properties_purpose ON structured_properties(purpose);
CREATE INDEX IF NOT EXISTS idx_structured_properties_area ON structured_properties(area);
CREATE INDEX IF NOT EXISTS idx_structured_properties_price ON structured_properties(price);

-- Step 5: Create function to extract structured data from messages
CREATE OR REPLACE FUNCTION extract_structured_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract purpose using regex patterns
  NEW.purpose := CASE
    WHEN NEW.message_text ~* '\b(for sale|to sell|offered|متاح|للبيع)\b' THEN 'sale'
    WHEN NEW.message_text ~* '\b(for rent|to rent|للإيجار)\b' THEN 'rent'
    WHEN NEW.message_text ~* '\b(required|want|need|مطلوب|أريد|أحتاج)\b' THEN 'wanted'
    ELSE 'unknown'
  END;
  
  -- Extract area
  NEW.area := (
    SELECT substring(NEW.message_text FROM '\b(New Cairo|6th October|Zayed|Nasr City|Maadi|Heliopolis|Tagamoa|Downtown|القاهرة الجديدة|أكتوبر|الشيخ زايد|مدينة نصر|المعادي|مصر الجديدة|التجمع|وسط البلد)\b')
  );
  
  -- Extract price
  NEW.price := (
    SELECT CAST(regexp_replace(
      substring(NEW.message_text FROM '(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'),
      '[,]', '', 'g'
    ) AS DECIMAL(15,2))
    WHERE NEW.message_text ~ '\d{4,}'
  );
  
  -- Extract broker mobile
  NEW.broker_mobile := (
    SELECT substring(NEW.message_text FROM '(\+?2?01[0-2,5]{1}[0-9]{8})')
  );
  
  -- Extract broker name
  NEW.broker_name := (
    SELECT substring(NEW.message_text FROM '\b(Mr\.?\s\w+|Eng\.?\s\w+|Dr\.?\s\w+|[A-Z][a-z]+\s[A-Z][a-z]+)\b')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to auto-extract data on insert/update
DROP TRIGGER IF EXISTS extract_data_trigger ON chat_messages;
CREATE TRIGGER extract_data_trigger
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION extract_structured_data();

-- Step 7: Backfill existing data
UPDATE chat_messages SET message_text = message_text WHERE id IS NOT NULL;

-- Step 8: Create view for easy querying
CREATE OR REPLACE VIEW real_estate_analytics AS
SELECT 
  cm.id,
  cm.message_text,
  cm.purpose,
  cm.area,
  cm.price,
  cm.description,
  cm.broker_name,
  cm.broker_mobile,
  cm.property_type,
  cm.created_at,
  CASE 
    WHEN cm.price < 1000000 THEN 'low'
    WHEN cm.price < 5000000 THEN 'medium'
    ELSE 'high'
  END as price_range
FROM chat_messages cm
WHERE cm.purpose IS NOT NULL;

COMMIT;
