import axios from "axios"
const postSendMail = (data)=>{
    return  axios.post("http://localhost:4000/send_mail", data)
}
export {
    postSendMail,
}