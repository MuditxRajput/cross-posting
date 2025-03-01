"use client"
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from 'next-auth/react';
import Signup from './(authPages)/signUp/page';
import UploadPage from './(uploads)/upload/page';
const page = () => {
  const session = useSession();
  if(session.status==="authenticated")
  {
     return <UploadPage/>
  }
  else if(session.status==="unauthenticated")
  {
      return <Signup/>
  }
  return (
    <>
     <div className=" flex flex-col space-y-3  sm:hidden justify-center items-center m-2 p-4">
       <Skeleton className="h-[125px] w-full rounded-xl" />
       <div className="space-y-2">
        <Skeleton className=" h-4 w-[250px]" />
       </div>
     </div>
     <div className="hidden sm:flex flex-col space-y-3 justify-center items-center m-2 p-4">
       <Skeleton className="h-[125px] w-full rounded-xl" />
       <div className="space-y-2">
        <Skeleton className=" h-4 w-[250px]" />
        </div>
     </div>
    </>
  )
}

export default page