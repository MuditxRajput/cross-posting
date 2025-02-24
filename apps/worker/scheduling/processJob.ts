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
  const mediaUrl = [formData.image[0]];
  console.log("mediaUrl", mediaUrl);
  const mediaPayload = `video_url=${mediaUrl}&caption=${encodeURIComponent(formData.description)}&media_type=REELS`;
  console.log("mediaPayload", mediaPayload);
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

const step1 = async (accountsId:any, token:any, mediaUrl:any, mediaType:any) => {
  // Validate mediaType
  const validMediaTypes = ['IMAGE', 'VIDEO'];
  if (!validMediaTypes.includes(mediaType.toUpperCase())) {
    throw new Error(`Invalid mediaType: ${mediaType}. Must be one of ${validMediaTypes.join(', ')}`);
  }

  // Register the upload
  const response = await fetch(`https://api.linkedin.com/v2/assets?action=registerUpload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      registerUploadRequest: {
        owner: `urn:li:person:${accountsId}`,
        recipes: [`urn:li:digitalmediaRecipe:feedshare-${mediaType}`],
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to register upload: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  console.log("Registered asset for media:", mediaUrl, data);

  if (data.value && data.value.asset) {
    return data.value; // Return the asset
  } else {
    throw new Error("Failed to register asset:", data);
  }
};

const step2 = async (asset:any, token:any, formData:any, accountsId:any, mediaUrl:any, mediaType:any) => {
  const url = asset.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  console.log("Upload URL:", url);

  // Fetch the media file
  const mediaResponse = await fetch(mediaUrl);
  if (!mediaResponse.ok) {
    throw new Error(`Failed to fetch media: ${mediaResponse.statusText}`);
  }

  const mediaArrayBuffer = await mediaResponse.arrayBuffer();
  // const fileType = mediaUrl.split('.').pop().toLowerCase();
  // const contentType = fileType === 'mp4' ? 'video/mp4' : `image/${fileType}`;

  const uploadHeaders: { [key: string]: string } = {
    'Authorization': `Bearer ${token}`,
    // 'Content-Type': contentType,
  };

  if (mediaType.toUpperCase() === 'VIDEO') {
    uploadHeaders['media-type-family'] = 'VIDEO';
  }

  // Upload the media file
  const uploadResponse = await fetch(url, {
    method: 'PUT',
    headers: uploadHeaders,
    body: mediaArrayBuffer,
  });

  console.log("Upload response status:", uploadResponse.status);
  console.log("Upload response headers:", uploadResponse.headers);

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload media: ${uploadResponse.statusText}`);
  }

  console.log("Uploaded media:", mediaUrl);

  // Wait for the asset to be processed
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds

  try {
    // Create the post
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
            shareMediaCategory: `${mediaType}`.toUpperCase(), // Set to IMAGE or VIDEO
            media: [
              {
                status: 'READY',
                description: {
                  text: formData.description,
                },
                media: `${asset.asset}`,
                // originalUrl: mediaUrl, // Use the media URL
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    const postData = await post.json();
    console.log('Post data:', postData);

    if (postData) {
      return { success: true };
    }
  } catch (error) {
    console.error('Error posting media:', error);
    return { success: false };
  }
};
const registerVideoUpload = async (accountsId: any, token: any, videoUrl: string) => {
  console.log("Inside registerVideoUpload", accountsId, token, videoUrl);

  // Fetch the video file to get its size
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
  }
  const videoBlob = await videoResponse.blob();
  const fileSizeBytes = videoBlob.size;

  const response = await fetch(`https://api.linkedin.com/rest/videos?action=initializeUpload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0', // Required for LinkedIn API
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: `urn:li:person:${accountsId}`, // Use `urn:li:organization:<org-id>` for organizations
        fileSizeBytes: fileSizeBytes, // Add file size
        uploadCaptions: true,
        uploadThumbnail: false,
      },
    }),
  });

  const data = await response.json();
  console.log("Registered video upload:", data);

  if (data.value && data.value.uploadInstructions) {
    return {
      asset: data.value.video,
      uploadUrl: data.value.uploadInstructions[0].uploadUrl, // Use the first upload URL
    };
  } else {
    console.error("Failed to register video:", data);
    return null;
  }
};
const splitVideoFile = async (videoBlob: Blob) => {
  const chunkSize = 4 * 1024 * 1024; // 4MB
  const chunks = [];
  let start = 0;

  while (start < videoBlob.size) {
    const end = Math.min(start + chunkSize, videoBlob.size);
    const chunk = videoBlob.slice(start, end);
    chunks.push(chunk);
    start = end;
  }

  return chunks;
};
const uploadVideo = async (uploadUrl: string, token: string, videoUrl: string) => {
  console.log("Uploading video to LinkedIn...");
  console.log("uploadUrl", uploadUrl);
  console.log("videoUrl", videoUrl);

  // Fetch the video file
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
  }
  const videoBlob = await videoResponse.blob();

  // Split the video file into 4MB chunks
  const chunks = await splitVideoFile(videoBlob);

  // Upload each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkUploadUrl = `${uploadUrl}&partNumber=${i + 1}`; // Add part number to the URL

    const uploadResponse = await fetch(chunkUploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'video/mp4', // Ensure this matches your video type
      },
      body: chunk,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload video chunk ${i + 1}: ${uploadResponse.statusText}`);
    }

    console.log(`Uploaded chunk ${i + 1} of ${chunks.length}`);
  }

  console.log("Video uploaded successfully.");
  return true;
};

