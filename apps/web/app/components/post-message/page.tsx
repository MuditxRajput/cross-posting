"use client";
import { setLinkedIn, setYoutube } from '@/store/slices/social-account';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const PostMessageListner = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const handlePortMessage = (event: any) => {
     
            if (event.origin !== window.location.origin) return;

            const { type, platform, accountName } = event.data || {};

            if (type === "YOUTUBE_AUTH_SUCCESS") {
                console.log("Dispatching YouTube account name:", accountName);
                dispatch(setYoutube(accountName));
                router.push('/dashboard');
            }
             else if (type === "LINKEDIN_AUTH_SUCCESS") {
                console.log("Dispatching LinkedIn account name:", accountName);
                dispatch(setLinkedIn(accountName));
                router.push('/dashboard');
            }
            
        };
    
        window.addEventListener('message', handlePortMessage);
    
        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('message', handlePortMessage);
        };
    }, [dispatch, router]);
    

    return null;
};

export default PostMessageListner;
