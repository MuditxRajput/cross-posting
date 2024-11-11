"use client"
import { useSession } from 'next-auth/react';
import Signup from './(authPages)/signUp/page';
import Dashboard from './(dashboard)/dashboard/page';
const page = () => {
  const session = useSession();
  if(session.status==="authenticated")
  {
    return <Dashboard/>
  }
  else if(session.status==="unauthenticated")
  {
      return <Signup/>
  }
  return (
    <div>page</div>
  )
}

export default page