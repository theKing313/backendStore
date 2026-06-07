import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qhciwztvdpqqumcqkgfp.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoY2l3enR2ZHBxcXVtY3FrZ2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzNzU5NSwiZXhwIjoyMDk0MTEzNTk1fQ.AF3cRhtIvNuV2hSXHFc99zdCW95w_110JHHstfxwQyo";
const supabaseStorageBucket =
  process.env.SUPABASE_STORAGE_BUCKET ||
  process.env.SUPABASE_STORAGE ||
  "products";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in backend environment variables",
  );
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export const uploadController = {
  async upload(req, res) {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file provided" });

      const file = req.file; // multer memoryStorage -> buffer
      const fileExtension = file.originalname.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExtension}`;
      const filePath = `product-images/${fileName}`;

      console.log("[UploadController] uploading to Supabase:", {
        filePath,
        bucket: supabaseStorageBucket,
      });

      const { data, error } = await supabaseServer.storage
        .from(supabaseStorageBucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("[UploadController] Supabase upload error:", error);
        return res
          .status(500)
          .json({ message: error.message || "Upload failed", details: error });
      }

      const publicUrlResponse = await supabaseServer.storage
        .from(supabaseStorageBucket)
        .getPublicUrl(filePath);

      if (publicUrlResponse.error) {
        console.error(
          "[UploadController] getPublicUrl error:",
          publicUrlResponse.error,
        );
        return res
          .status(500)
          .json({ message: publicUrlResponse.error.message });
      }

      return res.status(201).json({ url: publicUrlResponse.data.publicUrl });
    } catch (err) {
      console.error("[UploadController] Unexpected error:", err);
      return res
        .status(500)
        .json({ message: err?.message || "Internal server error" });
    }
  },
};
