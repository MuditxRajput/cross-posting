"use client"
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
const Login = () => {
  const router = useRouter();
  const { toast } = useToast()
 const onSubmit =async(e:any)=>{
   e.preventDefault();
   const email = e.target.email.value;
   const name = e.target.name.value;
    const password = e.target.password.value;
    const result = await signIn("credentials", {
      email,
      password,
    });
    if (result?.error) {
      if (result.error === "Invalid password") {
        // Redirect to 404 page if password is invalid
        router.push('/404');
      } else {
        // Handle other errors (e.g., "No user found")
        alert(result.error);
      }
    } else {
      // Redirect to upload page if login is successful
      router.push('../../upload');
    }
 }
  return (
       <div className="min-h-screen bg-white flex items-center justify-center">
         <section className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
           <div className="space-y-4 md:space-y-6">
             <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Login 
             </h1>
             <form className="space-y-4 md:space-y-6" onSubmit={onSubmit} >
               <div>
                 <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                 <input
                   type="email"
                   name="email"
                   id="email"
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                   placeholder="name@company.com"
                   required
                  //  onChange={(e)=>onchandleHandler(e)}
                 />
               </div>
               <div>
                 <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your name</label>
                 <input
                   type="name"
                   name="name"
                   id="name"
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                   placeholder="Edin"
                   required
                //    onChange={(e)=>onchangeHandler(e)}
                // onChange={(e)=>onchandleHandler(e)}
                 />
               </div>
               <div>
                 <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                 <input
                   type="password"
                   name="password"
                   id="password"
                   placeholder="••••••••"
                //    onChange={(e)=>onchangeHandler(e)}
                // onChange={(e)=>onchandleHandler(e)}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                   required
                 />
               </div>
               <button
               
                 type="submit"
                 className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
               >
                 Login in
               </button>
                <div className="flex justify-center items-center">
               <FaGoogle className="text-xl hover:text-red-500 cursor-pointer" onClick={()=>signIn("google")}  />
                 </div>  
               <p className=" cursor-pointer text-sm font-light text-gray-500">
                 Already have an account?{" "}
                 <a onClick={()=>router.push('/signUp')} className="font-medium text-blue-600 hover:underline">
                   Signup here
                 </a>
               </p>
             </form>
           </div>
         </section>
       </div>
     );
}

export default Login