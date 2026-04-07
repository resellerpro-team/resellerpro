CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  avatar_url text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at DESC);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view product reviews" ON public.product_reviews;
CREATE POLICY "Public can view product reviews"
  ON public.product_reviews
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert product reviews" ON public.product_reviews;
CREATE POLICY "Public can insert product reviews"
  ON public.product_reviews
  FOR INSERT
  WITH CHECK (
    rating >= 1
    AND rating <= 5
    AND length(trim(customer_name)) > 1
    AND length(trim(comment)) > 1
  );

DROP TRIGGER IF EXISTS handle_product_reviews_update ON public.product_reviews;
CREATE TRIGGER handle_product_reviews_update
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT ON TABLE public.product_reviews TO anon;
GRANT SELECT, INSERT ON TABLE public.product_reviews TO authenticated;
GRANT ALL ON TABLE public.product_reviews TO service_role;
