import express from "express";
import sendMailController from "../controllers/sendMailControllers";
let router = express.Router();

let initWebRoutes = (app) =>{
    router.get('/', (req, res) => {pres.send('Hello World!')})
    router.post('/send_mail',sendMailController.postSendMail)
    return app.use('/',router);
}
export default initWebRoutes;

