"use client";
import Dashboard from '@/app/(dashboard)/dashboard/page';
import { setInstagram } from '@/store/slices/social-account';
import 'dotenv/config';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from 'react-redux';

const InstagramCallback = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");
    console.log("client", accessToken);
    
    if (accessToken) {
      const sendtoken = async () => {
        try {
          console.log("Calling Instagram API...");
          
          const res = await fetch(`http://localhost:3000/api/instagram/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: accessToken }),
          });

          if (res.ok) {
            const val = await res.json();
            console.log("Instagram data:", val);

            // Dispatch Instagram user data to Redux
            if(val.userData!==null)
             dispatch(setInstagram(val.userData));
          } else {
            console.error("Failed to fetch Instagram data");
          }
        } catch (error) {
          console.error("Error fetching access token", error);
        }
      };

      sendtoken();
      router.push("/dashboard");
    } else {
      console.log("Token is not found");
    }
  }, [dispatch, router]);

  return <Dashboard />;
};

export default InstagramCallback;
