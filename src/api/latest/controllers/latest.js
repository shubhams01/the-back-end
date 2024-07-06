'use strict';

module.exports = {
  fetchLatestFromEachCategory: async (ctx, next) => {
    try {
      // Fetch all categories
      const categories = await strapi.entityService.findMany('api::category.category', {
        fields: ['id', 'Title'],
      });

      // Initialize an array to hold the latest articles
      const latestArticles = [];

      // Fetch the latest article for each category
      for (const category of categories) {
        const latestArticle = await strapi.entityService.findMany('api::article.article', {
          filters: { category: category.id },
          sort: { createdAt: 'desc' },
          limit: 1,
          fields: ['id', 'Title', 'Slug', 'createdAt'],
          populate: {
            // sections: {
            //   populate: {
            //     SectionImage: true,
            //     NestedSections: {
            //       populate: {
            //         NestedSectionImage: true,
            //       },
            //     },
            //   },
            // },
            Image: true,
            category: true
          },
        });

        if (latestArticle.length > 0) {
          latestArticles.push({
            // category: category.Title,
            ...latestArticle[0],
          });
        }
      }

      // Set the response body
      ctx.body = latestArticles;
    } catch (err) {
      // Log the error to console
      console.error("Error fetching latest articles from each category:", err);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching the latest articles from each category.",
        error: err,
      };
    }
  },
};
