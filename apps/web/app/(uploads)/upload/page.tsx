"use client"
import LeftPanel from "@/app/(dashboard)/leftpanel/page"
import ImageUploadComponent from "../../components/imageUpload/Upload"

const upload = () => {
  return (
    <div className="bg-slate-100 flex gap-6 px-2 pt-2 ">
      <div className="w-[260px] ">
        <LeftPanel/>
      </div>
      <div className=" w-full flex justify-center ">
        {/* <div className="border-dashed border-2 w-full rounded-lg text-center p-20 border-black cursor-pointer "> */}
          <ImageUploadComponent/>
        {/* </div> */}
      </div>
    </div>
  )
}

export default upload
