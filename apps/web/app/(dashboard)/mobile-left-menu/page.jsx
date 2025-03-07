"use client"
import { setLeftPanel } from "@/store/slices/social-account";
import { useDispatch, useSelector } from "react-redux";

const MobileMenu = () => {
  const list = ["Home", "Connect account"];
  const dispatch = useDispatch();
  const mobileMenuState = useSelector((state)=>state.social?.leftpanel);
  const handler=(e)=>{
    const text = e.target.innerText;
    if(text==="Home"){
      dispatch(setLeftPanel(!mobileMenuState));
      window.location.href="/"
    }
    else if( text==="Pricing"){
      window.location.href="/payment-card"
    }
    else if(text ==='Connect account')
    {
      dispatch(setLeftPanel(!mobileMenuState));
      window.location.href = '../../dashboard';
    }
    // else if( text==="Abouts"){  
    //   window.location.href="/abouts"
    // }
    // else if( text==="Contact"){
    //   window.location.href="/contact"
    // }
    
  }
  return (
   
    <div className=" justify-center items-center w-auto h-auto flex flex-col animate-slide-in-left duration-1000 delay-500" >
      {list?.map((item, index) => {
        return <div  className=" p-2 cursor-pointer" onClick={(e)=>handler(e)} key={index}>{item}</div>;
      })}
    </div>
  );
};

export default MobileMenu;
