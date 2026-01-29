"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(3),
  cost_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  category: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  stock_quantity: z.coerce.number().min(0),
  stock_status: z.enum(["in_stock", "low_stock", "out_of_stock"]),
});

export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// ⛳ CREATE PRODUCT
// ⛳ CREATE PRODUCT
export async function createProduct(prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated" };

  // --- CHECK LIMITS ---
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan:subscription_plans(name)')
    .eq('user_id', user.id)
    .single();

  const { PLAN_LIMITS } = await import('@/config/pricing');
  // Handle potential nested array from Supabase join
  const planData = subscription?.plan;
  // @ts-expect-error - Plan data structure can vary
  const planName = (Array.isArray(planData) ? planData[0]?.name : planData?.name);
  const planNameRaw = planName?.toLowerCase() || 'free';
  const planKey = (Object.keys(PLAN_LIMITS).includes(planNameRaw) ? planNameRaw : 'free') as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planKey];

  // 1. Check Product Count Limit
  if (limits.products !== Infinity) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count || 0) >= limits.products) {
      return {
        success: false,
        message: `You've reached your limit of ${limits.products} products on the ${planKey} plan. Upgrade to add more!`,
      };
    }
  }

  const valid = ProductSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!valid.success) {
    return {
      success: false,
      message: "Invalid form data",
      errors: valid.error.flatten().fieldErrors,
    };
  }

  const input = valid.data;

  // ---- upload images ----
  const imageUrls: string[] = [];
  const maxImages = limits.productImages; // Limit based on plan

  // Iterate up to a reasonable max number of potential file inputs (e.g. 10)
  // But ONLY process up to maxImages valid files.
  let uploadedCount = 0;

  // We'll check indices 0 to 9 (assuming frontend sends image_0, image_1...)
  // But strictly stop once we have `maxImages` successful uploads.
  for (let i = 0; i < 10; i++) {
    if (uploadedCount >= maxImages) break;

    const file = formData.get(`image_${i}`) as File | null;
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop();
    const name = `${user.id}/${Date.now()}-${i}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(name, file);

    if (!error) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(name);
      imageUrls.push(data.publicUrl);
      uploadedCount++;
    }
  }

  // --- insert product ---
  const { error } = await supabase.from("products").insert({
    ...input,
    user_id: user.id,
    image_url: imageUrls[0] || null,
    images: imageUrls.length ? imageUrls : null,
  });

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Product created successfully" };
}


// ⛳ UPDATE PRODUCT
export async function updateProduct(prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated" };

  const ProductUpdateSchema = ProductSchema.extend({
    id: z.string().uuid(),
  });

  const valid = ProductUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!valid.success) {
    return {
      success: false,
      message: "Invalid form data",
      errors: valid.error.flatten().fieldErrors,
    };
  }

  const { id, ...input } = valid.data;

  let image_url = null;

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const name = `${user.id}/${Date.now()}.${ext}`;

    await supabase.storage.from("product-images").upload(name, file);
    const { data } = supabase.storage.from("product-images").getPublicUrl(name);
    image_url = data.publicUrl;
  }

  const { error } = await supabase
    .from("products")
    .update({ ...input, ...(image_url ? { image_url } : {}) })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Product updated" };
}
