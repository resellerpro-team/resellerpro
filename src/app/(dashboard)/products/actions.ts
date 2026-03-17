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
  video_url: z.string().url().optional().or(z.literal('')),
  image_urls_json: z.string().optional(), // New field for client-side uploaded images
  audio_url: z.string().optional(),       // New field for client-side uploaded audio
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

  // ---- handle images ----
  let imageUrls: string[] = [];
  const maxImages = limits.productImages;

  // Use client-side uploaded URLs if provided
  if (input.image_urls_json) {
    try {
      imageUrls = JSON.parse(input.image_urls_json);
      console.log(`[STORAGE] Using ${imageUrls.length} client-side uploaded images`);
    } catch (e) {
      console.error("[STORAGE] Failed to parse image_urls_json");
    }
  }

  // Fallback / Supplemental: upload images from formData if client didn't upload or sent additional
  // (Though primarily we want client-side upload now)
  if (imageUrls.length === 0) {
    let uploadedCount = 0;
    for (let i = 0; i < 10; i++) {
        if (uploadedCount >= maxImages) break;
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
        }
    }
  }

  // ---- handle audio file ----
  let audioUrl: string | null = input.audio_url || null;

  if (!audioUrl) {
    const audioFile = formData.get('audio_file') as File | null;
    if (audioFile && audioFile.size > 0) {
        if (audioFile.size > 10 * 1024 * 1024) {
        return { success: false, message: "Audio file must be less than 10MB" };
        }
        const ext = audioFile.name.split(".").pop();
        const audioFileName = `${user.id}/audio-${Date.now()}.${ext}`;
        const { error: audioUploadError } = await supabase.storage
        .from("product-images")
        .upload(audioFileName, audioFile);
        if (!audioUploadError) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(audioFileName);
        audioUrl = data.publicUrl;
        }
    }
  }

  // --- insert product ---
  const { image_urls_json, audio_url: _unused_audio, ...dbInput } = input;
  const { error } = await supabase.from("products").insert({
    ...dbInput,
    video_url: dbInput.video_url || null,
    audio_url: audioUrl,
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
