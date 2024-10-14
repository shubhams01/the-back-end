"use strict";

module.exports = {
  // @ts-ignore
  random: async (ctx) => {
    try {
      const { limit } = ctx.query;

      // Fetch trending articles
      const articlesList = await strapi.entityService.findMany('api::article.article', {
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
          },
        },
      });

      // Map through the articles to format the response
      const formattedArticles = articlesList.map(article => ({
        id: article.id,
        title: article.Title,
        slug: article.Slug,
        category: article.category ? article.category.Title : null,
        imageUrl: article.Image[0]?.formats?.large?.url || null,
      }));

      // Set the response body
      ctx.body = formattedArticles;
    } catch (error) {
      // Log the error to console
      console.error("Error fetching trending articles:", error);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching trending articles.",
        error: error.message || error,
      };
    }
  },
};
