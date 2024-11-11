"use client"
import { persistor, store } from "@/store/store";
import { SessionProvider } from "next-auth/react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import PostMessageListner from "./components/post-message/page";
export const Providers=({children}:any)=>{
  return <SessionProvider> 
    <Provider store={store}>
       <PersistGate loading={null}
        persistor={persistor}>
          <PostMessageListner/>
          {children}  </PersistGate> </Provider></SessionProvider> 
}