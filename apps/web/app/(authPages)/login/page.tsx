"use client";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await signIn("credentials", { email, password });

    if (result?.error) {
      if (result.error === "Invalid password") {
        router.push("/404");
      } else {
        toast({ description: result.error });
      }
    } else {
      router.push("../../upload");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Login</h1>
        <form className="space-y-4" onSubmit={onSubmit}>
          <input type="email" name="email" placeholder="Email" required className="input-style" />
          <input type="password" name="password" placeholder="Password" required className="input-style" />
          <button type="submit" className="btn-primary">Login</button>
          <div className="flex justify-center">
            <button onClick={() => signIn("google")} className="google-btn">
              <FaGoogle className="text-white text-2xl mr-2" />
              Sign in with Google
            </button>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Don't have an account?{" "}
            <a onClick={() => router.push("/signUp")} className="text-blue-600 font-medium hover:underline cursor-pointer">
              Signup here
            </a>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Login;
