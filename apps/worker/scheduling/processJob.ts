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
const postInstagram = async (igId: any, token:any,formData: any) => {
   const containerId =  await fetch(`https://graph.facebook.com/v21.0/${igId}/media?image_url=${formData.image}&caption=${formData.description}`,{
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
        },
    });
    const containerData = await containerId.json() as { id: string };
    
    try {

        const post = await fetch(`https://graph.facebook.com/v21.0/${igId}/media_publish?creation_id=${containerData.id}`,{
            method: 'POST',
            headers: {
                // 'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,

            },
        });
        const postData = await post.json();
    } catch (error) {
        console.log("error",error);
        
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
        postInstagram(igId?.igId,igId?.token, job.data.formData);
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