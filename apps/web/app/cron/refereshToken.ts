import { User } from '@database/database';
import { CronJob } from 'cron';
import { useSession } from 'next-auth/react';
const cronJob = new CronJob('0 0 0 * * *', async () => {
    const session = useSession();
    // we have to check which instgram account access token is expired in 2 days..
    const existedUser = await User.findOne({
        email: session.data?.user?.email,   
        socialAccounts:{
            $elemMatch:{
                expiresIn: {
                    $lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                }
            }
        }

    })
    // if the user is not found then return
    if(!existedUser){
        return;
    }
    // if the user is found then we have to refresh the access token
if(existedUser.socialAccounts)
{
  for(const platform of existedUser.socialAccounts)
  {
    if(platform.socialName === 'Instagram')
    {
      const longlivedToken = await fetch(`https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=4196765553928348&client_secret=f1e86ae43a659bcec80deb92928a4717&fb_exchange_token=${platform.accessToken}`);
      const val = await longlivedToken.json();
      const updatedUser = await User.findOneAndUpdate(
        {
          email: session.data?.user?.email,
          "socialAccounts.accountsId": { $ne: platform.accountsId }, // Check if the Instagram ID is not already present
        },
        {
          $addToSet: {
            connectedPlatform: "Instagram",
            socialAccounts: {
              socialName: "Instagram",
              accessToken: val.access_token,
              refreshToken: val.access_token,
              accounts: platform.accounts,
              accountsId: platform.accountsId,
              expiresIn: Date.now()+ 60*60*24*60*1000,
            },
          },
        },
        { new: true }
      );
  }
  else if(platform.socialName === 'linkedin')
  {
    // code for linkedin
    window.open('https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86ij8xunmbhjqh&redirect_uri=http://localhost:3000/api/linkedin/callback&state=foobar&scope=openid%20profile%20w_member_social%20email')

  }
}
   
}
}, null, true);