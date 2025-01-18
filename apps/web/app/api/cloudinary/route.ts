import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST(req: any) {
  try {
    const { image, fileType, aspectRatio } = await req.json();
    const resourceType = fileType === "video" ? "video" : "image";

    // Set default aspect ratios if not provided
    const defaultAspectRatio = fileType === "video" ? "16:9" : "4:5";

    const transformations = [
      {
        aspect_ratio: aspectRatio || defaultAspectRatio, // Use provided or default
        crop: "fill", // Fill to match the aspect ratio
      },
    ];

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "uploads",
      resource_type: resourceType,
      transformation: transformations,
    });

    return new Response(
      JSON.stringify({
        url: uploadResult.secure_url,
        type: fileType,
        public_id: uploadResult.public_id,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Upload error:", error);

    return new Response(
      JSON.stringify({ msg: error || "Upload failed" }),
      { status: 500 }
    );
  }
}

export const GET = () => {
  return new Response("Method GET not supported for this endpoint", {
    status: 405,
  });
};
