-- Function to deduct stock and return new quantity
CREATE OR REPLACE FUNCTION deduct_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_quantity INTEGER;
BEGIN
  -- Deduct stock
  UPDATE products
  SET 
    stock_quantity = stock_quantity - p_quantity,
    stock_status = CASE 
      WHEN stock_quantity - p_quantity <= 0 THEN 'out_of_stock'
      WHEN stock_quantity - p_quantity <= 5 THEN 'low_stock' -- Default threshold of 5
      ELSE 'in_stock'
    END,
    updated_at = NOW()
  WHERE id = p_product_id
  RETURNING stock_quantity INTO v_new_quantity;
  
  RETURN v_new_quantity;
END;
$$ LANGUAGE plpgsql;
