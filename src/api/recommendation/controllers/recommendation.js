"use strict";

module.exports = {
  async getRecommendations(ctx) {
    try {
      const user = ctx.state.user; // Authenticated user
      if (!user) {
        return ctx.unauthorized(
          "You must be logged in to access this resource."
        );
      }

      // Fetch the categories or tags of articles the user has liked, saved, or commented on
      const likedArticles = await strapi.db.query("api::like.like").findMany({
        where: { user: user.id },
        populate: { article: true },
      });

      const savedArticles = await strapi.db.query("api::save.save").findMany({
        where: { user: user.id },
        populate: { article: true },
      });

      const commentedArticles = await strapi.db
        .query("api::comment.comment")
        .findMany({
          where: { user: user.id },
          populate: { article: true },
        });

      // Extract unique categories from these articles
      const categories = new Set();
      [...likedArticles, ...savedArticles, ...commentedArticles].forEach(
        (interaction) => {
          if (interaction.article && interaction.article.category) {
            interaction.article.category.forEach((cat) =>
              categories.add(cat.Title)
            );
          }
        }
      );

      // Fetch user interests
      const detailedUser = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          select: ["interests"],
        });

      const interests = detailedUser.interests || [];

      // Combine categories and interests into a single array
      const filterCategories = Array.from(categories).concat(interests);

      // Fetch recommendations based on these categories and interests
      // @ts-ignore
      const recommendedArticles = await strapi.entityService.findMany(
        // @ts-ignore
        "api::article.article",
        {
          filters: {
            category: {
              Title: {
                $in: filterCategories,
              },
            },
          },
          fields: ["id", "Title", "Slug"],
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
              fields: ["Title", "Slug"],
            },
          },
        }
      );

      ctx.body = recommendedArticles;
    } catch (err) {
      ctx.body = {
        message: "Error fetching recommendations",
        error: err.message,
      };
    }
  },
};
