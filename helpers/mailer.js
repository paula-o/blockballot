const nodemailer = require('nodemailer');
const env = require('dotenv').config();
const helpers = require('../helpers/helpers.js');
const dbHelpers = require('../database/dbHelpers.js');

var sendPasswordReset = function(email, callback) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false, 
    auth: {
        user: 'blockballot@gmail.com', 
        pass: process.env.PASSWORD 
    }
  });

  let mailOptions = {
      from: '"BlockBallot" <blockballot@gmail.com>', 
      to: `${email}`, 
      subject: 'Link to reset your password', 
      html: '<b>Click the link below to reset your password.</b>' 
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      callback(error);
    } else {
      console.log('no error');
      callback(null, info);
    }
  });
}

var sendEmailCodes = function(emails, callback) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 588,
    secure: false, 
    auth: {
        user: 'blockballot@gmail.com', 
        pass: process.env.PASSWORD 
    }
  });

  emails.forEach((recipient) => {
    var code = helpers.createUniqueId();
    dbHelpers.saveVoterId(code);
    let mailOptions = {
      from: '"BlockBallot" <blockballot@gmail.com>', 
      to: `${recipient}`, 
      subject: 'Your voting code', 
      html: '<p>Visit localhost:3000/voter and enter the code below to submit your vote.</p><p>Your unique code is <b>' + `${code}` + '</b></p>' 
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        callback(error);
      } else {
        let newinfo = {
          result: info,
          id: code
        } 
        callback(null, newinfo);
      }
    });

  })
}


  exports.sendPasswordReset = sendPasswordReset;
  exports.sendEmailCodes = sendEmailCodes;
