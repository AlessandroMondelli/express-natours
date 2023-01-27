const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.username = user.username;
    this.to = user.email;
    this.url = url;
    this.from =
      process.env.NODE_ENV === 'development'
        ? process.env.MAIL_FROM
        : process.env.SENDGRID_TEMP;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Utilizzo SendGrid per environment
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_KEY,
        },
      });
    }

    //Creo transporter
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async send(template, subject) {
    //Render pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/blocks/${template}.pug`,
      {
        username: this.username,
        url: this.url,
        subject,
      }
    );

    //Opzioni email
    const mailOptions = {
      from: `Support <${this.from}>`,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours');
  }

  async resetPassword() {
    await this.send('resetPassword', 'Reset Password');
  }
};
