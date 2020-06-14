const express = require("express");
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
      },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    uType: {
        type: String,
        required: true
      },
    date: {
      type: Date,
      default: Date.now
    }
  });
//Setting Model
var User = mongoose.model("users", UserSchema)
//Configurayion for handling email
const OAuth2Client = new OAuth2(
    "1099491383303-fsfhqm3ecje3jr1bm61er75surk340ik.apps.googleusercontent.com",
    "qOmsnpZIeGmdBiywD8tRoezB",
    "https://developers.google.com/oauthplayground"
)
OAuth2Client.setCredentials({
    refresh_token:"1//0475kadiXHf7HCgYIARAAGAQSNwF-L9IryU9mY4LTYOhtdUrUoVbqsxaJwvhGNvjhkyVzjM0tdNdNlhO24idhPEqx4QDaBpKJKgA"
})
const accessToken = OAuth2Client.getAccessToken();
const smtpTransport = nodemailer.createTransport({
    service:"Gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        type:"oAuth2",
        user:"pspankajsingh2020@gmail.com",
        clientId:"1099491383303-fsfhqm3ecje3jr1bm61er75surk340ik.apps.googleusercontent.com",
        clientSecret:"qOmsnpZIeGmdBiywD8tRoezB",
        refreshToken:"1//0475kadiXHf7HCgYIARAAGAQSNwF-L9IryU9mY4LTYOhtdUrUoVbqsxaJwvhGNvjhkyVzjM0tdNdNlhO24idhPEqx4QDaBpKJKgA",
        accessToken: accessToken 
    }
})
// Register User
exports.register = (req,res)=>{
    User.findOne({ email: req.body.data.email }).then(user => {
        if (user) {
          return res.json({ error: "Email already exists" });
        } else {
          const newUser = new User({
            firstName: req.body.data.firstname,
            lastName: req.body.data.lastname,
            email: req.body.data.email,
            uType:req.body.data.type,
            password: req.body.data.password1
          });
    const ecrypt = cryptr.encrypt(newUser.password);
    newUser.password =  ecrypt;
    newUser
    .save()
    .then(user =>{ 
      const mailOptions = {
        from:"pspankajsingh395@gmail.com",
        to:`${req.body.data.email}`,
        subject:"Login credentials",
        text:`Your email is:${req.body.data.email} and password is ${newUser.password}`
    }
    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();
       });
        res.json(user)})
    .catch(err => console.log(err));
        }
      });
}
// User Login
exports.login = (req,res)=>{
    const email = req.body.data.email;
    const password = req.body.data.password;
    User.findOne({ email }).then(user => {
      if (!user) {
        return res.json({ error: "Email not found" });
      }
  const dcrptPassword = cryptr.decrypt(user.password);
        if (password === dcrptPassword) {
          const payload = {
            id: user.id,
            name: user.name
          };
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: token,
                firstname:user.firstName,
                lastname:user.lastName,
                email: user.email,
                type:user.uType
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
    });
}
exports.getUsers = (req,res)=>{
  const header = req.headers['authorization'];
  if(header !== undefined){
    jwt.verify(header,'istem', function(err, decoded) {
      if(err){
          console.log(err)
      }else{
        User.find()
        .then(response=>{    
          return res
          .json({response});
          })
          .catch(err=>{
              console.log("error",err)
          })
      }
     })
  }else{
    res.sendStatus(403);
  }
}
exports.userDetails = (req,res)=>{
  const header = req.headers['authorization'];
  if(header !== undefined){
    jwt.verify(header,'istem', function(err, decoded) {
      if(err){
      }else{
        const email = req.body.data.email;
        User.findOne({ email }).then(user => {
          if (!user) {
            return res.json({ error: "Email not found" });
          }
          res.json({
            success: true,
            token: token,
            firstname:user.firstName,
            lastname:user.lastName,
            email: user.email,
            type:user.uType
          });
        });
      }
     })
  }else{
    res.sendStatus(403);
  }
}
exports.update = (req,res)=>{
    let fname = req.body.data.fname
    let lname = req.body.data.lname
    let email = req.body.data.email
    let type = req.body.data.type
    newData = {
        firstName: fname,
        lastName: lname,
        uType: type
    }
    const header = req.headers['authorization'];
    if(header !== undefined){
      jwt.verify(header,'istem', function(err, decoded) {
        if(err){
            console.log(err)
        }else{
          const email = req.body.data.email;
          User.updateOne({'email':email}, {$set: newData}, {upsert: true})
          .then(r=>{
            User.findOne({ email }).then(user => {
              res.json({
                success: true,
                firstname:user.firstName,
                lastname:user.lastName,
                email: user.email,
                type:user.uType
              });
            });
          })
          .catch(err=>{
              console.log("error",err)
          })
        }
       })
    }else{
      res.sendStatus(403);
    } 
}
exports.sendMail = (req,res)=>{
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
        const header = req.headers['authorization'];
        if(header !== undefined){
          jwt.verify(header,'istem', function(err, decoded) {
            if(err){
                console.log(err)
            }else{
              smtpTransport.sendMail(mailOptions, (error, response) => {
                smtpTransport.close();
                return  error ?  res
                .json({error}) : res.json({response});
              });

            }
           })
        }else{
          res.sendStatus(403);
        }
}