const finalizeVideoUpload = async (token: string, asset: string, chunks: Blob[]) => {
  console.log("Finalizing video upload...");

  const response = await fetch(`https://api.linkedin.com/rest/videos?action=finalizeUpload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0', // Required for LinkedIn API
    },
    body: JSON.stringify({
      finalizeUploadRequest: {
        video: asset, // Asset ID from step 1
        uploadToken: "", // Optional, if provided
        uploadedPartIds: Array.from({ length: chunks.length }, (_, i) => i + 1), // Array of part numbers
      },
    }),
  });

  const data = await response.json();
  console.log("Finalized video upload:", data);

  return data;
};
const publishVideoPost = async (accountsId: any, token: any, asset: string, formData: any) => {
  console.log("Publishing video post...");

  const postResponse = await fetch(`https://api.linkedin.com/v2/ugcPosts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0', // Required for LinkedIn API
    },
    body: JSON.stringify({
      author: `urn:li:person:${accountsId}`, // Use `urn:li:organization:<org-id>` for organizations
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: formData.description,
          },
          shareMediaCategory: 'VIDEO',
          media: [
            {
              status: 'READY',
              description: {
                text: formData.description,
              },
              media: asset, // Use the asset ID from step 1
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  const postData = await postResponse.json();
  console.log('Video post response:', postData);

  return postData;
};

// Main job processor
export const processJob = async (job: any) => {
  
  try {
    const user = await User.findOne({ email: job.data.email });
    if (!user) throw new Error(`User ${job.data.email} not found`);
    for (const platform of job.data.formData.platforms) {
      // console.log(`Processing ${platform.name.toLowerCase()} platform ->>>`);
      console.log("mediaType", job.data.mediaType);
      if (platform.name.toLowerCase() === 'instagram') {
        console.log("inside instagram");
          const igData = await getIgId(job.data.email, job.data.formData.platforms);
          if (igData.igId && igData.token) {
            await postInstagram(igData.igId, igData.token, job.data.formData, job.data.mediaType);
          } else {
            throw new Error('Invalid Instagram data');
          }
        }
        if (platform.name.toLowerCase() === 'linkedin') {
          const data = await getToken(user, job.data.formData.platforms);
          console.log("mediaType", job.data.mediaType);
          // if (job.data.mediaType === 'image') {
            console.log("Inside LinkedIn image upload");
            const step1Res = await step1(data?.accountsId, data?.token, job.data.formData.image,job.data.mediaType);
            const step2Res = await step2(step1Res, data?.token, job.data.formData, data?.accountsId, job.data.formData.image,job.data.mediaType);
            
            if (step2Res?.success) {
              console.log("Image post successful!");
            } else {
              console.error('Failed to upload image.');
            }
          // } 
          // else if (job.data.mediaType === 'video') {
          //   console.log("Inside LinkedIn video upload");
          
          //   // Step 1: Register Video Upload
          //   const videoData = await registerVideoUpload(data?.accountsId, data?.token, job.data.formData.image);
          //   if (!videoData) {
          //     console.error("Failed to register video upload.");
          //     return;
          //   }
          
          //   // Step 2: Upload Video
          //   const chunks = await splitVideoFile(await (await fetch(job.data.formData.image)).blob());
          //   const uploadSuccess = await uploadVideo(videoData.uploadUrl, data?.token, job.data.formData.image);
          //   if (!uploadSuccess) {
          //     console.error("Failed to upload video.");
          //     return;
          //   }
          
          //   // Step 3: Finalize Video Upload
          //   const finalizeResponse = await finalizeVideoUpload(data?.token, videoData.asset, chunks);
          //   if (!finalizeResponse) {
          //     console.error("Failed to finalize video upload.");
          //     return;
          //   }
          
          //   console.log("Video upload and finalization successful!");
          
          //   // Step 4: Publish Video Post (Optional)
          //   const videoPostResponse = await publishVideoPost(data?.accountsId, data?.token, videoData.asset, job.data.formData);
          
          //   if (videoPostResponse) {
          //     console.log("Video post successful!");
          //   } else {
          //     console.error("Failed to publish video post.");
          //   }
          // }
        }
        
          console.log(`Completed job ${job.id} successfully`);
      }
    
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    throw error; // Ensure failure is propagated to BullMQ
  }
};