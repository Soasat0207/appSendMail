import axios from "axios"
import React, { useState, Fragment } from "react"
import './style.scss';
import { postSendMail } from './services/sendMailServices'
import { ToastContainer, toast } from 'react-toastify';
import CommonUtils from './utils/CommonUtils';
import 'react-toastify/dist/ReactToastify.css';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
function App() {
  const [allValues, setAllValues] = useState({
    sent: false,
    text: '',
    messageHtml: '',
    recipient: '',
    subject: '',
    name: '',
    file: '',
    previewFileUrl: '',
    fileName:'',
    validError: {
      textError: null,
      recipientError: null,
      subjectError: null,
      nameError: null,
      fileError:'',
    }
  });
  const handleSend = async (event) => {
    event.preventDefault();
    let isValid = checkValidateInput();
    if (allValues.validError.fileError.length > 0 || isValid === false) return;
    try {
      let response = await postSendMail(allValues);
      if (response && response.data.errCode === 0) {
        toast.success('Mail sent successfully')
        setAllValues({ ...allValues, sent: true })
      }
      else {
        toast.error('Error! An error occurred. Please try again later')
      }
    } catch (error) {
      console.error(error)
    }
  }
  const changeHandler = e => {
    setAllValues({ ...allValues, [e.target.name]: e.target.value })
  }
  const changeHandlerFile = async (event) => {
    let data = event.target.files;
    let file = data[0];
    let sizeFile = file.size / 1000 / 1000;
    sizeFile = sizeFile.toFixed(2);
    if(sizeFile >= 25){
      setError('file', `This file to big, maximum is 25mb. You file size is: ' + ${sizeFile} + ' MB`)
    }
    if (file && sizeFile < 25) {
      let base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);
      setAllValues({
        ...allValues,
        previewFileUrl: objectUrl,
        file:base64,
        fileName:file.name
      })
      // nếu dùng blob thì sử dụng cái này 
      // const blob = await (await fetch(base64)).blob(); 

      // var fileblob = new File(file,file.name);
    }
  }
  const checkValidateInput = () => {
    let isValid = true;
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    let listEmail =allValues.recipient.split(/,|;/);
    let arrCheck = ['name', 'recipient', 'subject'];
    for (let i = 0; i < arrCheck.length; i++) {
      if (!allValues[arrCheck[i]]) {
        isValid = false;
        setError(arrCheck[i], "This field cannot be empty")
      }
      else{
        setError(arrCheck[i], null)
      }
    }
    if(listEmail.length > 0){
      for (let i = 0; i < listEmail.length; i++) {
        listEmail[i] = listEmail[i].trim();
        if(!regexEmail.test(listEmail[i])){
          setError('recipient', "Please enter a valid email address "+listEmail[i]);
          isValid = false;
          break;
        }
        else{
          setError('recipient', null);
        }
      }
    }
    if (allValues.name.length > 100) {
      setError('name', "Maximum of 100 characters");
      isValid = false;
    }
    if (allValues.name.length>0 && allValues.name.length < 100) {
      setError('name', null);
    }
    if (allValues.subject.length > 255) {
      setError('subject', "Maximum of 255 characters");
      isValid = false;
    }
    if (allValues.subject.length>0 &&  allValues.subject.length < 255) {
      setError('subject', null);
    }
    return isValid;
  }
  const setError = (fieldName, error) => {
    let keyState = fieldName + "Error";
    setAllValues((prevState) => ({
      ...prevState,
      validError: {
        ...prevState.validError,
        [keyState]: error
      },
    }));
  }
  const mdParser = new MarkdownIt(/* Markdown-it options */);
  function handleEditorChange({ html, text }) {
    setAllValues({
      ...allValues,
      text: text,
      messageHtml: html
    })
  }
  return (
    <Fragment>
      {!allValues.sent ? (
        <div className="container">
          <div className="sendMail-content">
            <div className="sendMail-form">
              <h2 className="form-title">Send Email</h2>
              <form onSubmit={handleSend}>
                <div className="form-group">
                  <div className="form-input" >
                    <label><i className="fas fa-user"></i></label>
                    <input type="text" value={allValues.name} name='name' onChange={(e) => changeHandler(e)} placeholder="Your Name" />
                  </div>
                  <div><span className="form-valid">{allValues.validError.nameError === null ? null : allValues.validError.nameError}</span></div>
                </div>
                <div className="form-group">
                  <div className="form-input">
                    <label><i className="fas fa-envelope"></i></label>
                    <input type="text" value={allValues.recipient} name='recipient' onChange={(e) => changeHandler(e)} placeholder="Recipients" />
                  </div>
                  <span className="form-valid">{allValues.validError.recipientError === null ? null : allValues.validError.recipientError}</span>
                </div>
                <div className="form-group">
                  <div className="form-input">
                    <label><i className="fas fa-comment"></i></label>
                    <input type="text" value={allValues.subject} name='subject' onChange={(e) => changeHandler(e)} placeholder="Subject" />
                  </div>
                  <span className="form-valid">{allValues.validError.subjectError === null ? null : allValues.validError.subjectError}</span>
                </div>
                <div className="form-group">
                  {/* sử dụng teaxtara xài cái này */}
                  {/* <textarea rows="8" cols="35" value={allValues.text} name='text' onChange={(e) => changeHandler(e)} placeholder="Message" />
                  <span>{allValues.validError.textError === null ? null : allValues.validError.textError}</span> */}
                  <MdEditor
                    style={{ height: '200px' }}
                    renderHTML={text => mdParser.render(text)}
                    onChange={handleEditorChange}
                    placeholder="Message"
                    config={{
                      view: {
                        menu: false,
                        md: true,
                        html: false
                      },
                    }}
                  />
                </div>
                <div className="form-group">
                  <input
                    id="sendFile"
                    type="file"
                    name='file'
                    onChange={(e) => changeHandlerFile(e)}
                  />
                  <span className="form-valid">{allValues.validError.fileError === '' ? null : allValues.validError.fileError}</span>
                </div>
                <div className="form-group">
                  <button type="submit" className="form-submit">Send Email</button>
                </div>
              </form>
            </div>
            <div className="sendMail-image">
              <img src={require('./image/signup-image.jpeg').default} alt="" />
            </div>
          </div>

        </div>
      ) : (
        <Fragment>
          <div className="top-pattern">

          </div>
          <div className="wrapper">
            <h2>Send Mail Success</h2>
            <img src={require('./image/tick.jpeg').default} alt="" />
          </div>
        </Fragment>

      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Same as */}
      <ToastContainer />
    </Fragment>

  );
}

export default App;
