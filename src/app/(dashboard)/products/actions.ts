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

  // --- CHECK LIMITS with Security Check ---
  const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils');
  const subscription = await checkAndDowngradeSubscription(user.id);

  if (!subscription) return { success: false, message: "Subscription record missing" };

  const { PLAN_LIMITS } = await import('@/config/pricing');
  const planData = subscription.plan;
  const planNameRaw = (Array.isArray(planData) ? planData[0]?.name : planData?.name)?.toLowerCase() || 'free';
  const planKey = (Object.keys(PLAN_LIMITS).includes(planNameRaw) ? planNameRaw : 'free') as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planKey];

  // 1. Check Product Count Limit
  if (limits.products !== Infinity) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count || 0) >= limits.products) {
      console.log(`[SECURITY] Product limit reached for user ${user.id}: ${count}/${limits.products}`);
      return {
        success: false,
        message: `You've reached your limit of ${limits.products} products on the ${planKey} plan. Upgrade to add more!`,
      };
    }
  }

  const valid = ProductSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!valid.success) {
    console.error("Validation error during product creation:", valid.error.flatten());
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
    if (uploadedCount >= maxImages) {
      console.log(`[SECURITY] Max images (${maxImages}) reached for product creation. Skipping image_${i}.`);
      break;
    }

    const file = formData.get(`image_${i}`) as File | null;
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop();
    const name = `${user.id}/${Date.now()}-${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(name, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(name);
      imageUrls.push(data.publicUrl);
      uploadedCount++;
    } else {
      console.error(`[STORAGE] Image upload failed for image_${i}:`, uploadError.message);
    }
  }

  // --- insert product ---
  const { error } = await supabase.from("products").insert({
    ...input,
    user_id: user.id,
    image_url: imageUrls[0] || null,
    images: imageUrls.length ? imageUrls : null,
  });

  if (error) {
    console.error("Database error creating product:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Product created successfully" };
}


// ⛳ UPDATE PRODUCT
export async function updateProduct(prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated" };

  // --- SECURITY CHECK ---
  const { checkAndDowngradeSubscription } = await import('@/lib/subscription-utils');
  const subscription = await checkAndDowngradeSubscription(user.id);

  if (!subscription) return { success: false, message: "Subscription record missing" };

  const { PLAN_LIMITS } = await import('@/config/pricing');
  const planData = subscription.plan;
  const planNameRaw = (Array.isArray(planData) ? planData[0]?.name : planData?.name)?.toLowerCase() || 'free';
  const planKey = (Object.keys(PLAN_LIMITS).includes(planNameRaw) ? planNameRaw : 'free') as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planKey];

  const ProductUpdateSchema = ProductSchema.extend({
    id: z.string().uuid(),
  });

  const valid = ProductUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!valid.success) {
    console.error("Validation error during product update:", valid.error.flatten());
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

    const { error: uploadError } = await supabase.storage.from("product-images").upload(name, file);
    if (uploadError) {
      console.error("[STORAGE] Image upload failed during product update:", uploadError.message);
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(name);
      image_url = data.publicUrl;
    }
  }

  const { error } = await supabase
    .from("products")
    .update({ ...input, ...(image_url ? { image_url } : {}) })
    .eq("id", id);

  if (error) {
    console.error("Database error updating product:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Product updated" };
}
