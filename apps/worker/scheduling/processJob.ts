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
    console.log("media - type", mediaType);
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
const handleVideoPost = async (igId: string, token: string, formData: any) => {4
  console.log("inside the handle video post");
  if (!formData.image?.[0]) throw new Error("No video URL provided");

  const mediaPayload = new FormData();
  mediaPayload.append("video_url", formData.image[0]);
  mediaPayload.append("caption", formData.description);

  const createRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
    { 
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  // console.log("createRes", createRes);
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
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
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
// const handleVideoPost = async (igId: string, token: string, formData: any) => {
//   if (!formData.video) throw new Error('No video URL provided');
//    const mediaUrl = formData.image || [];
//   const   mediaPayload = `video_url=${mediaUrl}&caption=${encodeURIComponent(formData.description)}&media_type=REELS`;
//   const res = await fetch(
//     `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
//     { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
//   );
//   const val = await res.json() as { id: string };
//       containerResponse.push(val.id);
//       // step 2 publish container
//       const checkMediaStatus = async (containerId: string) => {
//         let statusCode;
//         let attempts = 0;
//         const maxAttempts = 10; // Increased the number of attempts
//         const retryDelay = 10000; // 10 seconds between each retry
  
//         while (attempts < maxAttempts) {
//           const statusResponse = await fetch(
//             `https://graph.facebook.com/v21.0/${containerId}?fields=status_code`,
//             {
//               method: 'GET',
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );
  
//           const statusData = await statusResponse.json();
//           statusCode = (statusData as { status_code: string }).status_code;
  
//           if (statusCode === 'FINISHED') {
//             console.log('Media is ready to be published');
//             break; // Media is ready, break out of the loop
//           }
  
//           attempts++;
//           console.log(`Waiting for media to be ready... Attempt ${attempts}/${maxAttempts}`);
//           await new Promise(resolve => setTimeout(resolve, retryDelay)); // Wait 10 seconds before retrying
//         }
  
//         if (statusCode !== 'FINISHED') {
//           throw new Error('Media not ready after multiple attempts');
//         }
//       };
//       await checkMediaStatus(val.id);
//       const publishContainer = await fetch(
//         `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${val.id}`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const publishData = await publishContainer.json();
//       if((publishData as { id: string }).id)
//         {
//           console.log('Media published successfully');
//         }
//         else{
//           throw new Error('Invalid mediaType. Use "image" or "video".');
//         }
  
// }
const getToken = async (existedUser: any, platforms: { name: string; account: string[] }[]) => {
  if (!existedUser) {
    return;
  }
 

  for (const account of platforms) {
    // console.log("inside for loop and account", account);

    if (existedUser.socialAccounts) {
      // console.log("existedUser.socialAccounts", existedUser.socialAccounts);

      const linkedinAccount = existedUser.socialAccounts.find(
        (acc: any) => acc.socialName.toLowerCase() === 'linkedin' && acc.accounts === account.account[0]
      );

      if (linkedinAccount) {
        return {
          token: linkedinAccount.accessToken,
          userData: existedUser,
          accountsId: linkedinAccount.accountsId
        };
      } else {
        console.log(`LinkedIn account ${account.account[0]} not found for user`);
        return null;
      }
    }
  }
};

const step1 = async (accountsId: any, token: any, images: string[]) => {
  const assets = [];
  console.log("inside step1", accountsId, token, images);

  for (const image of images) {
    const response = await fetch(`https://api.linkedin.com/v2/assets?action=registerUpload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        registerUploadRequest: {
          owner: `urn:li:person:${accountsId}`,
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
          // Include the image URL in the request
          mediaUrl: image, // Add this line
        },
      }),
    });

    const data = await response.json();
    console.log("Registered asset for image:", image, data);

    if (data.value && data.value.asset) {
      assets.push(data.value.asset); // Collect the asset for each image
    } else {
      console.error("Failed to register asset for image:", image, data);
    }
  }

  return assets; // Return an array of assets
};
const step2 = async (assets: any[], token: any, formData: any, accountsId: any, images: string[]) => {
  // Upload each image
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const imageUrl = images[i]; // Get the corresponding image URL

    const url = asset.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const imageResponse = await fetch(imageUrl); // Fetch the image from the URL
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'media-type-family': 'STILLIMAGE',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'image/png', // Adjust based on the image type
      },
      body: imageArrayBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    console.log("Uploaded image:", imageUrl);
  }

  // Post the carousel
  try {
    const post = await fetch(`https://api.linkedin.com/v2/ugcPosts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        author: `urn:li:person:${accountsId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: formData.description,
            },
            shareMediaCategory: 'CAROUSEL', // Use CAROUSEL for multiple images
            media: assets.map((asset, index) => ({
              status: 'READY',
              description: {
                text: formData.description,
              },
              media: `urn:li:digitalmediaAsset:${asset.asset}`, // Use the asset ID
              originalUrl: images[index], // Include the original image URL
            })),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    const postData = await post.json();
    console.log('This is the post data', postData);

    if (postData) {
      return { success: true };
    }
  } catch (error) {
    console.error('Error posting carousel:', error);
    return { success: false };
  }
};
// Main job processor
export const processJob = async (job: any) => {
  console.log(`Starting job ${job.id}`, JSON.stringify(job.data, null, 2));
  try {
    const user = await User.findOne({ email: job.data.email });
    if (!user) throw new Error(`User ${job.data.email} not found`);
      console.log(job.data.formData.platforms);
    for (const platform of job.data.formData.platforms) {
      console.log(`Processing ${platform.name.toLowerCase()} platform ->>>`);
      
      if (platform.name.toLowerCase() === 'instagram') {
        console.log("inside instagram");
          const igData = await getIgId(job.data.email, job.data.formData.platforms);
          if (igData.igId && igData.token) {
            await postInstagram(igData.igId, igData.token, job.data.formData, job.data.mediaType);
          } else {
            throw new Error('Invalid Instagram data');
          }
        }
         if(platform.name.toLowerCase() === 'linkedin')
        {
          console.log("inside linkdln")
          const data = await getToken(user, job.data.formData.platforms);
          const step1Res =  await step1(data?.accountsId, data?.token,job.data.formData.image);
          const step2Res = await step2(step1Res, data?.token, job.data.formData,data?.accountsId,job.data.formData.image);
          if (step2Res) {
            const resLinkdln = step2Res;
            if (resLinkdln) {
              console.log("Post Sucess");
            }
          } else {
            console.error('step2Res is undefined');
          }
         
        }
          console.log(`Completed job ${job.id} successfully`);
      }
    
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    throw error; // Ensure failure is propagated to BullMQ
  }
};