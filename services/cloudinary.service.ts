import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Cloudinary config (env ထဲမှာ ထည့်ထားသင့်ပါတယ်)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary သို့ Upload တင်ရန်
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder = "schools",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Cloudinary ဆီသို့ Stream ဖြင့် တင်ရန် Upload Stream ကို ဖန်တီးခြင်း
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url); // အောင်မြင်သွားပါက Cloudinary ပေးလိုက်တဲ့ Image URL ကို ပြန်ပေးသည်
      },
    );
    // RAM ထဲက Buffer ကို Stream အဖြစ်ပြောင်းပြီး Cloudinary ဆီ ပို့သည်
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) return;
    const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
    const match = imageUrl.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      //   console.log("Extracted publicId for deletion:", publicId);

      await cloudinary.uploader.destroy(publicId);
      //   console.log("Cloudinary delete result:", result);
    } else {
      console.warn("Could not extract publicId from Cloudinary URL:", imageUrl);
    }
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
  }
};
