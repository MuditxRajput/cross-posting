"use client";
import { setLeftPanel } from "@/store/slices/social-account";
import { persistor, store } from "@/store/store";
import { SessionProvider } from "next-auth/react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import MobileMenu from "./(dashboard)/mobile-left-menu/page";
import PostMessageListner from "./components/post-message/page";

// Wrapper component for mobile menu logic
const MobileMenuWrapper = () => {
  const dispatch = useDispatch();
  const leftPanelIsOpen = useSelector((state: { social: { leftpanel: boolean } }) => state.social.leftpanel);

  const handleCloseMenu = () => {
    dispatch(setLeftPanel(false));
  };

  return (
    <>
      {leftPanelIsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={handleCloseMenu} // Close menu on backdrop click
          />
          {/* Mobile Menu */}
          <div className="absolute sm:hidden z-30 rounded-md shadow-sm shadow-black bg-white w-full h-52 top-0 left-0 animate-slide-in-left duration-1000 delay-500">
            <MobileMenu />
          </div>
        </>
      )}
    </>
  );
};

// Main Providers component
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PostMessageListner />
          <MobileMenuWrapper /> {/* Add the mobile menu wrapper here */}
          {children}
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
};