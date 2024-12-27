import { User } from "@database/database";

const getIgId = async (email: string, platform: any[]) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    for(const element of platform) {
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
   const containerId =  await fetch(`https://graph.facebook.com/v21.0/${igId}/media?image_url=${formData.image}&caption=${formData.content}`,{
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
// const getAccessToken = async (email: string, platform:any) =>{
//   const token = [{
//     platform : '',
//     access : '',
//   }];
//   try {
//       platform.map((element: any) => {
//         if (element.name.toLowerCase() === 'instagram') {
//           for (const account of element.account) {
             
//           }
//         }
//       });
//     } catch (error) {
//       console.error('Error fetching access token:', error);
//     }
//   };
export const processJob = async (job: any) => {
  const email = job.data.email;
  
  const igId = await getIgId(email, job.data.formData.platform);
  postInstagram(igId?.igId,igId?.token, job.data.formData);
};