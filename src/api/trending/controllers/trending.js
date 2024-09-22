'use strict';

module.exports = {
  fetchTrendingArticles: async (ctx, next) => {
    try {
      // Define the number of trending articles to fetch
      const limit = ctx.query.limit || 10;

      // Fetch articles sorted by views in descending order
      const trendingArticles = await strapi.entityService.findMany('api::article.article', {
        limit: limit,
        fields: ['id', 'Title', 'Slug'],
        populate: {
          sections: {
            populate: {
              SectionImage: true,
              NestedSections: {
                populate: {
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

      // Map through the articles to format the response
      const formattedTrendingArticles = trendingArticles.map(article => ({
        id: article.id,
        title: article.Title,
        slug: article.Slug,
        category: article.category ? article.category.Title : null,
        imageUrl: article.Image[0].formats.large?.url,
      }));

      // Set the response body
      ctx.body = formattedTrendingArticles;
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
