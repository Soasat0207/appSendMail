import dotenv from 'dotenv';
import events from "events";
let eventEmitter = new events.EventEmitter();
let check = 1;
dotenv.config();
import nodemailer from 'nodemailer'
let SendMail =  (data) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            let fileBuffer = new Buffer(data.file, 'base64');
            let sizeFile = fileBuffer.length/ 1000/1000;
            let fileSend ;
            let listMail= data.recipient;
            if(!data || sizeFile >=25 ){
                eventEmitter.emit('error',{"size File":"File Lớn hơn 25mb"});
                return;
            }
            if(data.file.length>0){
                fileSend = Buffer.from(data.file.split("base64,")[1], "base64");
            }
            const transport = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: process.env.MAIL_PORT,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                }
            })
            let inputMail = ()=>{
                let mailOptionFile = {
                    from: process.env.MAIL_FROM,
                    to:  listMail,
                    subject: data.subject,
                    text: data.text,
                    name:data.name,
                    html:data.messageHtml+`
                    <div style="color:red">
                        <div><b>Thank you and Best regards</b></div><div><b>${data.name}</b></div>
                    </div>
                    
                    `,
                    attachments: [{
                        // path: data.file 
                        filename: data.fileName,
                        content:fileSend ,
                        encoding: 'base64'
                    }]
                }
                let mailOption = {
                    from: process.env.MAIL_FROM,
                    to:  listMail,
                    subject: data.subject,
                    text: data.text,
                    name:data.name,
                    html:data.messageHtml+`
                    <div style="color:red">
                        <div><b>Thank you and Best regards</b></div><div><b>${data.name}</b></div>
                    </div>  
                    `,
                }
                return data.file ===''? mailOption: mailOptionFile;
            }
            let send = () => {
                transport.sendMail(inputMail(),function(err,success){
                    if(err){
                        eventEmitter.emit('error', err);
                    }
                    if(success){
                        eventEmitter.emit('success', success);
                    }
                });
            };
            send();
            eventEmitter.on("error", function(err){
                console.log("Mail not send");
                if(check<10)
                    send();
                check++;
                if(err.code ==="EAUTH"){
                    console.log("Username and Password not accepted")
                }
                resolve({
                    errCode:1,
                    errMessage:err
                })
            });
            eventEmitter.on("success", function(success){
                console.log("Mail send");
                resolve({
                    errCode:0,
                    errMessage:success
                })
            }); 
        } catch (error) {
            reject(error); 
        }
        
    })
	
}
export default {SendMail};
