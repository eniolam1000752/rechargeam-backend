import 'dotenv';
import { createTransport } from 'nodemailer';

export function sendMail(sendee, title, message) {
  console.log({
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  let transporter = createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: `"Rechargeam" <${process.env.EMAIL}>`,
    to: sendee,
    subject: title,
    text: message,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log('Error while sending email => ' + err);
        reject('Error while sending email' + err);
      } else {
        console.log('Email sent => ', info);
        resolve(info);
      }
    });
  });
}
