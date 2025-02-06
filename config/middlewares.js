module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000', // Next.js frontend
        'http://localhost:1337', // Strapi backend (optional for local requests)
        'https://gyaanhub.io',  // Production frontend
        'https://api.gyaanhub.io', // Production API
      ],
      headers: '*', // Allow all headers
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow necessary HTTP methods
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
