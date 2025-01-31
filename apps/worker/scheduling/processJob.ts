// apps/worker/src/scheduling/processJob.ts
import { User } from "@database/database";

// Helper function for Instagram processing
const getIgId = async (email: string, platforms: any[]) => {
  try {
    console.log(`Fetching Instagram ID for ${email}`);
    const user = await User.findOne({ email });
    if (!user) throw new Error(`User ${email} not found`);

    for (const element of platforms) {
      if (element.name.toLowerCase() === 'instagram') {
        for (const account of element.account) {
          const instagramAccount = user.socialAccounts?.find(
            (acc: any) => 
              acc.socialName.toLowerCase() === 'instagram' && 
              acc.accounts === account
          );
          
          if (instagramAccount) {
            console.log(`Found Instagram account ${account} for ${email}`);
            return {
              token: instagramAccount.accessToken,
              igId: instagramAccount.accountsId
            };
          }
        }
      }
    }
    throw new Error('No matching Instagram account found');
  } catch (error) {
    console.error('Error in getIgId:', error);
    throw error;
  }
};

// Instagram posting logic
const postInstagram = async (
  igId: string,
  token: string,
  formData: { image?: string[]; video?: string; description: string },
  mediaType: 'image' | 'video'
) => {
  try {
    console.log(`Starting Instagram post for ${igId}`);
    
    if (mediaType === 'image') {
      return await handleImagePost(igId, token, formData);
    }
    if (mediaType === 'video') {
      return await handleVideoPost(igId, token, formData);
    }
    throw new Error(`Invalid media type: ${mediaType}`);
  } catch (error) {
    console.error('Error in postInstagram:', error);
    throw error;
  }
};

// Image handling
const handleImagePost = async (igId: string, token: string, formData: any) => {
  if (!formData.image?.length) throw new Error('No images provided');
  
  if (formData.image.length === 1) {
    return await postSingleImage(igId, token, formData);
  }
  return await postCarousel(igId, token, formData);
};

// Single image post
const postSingleImage = async (igId: string, token: string, formData: any) => {
  const mediaPayload = `image_url=${formData.image[0]}&caption=${encodeURIComponent(formData.description)}`;
  
  const createRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!createRes.ok) {
    const error = await createRes.text();
    throw new Error(`Instagram API error: ${error}`);
  }

  const { id } = await createRes.json();
  console.log(`Created media container ${id}`);

  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${id}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );

  if (!publishRes.ok) {
    const error = await publishRes.text();
    throw new Error(`Publish error: ${error}`);
  }

  console.log(`Published media ${id}`);
};

// Carousel post
const postCarousel = async (igId: string, token: string, formData: any) => {
  const containerIds = [];
  
  for (const imageUrl of formData.image!) {
    const mediaPayload = `image_url=${imageUrl}&is_carousel_item=true`;
    const createRes = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
    );

    if (!createRes.ok) {
      const error = await createRes.text();
      throw new Error(`Carousel item error: ${error}`);
    }

    const { id } = await createRes.json();
    containerIds.push(id);
    console.log(`Created carousel item ${id}`);
  }

  const carouselRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media?media_type=CAROUSEL&children=${containerIds.join(',')}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );

  if (!carouselRes.ok) {
    const error = await carouselRes.text();
    throw new Error(`Carousel creation error: ${error}`);
  }

  const { id: carouselId } = await carouselRes.json();
  console.log(`Created carousel ${carouselId}`);

  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${carouselId}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );

  if (!publishRes.ok) {
    const error = await publishRes.text();
    throw new Error(`Carousel publish error: ${error}`);
  }

  console.log(`Published carousel ${carouselId}`);
};

// Video handling
const handleVideoPost = async (igId: string, token: string, formData: any) => {
  if (!formData.image?.[0]) throw new Error('No video URL provided');
  
  const mediaPayload = `video_url=${formData.image[0]}&caption=${encodeURIComponent(formData.description)}`;
  
  const createRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );

  if (!createRes.ok) {
    const error = await createRes.text();
    throw new Error(`Video creation error: ${error}`);
  }

  const { id } = await createRes.json();
  console.log(`Created video container ${id}`);

  // Wait for video processing
  await waitForVideoProcessing(id, token);
  
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${id}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );

  if (!publishRes.ok) {
    const error = await publishRes.text();
    throw new Error(`Video publish error: ${error}`);
  }

  console.log(`Published video ${id}`);
};

const waitForVideoProcessing = async (containerId: string, token: string) => {
  const maxAttempts = 30;
  const delay = 10000; // 10 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!statusRes.ok) {
      const error = await statusRes.text();
      throw new Error(`Status check failed: ${error}`);
    }

    const { status_code } = await statusRes.json();
    console.log(`Video status (attempt ${attempt}): ${status_code}`);

    if (status_code === 'FINISHED') return;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  throw new Error('Video processing timeout');
};

// Main job processor
export const processJob = async (job: any) => {
  console.log(`Starting job ${job.id}`, JSON.stringify(job.data, null, 2));

  try {
    const user = await User.findOne({ email: job.data.email });
    if (!user) throw new Error(`User ${job.data.email} not found`);

    for (const platform of job.data.formData.platforms) {
      console.log(`Processing ${platform.name} platform`);
      
      switch (platform.name.toLowerCase()) {
        case 'instagram':
          const igData = await getIgId(job.data.email, job.data.formData.platforms);
          if (igData.igId && igData.token) {
            await postInstagram(igData.igId, igData.token, job.data.formData, job.data.mediaType);
          } else {
            throw new Error('Invalid Instagram data');
          }
          break;

        case 'linkedin':
          // Implement LinkedIn logic
          break;

        case 'youtube':
          // Implement YouTube logic
          break;

        default:
          console.warn(`Unsupported platform: ${platform.name}`);
      }
    }

    console.log(`Completed job ${job.id} successfully`);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    throw error; // Ensure failure is propagated to BullMQ
  }
};