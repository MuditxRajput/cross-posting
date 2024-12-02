import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST(req:any) {
  try {
    const { image } = await req.json(); 
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'uploads',
    });
    return new Response(JSON.stringify({ url: uploadResult.secure_url }), {
      status: 200,
    });
  } catch (error) {
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
