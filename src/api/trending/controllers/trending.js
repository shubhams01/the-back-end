"use strict";

const { caching } = require("../../../plugins/cache/server/services");
// @ts-ignore
const {
  client,
} = require("../../../plugins/cache/server/services/redis-client");

const cacheableResource = caching(
  "trending",
  parseInt(process.env.DEFAULT_CACHE_DURATION)
);

module.exports = {
  fetchTrendingArticles: cacheableResource(async (ctx) => {
    try {
      const limit = ctx.query.limit || 20;

      const cacheKey = "trending";
      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        console.log("Cache HIT Trending! ✅");
        return JSON.parse(cachedData);
      }

      console.log("Cache MISS Trending❌, Fetching from DB");

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

      // Set Cache
      await client.set(cacheKey, JSON.stringify(articlesWithCounts), "EX", 300);

      console.log("✅ Trending Data Cached Successfully!");

      ctx.body = articlesWithCounts.slice(0, limit);
    } catch (err) {
      console.error("Error fetching trending articles:", err);

      ctx.body = {
        message: "An error occurred while fetching trending articles.",
        error: err,
      };
    }
  }),
};
