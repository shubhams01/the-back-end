module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'http://localhost:1337', 'https://gyaanhub.io', 'https://api.gyaanhub.io'], // List of allowed origins
      headers: '*', // Allow all headers
    },
  },
];
