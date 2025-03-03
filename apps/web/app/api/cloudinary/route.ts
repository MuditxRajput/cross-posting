import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Function to normalize the aspect ratio (e.g., 1068:672 -> 16:9)
const normalizeAspectRatio = (aspectRatio: string): string => {
  const supportedRatios = [
    { width: 1, height: 1 }, // 1:1
    { width: 4, height: 5 }, // 4:5
    { width: 16, height: 9 },
  ];

  const [width, height] = aspectRatio.split(":").map(Number);
  if (width === undefined || height === undefined || isNaN(width) || isNaN(height)) return "1:1"; // Default to square if invalid

  const inputRatio = width / height;

  // Find the closest supported aspect ratio
  const closest = supportedRatios.reduce((prev, curr) => {
    const prevDiff = Math.abs(inputRatio - prev.width / prev.height);
    const currDiff = Math.abs(inputRatio - curr.width / curr.height);
    return currDiff < prevDiff ? curr : prev;
  });

  return `${closest.width}:${closest.height}`;
};

export async function POST(req: any) {
  try {
    const { image, fileType, aspectRatio } = await req.json();
    const resourceType = fileType === "video" ? "video" : "image";
    const defaultAspectRatio = fileType === "video" ? "16:9" : "16:9";
      
    // Normalize the aspect ratio
    const normalizedAspectRatio = normalizeAspectRatio(aspectRatio || defaultAspectRatio);


    // Transformations to handle aspect ratio and resizing
    const transformations = [
      {
        aspect_ratio: normalizedAspectRatio,
        crop: "fill", // Resize and crop to fill the aspect ratio
        gravity: "auto", // Center the cropping on important content
      },
    ];

    // Upload function
    const uploadCloudinary = async (image: any) => {
      if (resourceType === "video") {
        return await cloudinary.uploader.upload_large(image, {
          folder: "uploads",
          resource_type: "video",
          chunk_size: 6000000, // 6MB chunk size
        });
      } else {
        return await cloudinary.uploader.upload(image, {
          folder: "uploads",
          resource_type: "image",
          transformation: transformations,
        });
      }
    };

    

    // Handle multiple or single image uploads
    const uploadedImages = [];
    if (Array.isArray(image)) {
      for (const img of image) {
        const uploadResult = await uploadCloudinary(img.src);
        uploadedImages.push(uploadResult.url);
      }
    } else {
      const uploadResult = await uploadCloudinary(image);
      uploadedImages.push(uploadResult.url);
    }

    return new Response(JSON.stringify({ status: 200, uploadedImages, success: true }), {
      status: 200,
    });
  } catch (error) {

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
