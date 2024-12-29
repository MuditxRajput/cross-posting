"use client"
import LeftPanel from "@/app/(dashboard)/leftpanel/page"
import Upload from "../drop/page"

const upload = () => {
  return (
    <div className="bg-slate-100 flex gap-6 px-2 pt-2 ">
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
