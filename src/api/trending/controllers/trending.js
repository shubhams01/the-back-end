"use strict";

module.exports = {
  fetchTrendingArticles: async (ctx, next) => {
    try {
      // Define the number of trending articles to fetch
      const limit = ctx.query.limit || 20;

      // Fetch articles sorted by views in descending order
      // @ts-ignore
      const trendingArticles = await strapi.entityService.findMany(
        "api::article.article",
        {
          limit: limit,
          fields: ["id", "Title", "Slug", "blurhash"],
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
              fields: ["Title", "Slug"],
            },
          },
        }
      );

      const articlesWithCounts = await Promise.all(
        trendingArticles.map(async (article) => {
          const likesCount = await strapi.db.query("api::like.like").count({
            // @ts-ignore
            where: { article: article.id },
          });

          const commentsCount = await strapi.db
            .query("api::comment.comment")
            .count({
              // @ts-ignore
              where: { article: article.id },
            });

          return {
            ...article,
            likesCount,
            commentsCount,
            totalEngagement: likesCount + commentsCount, 
          };
        })
      );

      articlesWithCounts.sort((a, b) => b.totalEngagement - a.totalEngagement);

      ctx.body = articlesWithCounts.slice(0, limit);
    } catch (err) {
      console.error("Error fetching trending articles:", err);

      ctx.body = {
        message: "An error occurred while fetching trending articles.",
        error: err,
      };
    }
  },
};
