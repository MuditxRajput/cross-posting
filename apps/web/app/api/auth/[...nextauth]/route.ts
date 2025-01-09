/* eslint-disable turbo/no-undeclared-env-vars */
// [...nextauth].ts
import { User } from "@database/models/user.model";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnection } from "../../../../../../packages/database";
export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            
        }),
    ],
    callbacks: {
        async signIn({user,account}:any)
        {
            try {
                await dbConnection();
                // check if user is already there or not..
                const existedUser = await User.findOne({email:user.email});
                if(existedUser)
                {
                    // update the social account like access token and refresh token...
                    const socialAccount = existedUser?.socialAccounts?.find((acc)=>acc.socialName===account.provider);
                    if(socialAccount)
                    {
                        // socialAccount is present.. add new token and refresh..
                        socialAccount.accessToken = account.access_token;
                        socialAccount.refreshToken = account.refresh_token|| socialAccount.refreshToken;
                        socialAccount.expiresIn = new Date(Date.now() + (account.expires_at || 0)*1000);
                    }
                    else{
                        // socialAccount is not present like google is not connected yet.
                        existedUser.socialAccounts?.push({
                            socialName: account.provider,
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token,
                            accounts: account.provider,
                            accountsId: account.id || '',
                            expiresIn: new Date(Date.now() + (account.expires_at || 0) * 1000),
                        });
                    }
                    await existedUser.save();
                    return true as boolean;
                }
                else{
                    // user is not present , make the new user and add in the database.
                    const newUser = new User({
                        email : user.email,
                        name : user.name,
                        connectedPlatform : [account.provider],
                        socialAccounts : [
                            {
                                socialName : account.provider,
                                accessToken: account.access_token,
                                refreshToken: account.refresh_token,
                                accounts: account.provider,
                                accountsId: account.id || '',
                                expiresIn: new Date(Date.now() + (account.expires_at || 0) * 1000),
                            }
                        ]
                    })
                    await newUser.save();
                    return true;
                }
                
            } catch (error) {
                console.error('Sign-in error:', error);
                return false; 
            }
        },

        async redirect({ url, baseUrl }: any) {
            if (url.includes('/auth-error')) {
                return `${baseUrl}/auth-error`;
            } else {
                return `${baseUrl}/dashboard`;
            }
        }
    },
};

// Export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
