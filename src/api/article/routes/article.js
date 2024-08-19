'use strict';

/**
 * article router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::article.article');

module.exports = {
    routes: [
      {
       method: 'GET',
       path: '/articles',
       handler: 'article.findMany',
       config: {
         policies: [],
         middlewares: [],
       },
      },
      {
       method: 'GET',
       path: '/article/:id',
       handler: 'article.findOne',
       config: {
         policies: [],
         middlewares: [],
       },
      },
      {
        "method": "GET",
        "path": "/articles/category/:category",
        "handler": "article.getArticlesByCategory",
        "config": {
          "policies": []
        }
      },
      {
        method: "GET",
        path: "/articles/:articleId/activities",
        handler: "article.getArticleActivities",
        // config: {
        //   auth: false, // Change this to true if authentication is required
        // },
      },
    ],
  };
  