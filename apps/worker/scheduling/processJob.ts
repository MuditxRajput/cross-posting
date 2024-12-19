const getAcessToken = async (email: string,platform:[]) => {
  // there is an api to get the access token...
  platform.forEach((element)=>{
    console.log("element",element);
  })

}

export const processJob = async (job: any) => {
  const email = job.data.email;
   getAcessToken(email,job.data.formData.platform);
  
}