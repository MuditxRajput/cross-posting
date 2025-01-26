"use client";
import { dbConnection, User } from "@database/database";
import { CronJob } from 'cron';
const cronJob = new CronJob(
  '0 0 0 * * 0', // At midnight on Sunday every week
  async () => {
    try {
      await dbConnection(); // Ensure DB connection

      const users = await User.find({
        socialAccounts: {
          $elemMatch: {
            expiresIn: { $lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }, // Tokens expiring within 2 days
          },
        },
      });

      for (const user of users) {
        for (const platform of user.socialAccounts || []) {
          if (platform.expiresIn && platform.expiresIn <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)) {
            const refreshedToken = await refreshToken(
              platform.socialName,
              platform.accessToken!,
              platform.refreshToken ?? undefined
            );

            if (refreshedToken) {
              // Update the token in the database
              platform.accessToken = refreshedToken.accessToken;
              platform.expiresIn = new Date(refreshedToken.expiresIn);
            }
          }
        }
        await user.save(); // Save updated tokens for each user
      }
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  },
  null,
  true // Start the job right after defining it
);
async function refreshToken(platform: string, accessToken: string, refreshToken?: string) {
  try {
    if (platform === 'Instagram') {
      const response = await fetch(
        `https://graph.facebook.com/v12.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.NEXT_PUBLIC_FB_CLIENT_ID}&client_secret=YOUR_CLIENT_SECRET&fb_exchange_token=${accessToken}`
      );
      const data = await response.json();
      if (data.access_token) {
        return {
          accessToken: data.access_token,
          expiresIn: Date.now() + 60 * 60 * 24 * 60 * 1000, // 60 days expiration
        };
      }
    } else if (platform === 'YouTube') {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      const data = await response.json();
      if (data.access_token) {
        return {
          accessToken: data.access_token,
          expiresIn: Date.now() + data.expires_in * 1000, // Calculate expiration
        };
      }
    }
    // Add more platforms as needed
  } catch (error) {
    console.error(`Error refreshing token for ${platform}:`, error);
    return null;
  }
}
