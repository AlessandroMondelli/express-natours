const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //Creo transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  //Definisco le opzioni della mail
  const mailOptions = {
    from: 'Support <support@host.it>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };

  //Invio email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
