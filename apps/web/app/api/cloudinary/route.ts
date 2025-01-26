import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Function to calculate the greatest common divisor (GCD)
const gcd = (a: number, b: number): number => {
  if (b === 0) return a;
  return gcd(b, a % b);
};

// Function to normalize the aspect ratio (e.g., 1068:672.875 -> 16:9)
const normalizeAspectRatio = (aspectRatio: string): string => {
  if (!aspectRatio) return "16:9"; // Default aspect ratio

  const [width, height] = aspectRatio.split(":").map(Number);
  if (isNaN(width) || isNaN(height)) return "16:9"; // Fallback to default if invalid

  const divisor = gcd(width, height);
  const normalizedWidth = Math.round(width / divisor);
  const normalizedHeight = Math.round(height / divisor);

  return `${normalizedWidth}:${normalizedHeight}`;
};

export async function POST(req: any) {
  try {
    const { image, fileType, aspectRatio } = await req.json();
    const resourceType = fileType === "video" ? "video" : "image";
    const defaultAspectRatio = fileType === "video" ? "16:9" : "16:9";

    // Normalize the aspect ratio
    const normalizedAspectRatio = normalizeAspectRatio(aspectRatio || defaultAspectRatio);
    console.log("Normalized Aspect Ratio:", normalizedAspectRatio);

    const transformations = [
      {
        aspect_ratio: normalizedAspectRatio, // Use the normalized aspect ratio
        crop: "fill",
      },
    ];

    // Define the upload function inside POST request
    const uploadCloudinary = async (image: any) => {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "uploads",
        resource_type: resourceType,
        transformation: transformations,
      });
      return uploadResult;
    };

    // Check if `image` is an array (multiple images)
    const uploadedImages = [];
    if (image.length > 1) {
      for (const img of image) {
        const uploadResult = await uploadCloudinary(img.src);
        uploadedImages.push(uploadResult.url);
      }
    } else {
      // Handle a single image
      const uploadResult = await uploadCloudinary(image[0].src);
      uploadedImages.push(uploadResult.url);
    }

    console.log("Uploaded Images:", uploadedImages);
    return new Response(JSON.stringify({ status: 200, uploadedImages, success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ msg: error || "Upload failed" }), {
      status: 500,
    });
  }
}

export const GET = () => {
  return new Response("Method GET not supported for this endpoint", {
    status: 405,
  });
};