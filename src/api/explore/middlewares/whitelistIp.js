'use strict';

/**
 * `whitelistIp` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const allowedIps = ['127.0.0.1', '147.79.66.190', '172.18.0.7']; // Client IPs
    const clientIp = ctx.request.ip;
    
    console.log('Request IP:', ctx.request.ip);

    if (allowedIps.includes(clientIp)) {
      await next(); // Allow access
    } else {
      ctx.unauthorized('Access denied: Unauthorized IP address');
    }
  };
};

