// ./config/plugins.js
module.exports = ({ env }) => ({
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: 'smtp.hostinger.com', // Hostinger's SMTP server
          port: 465, // Port number for TLS
          secure: true, // Use TLS
          auth: {
            user: env('SMTP_USER'), // Your email address
            pass: env('SMTP_PASS'), // Your email password
          },
        },
        settings: {
          defaultFrom: 'admin@gyaanhub.io',
          defaultReplyTo: 'admin@gyaanhub.io',
        },
      },
    },
  });