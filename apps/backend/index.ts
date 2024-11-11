import { dbConnection } from "@database/database";
import express from 'express';
const app = express();
dbConnection().then(()=>app.listen(process.env.PORT,()=>console.log(`server is connected at port ${process.env.PORT}`)
)).catch((e)=>console.error(e));