'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('cache')
      .service('myService')
      .getWelcomeMessage();
  },
});
