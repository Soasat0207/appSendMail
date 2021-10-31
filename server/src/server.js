import express from "express";
import initWebRoutes from "./route/web";
import cors from 'cors'
const app = express()
const port = 4000
import bodyParser from 'body-parser'
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true,limit: '50mb'}));
const corsOptions ={
    origin:true, 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}
app.use(cors(corsOptions));// Use this after the variable declaration

initWebRoutes(app);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})