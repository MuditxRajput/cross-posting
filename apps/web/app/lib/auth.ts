// lib/authOptions.ts
import { User } from "@database/models/user.model";
import GoogleProvider from "next-auth/providers/google";
import { dbConnection } from "../../../../packages/database";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnection();

        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          return true;
        } else {
          const newUser = new User({
            email: user.email,
            name: user.name,
            connectedPlatform: account ? [account.provider] : [],
            socialAccounts: [
              {
                socialName: account?.provider || '',
                accessToken: account?.access_token || '',
                refreshToken: account?.refresh_token || '',
                accounts: account?.provider || '',
                accountsId: account?.id || '',
                expiresIn: new Date(Date.now() + (account?.expires_at || 0) * 1000),
              },
            ],
          });

          await newUser.save();
          return true;
        }
      } catch (error) {
        console.error('Sign-in error:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/auth/signin')) {
        return `${baseUrl}/login`;
      } else {
        return `${baseUrl}/dashboard`;
      }
    },
  },
};