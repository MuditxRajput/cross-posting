import { User } from "@database/database";

const getIgId = async (email: string, platforms: any[]) => {
  try {
    
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    for(const element of platforms) {
      if (element.name.toLowerCase() === 'instagram') {
        for(const account of element.account) {
            if(user.socialAccounts)
            {
                const instagramAccount = user.socialAccounts.find((acc: any) => acc.socialName.toLowerCase() === 'instagram' && acc.accounts === account);
                if (instagramAccount) {
                  console.log(`Access Token for ${account}: ${instagramAccount.accountsId}`);
                  return {token : instagramAccount.accessToken, igId : instagramAccount.accountsId};
                } else {
                  console.log(`Instagram account ${account} not found for user ${email}`);
                }
            }
        };
      }
    };
    
  } catch (error) {
    console.error('Error fetching access token:', error);
  }
};
const postInstagram = async (
  igId: string,
  token: string,
  formData: { image?: string[]; video?: string; description: string },
  mediaType: 'image' | 'video'
) => {
  try {
    let mediaUrl: string[] = [];
    let mediaPayload = '';
    let containerResponse =[] ;
    // Handle Image or Video Media Type
    console.log(formData);
    
    
    if (mediaType === 'image') {
      // multiImage 
        if(formData.image?.length==1)
        {
          //creater container
          mediaUrl = [formData.image[0]];
          mediaPayload = `image_url=${mediaUrl[0]}&caption=${encodeURIComponent(formData.description)}`;
          const res = await fetch(
            `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
         
        
          const val = await res.json() as { id: string };
          // step 2 publish container
          console.log("val",val);
          
          const publishContainer = await fetch(
            `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${val.id}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          const publishData = await publishContainer.json();
          if((publishData as { id: string }).id)
          {
            console.log('Media published successfully');
          } 
        }
        else{
          // new api for more than 2 images...
    
          
          const mediaPayload = formData.image?.map((img) => {
            return `image_url=${img}&caption=${encodeURIComponent(formData.description)}`;
          });
    
          
          if(mediaPayload)
          {
            for(const url of mediaPayload)
            {
              // posting for each image for coursal 
              const res = await fetch(`https://graph.facebook.com/v21.0/${igId}/media?${url}&is_carousel_item=true`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              const val = await res.json() as { id: string };
              containerResponse.push(val.id);
            }
            
            // create carousel container...
            const carouselContainer = await fetch(
              `https://graph.facebook.com/v21.0/${igId}/media?media_type=CAROUSEL&children=${containerResponse.join(',')}`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const carouselData = await carouselContainer.json() as { id: string };
            
            if((carouselData as { id: string }).id)
            {
              // step 3 publish container
              const publishContainer = await fetch(
                `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${carouselData.id}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const publishData = await publishContainer.json();
              if((publishData as { id: string }).id)
              {
                console.log('Media published successfully');
              }
            }


          }

        }
    } else if (mediaType === 'video') {
      if (formData.image && formData.image.length > 0) {
        mediaUrl = [formData.image[0]]; // Make sure formData.video is used for video
      } else {
        throw new Error('formData.image is undefined or empty');
      }
      mediaPayload = `video_url=${mediaUrl}&caption=${encodeURIComponent(formData.description)}&media_type=REELS`;
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const val = await res.json() as { id: string };
      containerResponse.push(val.id);
      // step 2 publish container
      const checkMediaStatus = async (containerId: string) => {
        let statusCode;
        let attempts = 0;
        const maxAttempts = 10; // Increased the number of attempts
        const retryDelay = 10000; // 10 seconds between each retry
  
        while (attempts < maxAttempts) {
          const statusResponse = await fetch(
            `https://graph.facebook.com/v21.0/${containerId}?fields=status_code`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          const statusData = await statusResponse.json();
          statusCode = (statusData as { status_code: string }).status_code;
  
          if (statusCode === 'FINISHED') {
            console.log('Media is ready to be published');
            break; // Media is ready, break out of the loop
          }
  
          attempts++;
          console.log(`Waiting for media to be ready... Attempt ${attempts}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay)); // Wait 10 seconds before retrying
        }
  
        if (statusCode !== 'FINISHED') {
          throw new Error('Media not ready after multiple attempts');
        }
      };
      await checkMediaStatus(val.id);
      const publishContainer = await fetch(
        `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${val.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const publishData = await publishContainer.json();
      if((publishData as { id: string }).id)
      {
        console.log('Media published successfully');
      }
    } else {
      throw new Error('Invalid mediaType. Use "image" or "video".');
    }


    // Step 2: Check Media Status and Publish when Ready
    
    // Wait for the media to be ready before publishing
    // if (mediaType==='video' ) {
    //   await checkMediaStatus(containerResponse[0]);
    // } else {
    //   throw new Error('Container ID is undefined');
    // }

  } catch (error) {
    console.error('Error publishing media to Instagram:', error);
  }
};

 
const getToken = async (existedUser:any,platforms:string[]) => {
  // const existedUser = await User.findOne({email:email});
  if(!existedUser){
    return;
  }
  for(const account of platforms)
  {
    if(existedUser.socialAccounts)
    {
      const linkedinAccount = existedUser.socialAccounts.find((acc:any)=>acc.socialName.toLowerCase() === 'linkedin' && acc.accounts === account);
      if(linkedinAccount)
      {
        
        return {token : linkedinAccount.accessToken,userData :existedUser,accountsId:linkedinAccount.accountsId};
      }
      else
      {
        console.log(`Linkedin account ${account} not found for user `);
        return null;
      }
    }
  }
}
const step1 = async (accountsId:any,token:any) => {

  
  
    const response = await fetch(`https://api.linkedin.com/v2/assets?action=registerUpload`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      "registerUploadRequest": {
          "owner": `urn:li:person:${accountsId}`,
          "recipes": [
              "urn:li:digitalmediaRecipe:feedshare-image"
          ],
          "serviceRelationships": [
              {
                  "relationshipType": "OWNER",
                  "identifier": "urn:li:userGeneratedContent"
              }
          ]
      }
    })
  });
  const val = await response.json() as { value: { uploadMechanism: { "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": { uploadUrl: string } } } };
  console.log("This is the VAL",val);
  
  console.log("This is the VAL",val.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl);
  return val;
}
const step2 = async (data:any,token:any,formData:any,accountsId:any) => {
  const url = data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
  const assets = data.value.asset;
  console.log("This is the url",url);
  console.log("image",formData.image);
  const imageResponse = await fetch(formData.image);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
  }
  const imageArrayBuffer = await imageResponse.arrayBuffer();
const response = await fetch(url,{
    method: 'PUT',
    headers: {
      'media-type-family': 'STILLIMAGE',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'image/png'
  },
  body: imageArrayBuffer
});
// console.log("This is the VAL1",val1);
console.log("asset",assets);
console.log("urn",accountsId);

// const linkedinAccount = existedUser.socialAccounts.find((acc:any)=>acc.socialName.toLowerCase() === 'linkedin' && acc.accounts === 'linkedin');
if(response)
{
  try {
    const post = await fetch(`https://api.linkedin.com/v2/ugcPosts`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      'author': `urn:li:person:${accountsId}`,
      'lifecycleState': 'PUBLISHED',
      'specificContent': {
          'com.linkedin.ugc.ShareContent': {
              'shareCommentary': {
                  'text': formData.description
              },
              'shareMediaCategory': 'IMAGE',
              'media': [
                  {
                      'status': 'READY',
                      'description': {
                          'text': formData.description
                      },
                      'media': assets
                  }
              ]
  
          },
          
      },
      "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"  
          }
    })  
    });
    const postData = await post.json();
    console.log("This is the post data",postData);  
  if(postData)
  {
    console.log('Post created successfully');
  }
  } catch (error) {
    console.log(error);
    
  }
  
 
  
}
}
// const getYoutubeAccessToken =async(account :any,existedUser :any)=>{
//   try {
//       const sameAccountDetail = await existedUser.socialAccounts.find((acc:any)=>acc.socialName.toLowerCase()==="youtube");
//       console.log("->>>>",sameAccountDetail);
      
//       return sameAccountDetail.accessToken;
//   } catch (error) {
//     return error;
//   }
// }
// const youtubePosting = async (token: string, existedUser: any, formData: any) => {
//   try {
//     // Step 1: Download the video from Cloudinary using the video URL (formData.image)
//     const cloudinaryVideoUrl = formData.image;  // Cloudinary video URL from formData
//     const cloudinaryResponse = await fetch(cloudinaryVideoUrl);

//     if (!cloudinaryResponse.ok) {
//       throw new Error('Failed to download video from Cloudinary');
//     }

//     const videoBlob = await cloudinaryResponse.blob(); // Get video as Blob

//     // Step 2: Initiate Resumable Upload on YouTube
//     const initResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         snippet: {
         
//           description: formData.description,
//         },
//         status: {
//           privacyStatus:  'public',  // Can be 'public', 'private', or 'unlisted'
//         },
//       }),
//     });

//     if (!initResponse.ok) {
//       throw new Error('Failed to initiate upload');
//     }

//     const initData = await initResponse.json() as { uploadUrl: string, id: string };
//     const uploadUrl = initData.uploadUrl; // The URL for uploading the video file

//     // Step 3: Upload Video Data to YouTube
//     const chunkSize = 256 * 1024; // 256KB chunk size for video upload (adjust as needed)
//     let offset = 0;

//     // Upload in chunks
//     while (offset < videoBlob.size) {
//       const chunk = videoBlob.slice(offset, offset + chunkSize);
//       const chunkResponse = await fetch(uploadUrl, {
//         method: 'PUT',
//         headers: {
//           'Content-Length': chunk.size.toString(),
//           'Content-Range': `bytes ${offset}-${offset + chunk.size - 1}/${videoBlob.size}`,
//         },
//         body: chunk,
//       });

//       if (!chunkResponse.ok) {
//         throw new Error('Failed to upload video chunk');
//       }

//       offset += chunk.size; // Increment the offset for the next chunk
//     }

//     // Step 4: Publish the Video (if needed)
//     const publishResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${initData.id}`, {
//       method: 'PUT',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         snippet: {
//           description: formData.description,
//         },
//         status: {
//           privacyStatus:  'public',  // Could be 'public', 'private', 'unlisted'
//         },
//       }),
//     });

//     if (!publishResponse.ok) {
//       throw new Error('Failed to publish video');
//     }

//     const videoData = await publishResponse.json();
//     console.log('Video Published:', videoData);
//     return videoData;

//   } catch (error) {
//     console.error('Error uploading video:', error);
//   }
// };
const getYoutubeAccessToken = async (account:any, existedUser:any) => {
  try {
    const sameAccountDetail = existedUser.socialAccounts.find(
      (acc:any) => acc.socialName.toLowerCase() === "youtube"
    );

    if (!sameAccountDetail || !sameAccountDetail.accessToken) {
      throw new Error("YouTube access token not found for this user.");
    }

    return sameAccountDetail.accessToken;
  } catch (error) {
    console.error("Error fetching YouTube access token:", error);
    throw error;
  }
};

const youtubePosting = async (token:any, existedUser:any, formData:any) => {
  try {
    // Step 1: Download the video from Cloudinary
    const cloudinaryVideoUrl = formData.image;
    const cloudinaryResponse = await fetch(cloudinaryVideoUrl);

    if (!cloudinaryResponse.ok) {
      throw new Error("Failed to download video from Cloudinary.");
    }

    const videoBlob = await cloudinaryResponse.blob();

    // Step 2: Initiate Resumable Upload on YouTube
    const initResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            title: formData.title || "Untitled Video",
            description: formData.description || "No description provided",
          },
          status: {
            privacyStatus: formData.privacyStatus || "public", // 'public', 'private', or 'unlisted'
          },
        }),
      }
    );

    if (!initResponse.ok) {
      const errorDetails = await initResponse.text();
      console.error("Initiate Upload Error Details:", errorDetails);
      throw new Error("Failed to initiate video upload.");
    }

    const uploadUrl = initResponse.headers.get("location");
    if (!uploadUrl) {
      throw new Error("Upload URL not found in initiation response.");
    }

    // Step 3: Upload Video Data to YouTube
    const chunkSize = 256 * 1024; // 256KB chunk size
    let offset = 0;

    while (offset < videoBlob.size) {
      const chunk = videoBlob.slice(offset, offset + chunkSize);
      const chunkResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Length": chunk.size.toString(),
          "Content-Range": `bytes ${offset}-${
            offset + chunk.size - 1
          }/${videoBlob.size}`,
        },
        body: chunk,
      });

      if (!chunkResponse.ok) {
        const errorDetails = await chunkResponse.text();
        console.error("Chunk Upload Error Details:", errorDetails);
        throw new Error("Failed to upload video chunk.");
      }

      offset += chunk.size;
    }

    console.log("Video uploaded successfully.");
    return { message: "Video uploaded successfully", uploadUrl };
  } catch (error) {
    console.error("Error during video upload:", error);
    throw error;
  }
};

export const processJob = async (job: any) => {
   const existedUser = await User.findOne({email:job.data.email});
    for(const platforms of job.data.formData.platforms)
    {
      if(platforms.name.toLowerCase() === 'instagram')
      {
        const igId = await getIgId(job.data.email, job.data.formData.platforms);
        if (igId?.igId && igId?.token) {
          postInstagram(igId.igId, igId.token, job.data.formData, job.data.mediaType);
        } else {
          console.error('Instagram ID or token is undefined');
        }
      }
       else if(platforms.name.toLowerCase() === 'linkedin')
      {

        const data = await getToken(existedUser, platforms.account);
        const step1Res =  await step1(data?.accountsId, data?.token);
        const step2Res = await step2(step1Res, data?.token, job.data.formData,data?.accountsId);
      }
      else if(platforms.name.toLowerCase()==='youtube')
      {
        const token = await getYoutubeAccessToken(platforms.account,existedUser);
        const responseAfterPost  = await youtubePosting(token,existedUser,job.data.formData);

        
      }
    }

};