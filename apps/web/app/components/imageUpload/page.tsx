"use client"
import Dropzone from 'react-dropzone'
const ImageUploadComponent = () => {
  return (
    <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
  {({getRootProps, getInputProps}) => (
    <section className='border-2 border-dashed border-black p-20 rounded-xl'>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p className=" cursor-pointer hover:text-black hover:text-xl text-center text-lg text-slate-500">Drag 'n' drop some files here, or click to select files</p>
      </div>
    </section>
  )}
</Dropzone>
  )
}

export default ImageUploadComponent