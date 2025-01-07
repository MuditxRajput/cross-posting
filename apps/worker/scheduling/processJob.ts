import { User } from "@database/database";

const getIgId = async (email: string, platforms: any[]) => {
  try {
    console.log("platforms",platforms);
    
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
  formData: { image?: string; video?: string; description: string },
  mediaType: 'image' | 'video'
) => {
  try {
    let mediaUrl = '';
    let mediaPayload = '';

    // Handle Image or Video Media Type
    if (mediaType === 'image') {
      mediaUrl = formData.image || '';
      mediaPayload = `image_url=${mediaUrl}&caption=${encodeURIComponent(formData.description)}`;
    } else if (mediaType === 'video') {
      mediaUrl = formData.image || ''; // Make sure formData.video is used for video
      mediaPayload = `video_url=${mediaUrl}&caption=${encodeURIComponent(formData.description)}&media_type=REELS`;
    } else {
      throw new Error('Invalid mediaType. Use "image" or "video".');
    }

    console.log('Posting media to Instagram:', mediaType, mediaUrl);

    // Step 1: Create Media Container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/media?${mediaPayload}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const containerData = await containerResponse.json() as { id?: string };
    if (!containerData.id) {
      console.error('Failed to create media container:', containerData);
      return;
    }

    console.log('Container created with ID:', containerData.id);

    // Step 2: Check Media Status and Publish when Ready
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

    // Wait for the media to be ready before publishing
    await checkMediaStatus(containerData.id);

    // Step 3: Publish the Media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${containerData.id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const publishData = await publishResponse.json();
    console.log('Media published:', publishData);
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
export const processJob = async (job: any) => {
    // console.log('Processing job:', job);
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
        // code for linkedin
        const data = await getToken(existedUser, platforms.account);
        const step1Res =  await step1(data?.accountsId, data?.token);
        const step2Res = await step2(step1Res, data?.token, job.data.formData,data?.accountsId);

      }
    }

};