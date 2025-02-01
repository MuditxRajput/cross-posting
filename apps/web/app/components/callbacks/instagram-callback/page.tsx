"use client";
import Dashboard from '@/app/(dashboard)/dashboard/page';
import { setInstagram } from '@/store/slices/social-account';
import 'dotenv/config';
import { useRouter } from "next/navigation";
import { useDispatch } from 'react-redux';

const InstagramCallback = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  // const [expiresIn, setExpiresIn] = useState(null); // Store the expiration time of the token
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const access_token = params.get("access_token");  
    if (access_token) {
      const sendToken = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/instagram/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: access_token }),
          });

          if (res.ok) {
            const val = await res.json();

  
            if(val.userData !== null) {
              dispatch(setInstagram(val.userData));
              router.push("/dashboard");
            }
          } else {
            console.error("Failed to fetch Instagram data");
          }
        } catch (error) {
          console.error("Error fetching access token", error);
        }
      };
      sendToken();
    } else {
      console.log("Token is not found");
    }

  return <Dashboard />;
};

export default InstagramCallback;
