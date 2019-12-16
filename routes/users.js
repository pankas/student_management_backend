var Users = require('../models/users');
var dbConnect = require('../models/dbconnect');
var writeResponse = require('../helpers/response').writeResponse;
var writeError = require('../helpers/response').writeError;
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const OAuth2Client = new OAuth2(
    "638402877955-afmpukcjg56c2nptkh85aa6d738ktu47.apps.googleusercontent.com",
    "rYGAq5C0sBOAG43Q2vdzUkWJ",
    "https://developers.google.com/oauthplayground"
)
OAuth2Client.setCredentials({
    refresh_token:"1//04U5Lu4x78j7ACgYIARAAGAQSNwF-L9IrDwP5jH6YSgoRfpVVz24xEY03xCn-754KkxglrsB7Rmwsg05h1fIANwRmTewXIoAS89E"
})
const accessToken = OAuth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
    service:"Gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        type:"oAuth2",
        user:"pspankajsingh395@gmail.com",
        clientId:"638402877955-afmpukcjg56c2nptkh85aa6d738ktu47.apps.googleusercontent.com",
        clientSecret:"rYGAq5C0sBOAG43Q2vdzUkWJ",
        refreshToken:"1//04U5Lu4x78j7ACgYIARAAGAQSNwF-L9IrDwP5jH6YSgoRfpVVz24xEY03xCn-754KkxglrsB7Rmwsg05h1fIANwRmTewXIoAS89E",
        accessToken: accessToken 
    }
})


exports.register = (req,res,next)=>{


    let fname = req.body.data.firstname;
    let lname = req.body.data.lastname;
    let email = req.body.data.email;
    let type = req.body.data.type;
    let password = req.body.data.password1;
    Users.register(dbConnect.getSession(req),type,fname,lname,email,password)
    .then(response=>{
        const mailOptions = {
            from:"pspankajsingh395@gmail.com",
            to:`${email}`,
            subject:"Login credentials",
            text:`Your email is:${email} and password is ${password}`
        }
        smtpTransport.sendMail(mailOptions, (error, response) => {
            error ? console.log(error) : console.log(response);
            smtpTransport.close();
           });
    writeResponse(res,response,201)})
    .catch(err=>{
        writeError(res,err,400)
    })
}

exports.login = (req,res,next)=>{
    let email = req.body.data.email
    let password = req.body.data.password
    console.log("request body data",req.body.data)
    Users.login(dbConnect.getSession(req),email,password)
    .then(response=>{
        writeResponse(res,response,201)
    })
    .catch(err=>{
        console.log("error",err)
    })
}

exports.forgotPass = (req,res,next)=>{
  let email = Object.keys(req.body)
    Users.forgotPass(dbConnect.getSession(req),email)
        .then(response=>{     
            writeResponse(res,response,201)
        })
        .catch(err=>{
            console.log("error",err)
        })
}


exports.getUsers = (req,res,next)=>{
    Users.getUsers(dbConnect.getSession(req))
    .then(response=>{     
        writeResponse(res,response,201)
    })
    .catch(err=>{
        console.log("error",err)
    })
  }

exports.update = (req,res,next)=>{
    let fname = req.body.data.fname
    let lname = req.body.data.lname
    let email = req.body.data.email
    let type = req.body.data.type
    Users.update(dbConnect.getSession(req),fname,lname,email,type)
    .then(response=>{     
        writeResponse(res,response,201)
    })
    .catch(err=>{
        console.log("error",err)
    })
}

exports.sendMail = (req,res,next)=>{
    console.log("request body data",req.body.data)
    let to = req.body.data.to
    let from = req.body.data.from
    let subject = req.body.data.subject
    let content = req.body.data.content
        const mailOptions = {
            from:from,
            to:to,
            subject:subject,
            text:content
        }
        smtpTransport.sendMail(mailOptions, (error, response) => {
            error ? console.log(error) : console.log(response);
            smtpTransport.close();
           });
        writeResponse(res,'mail sent successully',201)
}
