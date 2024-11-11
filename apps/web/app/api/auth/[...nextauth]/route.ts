/* eslint-disable turbo/no-undeclared-env-vars */
// [...nextauth].ts
import { User } from "@database/models/user.model";
import NextAuth, { getServerSession } from "next-auth";
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
        async signIn({ user, account }: any) {
            try {
                await dbConnection();
               const session = await getServerSession();
               if(session)
               {
                
                return true;
                
                

               }
               else{
                console.log("create the new users");
                const existedEmail = await User.findOne({email:user.email});
                if(existedEmail)
                {
                    return true;
                }
                else{
                    const newUser = new User({
                        email:user.email,
                        name:user.name,
                        
                        connectedPlatform: [ account?.provider]
                    })
                    console.log(newUser);
                    
                    await newUser.save();
                    return true;
                   }
                }
                


            } catch (error) {
                console.error("Sign-in error:", error);
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
