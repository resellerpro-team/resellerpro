-- Migration: Create WhatsApp Template Customizations Table
-- Date: 2026-01-21
-- Description: Allows users to customize WhatsApp message templates

-- Create table for custom template storage
CREATE TABLE IF NOT EXISTS whatsapp_template_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('order_confirmation', 'payment_reminder', 'shipped_update', 'delivered_confirmation', 'follow_up')),
  custom_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_template_customizations_user 
  ON whatsapp_template_customizations(user_id);

CREATE INDEX IF NOT EXISTS idx_template_customizations_active 
  ON whatsapp_template_customizations(user_id, is_active);

-- Enable Row Level Security
ALTER TABLE whatsapp_template_customizations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own templates
CREATE POLICY "Users can view own templates"
  ON whatsapp_template_customizations
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own templates
CREATE POLICY "Users can insert own templates"
  ON whatsapp_template_customizations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON whatsapp_template_customizations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON whatsapp_template_customizations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_whatsapp_template_timestamp
  BEFORE UPDATE ON whatsapp_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_template_timestamp();
