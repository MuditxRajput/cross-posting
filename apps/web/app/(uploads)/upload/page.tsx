"use client"
import LeftPanel from "@/app/(dashboard)/leftpanel/page";
import { useSelector } from "react-redux";
import Upload from "../drop/page";
// import PaymentCards from '../../components/paymentCard'
const upload = () => {
  const cycle = useSelector((state: { social: { cycle: any } }) => state.social.cycle);
  return (
    <div className= " relative bg-slate-100 flex gap-6 px-2 pt-2 ">
         {cycle &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4 ">Free Credit is over ❗</h2>
        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => {
            window.location.href = "../../components/paymentCard";
          }}
        >
          Buy Credit
        </button>
      </div>
    </div>
        }
      <div className="w-[260px] ">
        <LeftPanel/>
      </div>
      <div className=" w-full flex justify-center ">
         <Upload/>
        </div>
      </div>
    // </div>
  )
}

export default upload
