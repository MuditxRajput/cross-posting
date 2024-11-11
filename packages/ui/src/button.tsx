"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
}
//  const connectionHandler=(name:string)=>{
//     alert(`app ${name}` )
//     console.log("Click");
    
//  }
export const Button = ({ children, className, appName }: ButtonProps) => {
  return (
    <button
      className={className}
      // onClick={()=>connectionHandler(appName)}
    >
      {children}
    </button>
  );
};
