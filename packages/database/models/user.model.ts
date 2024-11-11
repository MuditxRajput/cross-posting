import mongoose, { Document, Model } from 'mongoose';

interface SocialAccount {
  accessToken?: string | null;
  refreshToken?: string | null;
  accounts: string;          // Now a single string
  accountsId: string;        // Now a single string
  socialName: string;
}

interface UserDocument extends Document {
  email: string;
  name?: string;
  password: string;
  connectedPlatform?: string[];
  socialAccounts?: SocialAccount[];
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    password: {
      type: String,
    },
    connectedPlatform: {
      type: [String],
    },
    socialAccounts: [
      {
        socialName: { type: String },
        accessToken: { type: String },
        refreshToken: { type: String },
        accounts: { type: String },      // Changed to a single string
        accountsId: { type: String },    // Changed to a single string
      },
    ],
  },
  { timestamps: true }
);

export const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
// export const User: Model<UserDocument> =  mongoose.model<UserDocument>('User', userSchema);
