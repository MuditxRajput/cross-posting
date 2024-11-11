import { User } from '@database/models/user.model';
import mongoose from 'mongoose';

async function cleanDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/your_db_name'); // Adjust the connection string

    const users = await User.find(); // Fetch all users

    // Iterate through each user
    for (const user of users) {
      if (user.socialAccounts && Array.isArray(user.socialAccounts)) {
        for (const account of user.socialAccounts) {
          // Clean 'accounts' field (convert array to a single string)
          if (Array.isArray(account.accounts) && account.accounts.length > 0) {
            account.accounts = account.accounts[0];  // Use the first item if it's an array
          }

          // Clean 'accountsId' field (convert array to a single string)
          if (Array.isArray(account.accountsId) && account.accountsId.length > 0) {
            account.accountsId = account.accountsId[0];  // Use the first item if it's an array
          }
        }

        // Save the updated user document
        await user.save();
      }
    }

    console.log('Database cleaned successfully.');
  } catch (error) {
    console.error('Error cleaning the database:', error);
  } finally {
    mongoose.disconnect();
  }
}

cleanDatabase();
