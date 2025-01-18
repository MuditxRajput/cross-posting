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
    // Sign-in callback to check if the user exists or not
    async signIn({ user, account }: any) {
      try {
        await dbConnection();

        // Check if the user already exists in the database
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // If user exists, proceed to login
          return true; // Allow sign-in
        } else {
          // User doesn't exist, create a new user record
          const newUser = new User({
            email: user.email,
            name: user.name,
            connectedPlatform: [account.provider],
            socialAccounts: [
              {
                socialName: account.provider,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                accounts: account.provider,
                accountsId: account.id || '',
                expiresIn: new Date(Date.now() + (account.expires_at || 0) * 1000),
              },
            ],
          });

          await newUser.save();
          return true; // Proceed with the sign-in flow
        }
      } catch (error) {
        console.error('Sign-in error:', error);
        return false; // If any error occurs, sign-in fails
      }
    },

    // Redirect callback after successful sign-in
    async redirect({ url, baseUrl }: any) {
      // Redirect based on the URL
      if (url.includes('/auth/signin')) {
        return `${baseUrl}/login`; // Redirect to login if the URL is '/auth/signin'
      } else {
        return `${baseUrl}/dashboard`; // Redirect to dashboard if authenticated
      }
    },
  },
};

// Export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
