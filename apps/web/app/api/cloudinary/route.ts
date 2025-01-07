import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST(req: any) {
  try {
    const { image, fileType } = await req.json();
    const resourceType = fileType === "video" ? "video" : "image";

    // Determine aspect ratio and transformation dynamically
    const transformations =
      fileType === "video"
        ? [
            {
              // Default to 16:9 if specific aspect ratio not provided
              aspect_ratio: "9:16",
              crop: "fill",
            },
          ]
        : [
            {
              aspect_ratio: "4:5", // Default for images
              crop: "fill",
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
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("upload error", error);

    return new Response(
      JSON.stringify({ msg: error || "Upload failed" }),
      { status: 500 }
    );
  }
}


export const GET = () => {
  return new Response('Method GET not supported for this endpoint', {
    status: 405,
  });
};
