import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const BUCKET_NAME = "stamp-cards";

export async function uploadStampCardImage(
  customerId: string,
  imageBlob: Blob
): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("Supabase no configurado, usando imagen local");
    return null;
  }

  const fileName = `stamp-cards/${customerId}/${Date.now()}.png`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, imageBlob, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("Error subiendo imagen:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function ensureBucketExists(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("Error listando buckets:", listError);
    return false;
  }

  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });

    if (createError) {
      console.error("Error creando bucket:", createError);
      return false;
    }
    console.log(`Bucket "${BUCKET_NAME}" creado exitosamente`);
  }

  return true;
}
