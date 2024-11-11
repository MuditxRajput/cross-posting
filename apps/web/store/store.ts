// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import socialReducer from './slices/social-account';
export interface SocialState {
  youtube : string[],
  facebook : string[],
  linkedIn : string[],
  instagram : string[],
}
export interface RootState{
  social : SocialState,
}
const persistConfig = {
  key: 'social',      
  storage,            
};

const persistedSocialReducer = persistReducer(persistConfig, socialReducer);

const store = configureStore({
  reducer: {
    social: persistedSocialReducer, // Persisted reducer for the `social` slice
  },
});

const persistor = persistStore(store);

export { persistor, store };

