import { v2 as cloudinary } from 'cloudinary';

// 🧠 Configure Cloudinary
cloudinary.config({
  cloud_name: "ds8oexbm0",
  api_key: "956958491745124",
  api_secret: "dGtEDVtS_AFm3EXbxptYHYSbniw",
});

// Helper to upload image to Cloudinary
export async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'manageqr', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string });
      }
    );
    stream.end(buffer);
  });
}