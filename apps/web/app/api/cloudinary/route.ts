import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST(req:any) {
  try {
    const { image,fileType } = await req.json(); 
    console.log("file",image);
    console.log("type",fileType);
    
    
    const resourceType = fileType==='video' ? 'video' : 'image';
    console.log("resourceType",resourceType);
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'uploads',
      resource_type:resourceType,
      transformation: fileType ==='video'
      ?
      [{
        width :1200,height:720,crop :"fill"
      }] :
      [
        { aspect_ratio: "4:5", crop: "fill" },
      ]
    });
    console.log("uploadResult",uploadResult);
    
    return new Response(JSON.stringify({ url: uploadResult.secure_url }), {
      status: 200,
    });
  } catch (error) {
    console.log("upload error",error);
    
    return new Response(
      JSON.stringify({msg:error}),
      { status: 500 }
    );
  }
}

export const GET = () => {
  return new Response('Method GET not supported for this endpoint', {
    status: 405,
  });
};
