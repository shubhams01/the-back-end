// ./config/plugins.js
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: 'smtp.hostinger.com', 
          port: 465, // Port number for TLS
          secure: true, // Use TLS
          auth: {
            user: env('SMTP_USER'), 
            pass: env('SMTP_PASS'), 
          },
        },
        settings: {
          defaultFrom: 'admin@gyaanhub.io',
          defaultReplyTo: 'admin@gyaanhub.io',
        },
      },
    },
  });