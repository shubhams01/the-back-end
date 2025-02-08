'use strict';

module.exports = {
  fetchTrendingArticles: async (ctx, next) => {
    try {
      // Define the number of trending articles to fetch
      const limit = ctx.query.limit || 10;

      // Fetch articles sorted by views in descending order
      // @ts-ignore
      const trendingArticles = await strapi.entityService.findMany('api::article.article', {
        limit: limit,
        fields: ['id', 'Title', 'Slug', 'blurhash'],
        populate: {
          sections: {
            // fields: ["SectionImageBlurhash"],
            populate: {
              SectionImage: true,
              NestedSections: {
                populate: {
                  // fields: ["NestedSectionImageBlurhash"],
                  NestedSectionImage: true,
                },
              },
            },
          },
          Image: true,
          category: {
            fields: ['Title', 'Slug'],
          }
        },
      });

      // Set the response body
      ctx.body = trendingArticles;
    } catch (err) {
      // Log the error to console
      console.error("Error fetching trending articles:", err);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching trending articles.",
        error: err,
      };
    }
  },
};
