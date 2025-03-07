"use client";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

const Signup = () => {
  const { toast } = useToast();
  const [userDetails, setUserDetails] = useState({
    name: "",
    password: "",
    email: "",
  });

  const onchangeHandler = (e: any) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitHandler = (e: any) => {
    e.preventDefault();
    const submitData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/signup", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(userDetails),
        });

        const val = await response.json();
        if (val.success) {
          toast({ description: "User is registered" });
          window.location.href = "./login";
        } else {
          toast({ description: val.msg });
        }
      } catch (error) {
        toast({ description: "Internal server error" });
      }
    };
    submitData();
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <section className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Create an account</h1>
        <form className="space-y-4" onSubmit={submitHandler}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={onchangeHandler}
            className="input-style"
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={onchangeHandler}
            className="input-style"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={onchangeHandler}
            className="input-style"
          />
          <button type="submit" className="btn-primary">
            Sign Up
          </button>
          <div className="flex justify-center">
            <button onClick={() => signIn("google")} className="google-btn">
              <FaGoogle className="text-white text-2xl mr-2" />
              Sign up with Google
            </button>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link href="./login" className="text-blue-600 font-medium hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Signup;
