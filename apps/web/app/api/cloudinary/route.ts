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
    const defaultAspectRatio = fileType === "video" ? "16:9" : "4:5";
     console.log("image get in cloudinary",image);
     

    const transformations = [
      {
        aspect_ratio: aspectRatio || defaultAspectRatio,
        crop: "fill",
      },
    ];

    // Define the upload function inside POST request
    const uploadCloudinary = async (image: any) => {
      // Ensure the image is a valid URL or path, add validation here if needed
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "uploads",
        resource_type: resourceType,
        transformation: transformations,
      });

   
      return uploadResult;
    };

    // Check if `image` is an array (multiple images)
    const uploadedImages = [];
    if (image.length>1) {
      for (const img of image) {
        const uploadResult = await uploadCloudinary(img.src);
       
        uploadedImages.push( uploadResult.url);
      }
    } else {
      // Handle a single image
      const uploadResult = await uploadCloudinary(image[0].src);
     
      uploadedImages.push(uploadResult.url );
    }
    console.log("Upo",uploadedImages);
    return new Response(JSON.stringify({ status: 200, uploadedImages,success:true }), {
      status: 200,
    });
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
