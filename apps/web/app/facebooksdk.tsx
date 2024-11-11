// components/FacebookSDK.tsx
"use client"
import { useEffect } from "react";

// Extend the Window interface to include fbAsyncInit and FB
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (config: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }) => void;
    };
  }
}

const FacebookSDK = () => {
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '4196765553928348', // Replace with your app ID
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v14.0', // Use the latest version or the version you need
      });
    };

    // Load the SDK asynchronously
    (function (d, s, id) {
      const js = d.createElement(s) as HTMLScriptElement; // Cast to HTMLScriptElement
      const fjs = d.getElementsByTagName(s)[0]; // No need for `|| undefined` here
      if (d.getElementById(id)) return;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";

      // Check if fjs is defined before using it
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      } else {
        // If fjs is undefined, just append the script to the head
        document.head.appendChild(js);
      }
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  return null; // This component doesn't render anything
};

export default FacebookSDK;
