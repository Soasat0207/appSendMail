import sendMailServices from '../services/sendMailServices' 
export let postSendMail = async(req, res) =>{
    try {
        let response = await sendMailServices.SendMail(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server ...'
        })
    }
}

export default {postSendMail};