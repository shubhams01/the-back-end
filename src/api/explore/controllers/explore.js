"use strict";

// @ts-ignore
const { createCoreController } = require("@strapi/strapi").factories;
const { caching } = require("../../../plugins/cache/server/services");
// @ts-ignore
const {
  client,
} = require("../../../plugins/cache/server/services/redis-client");

const cacheableResource = caching(
  "articles",
  parseInt(process.env.DEFAULT_CACHE_DURATION)
);

module.exports = {
  random: cacheableResource(async (ctx) => {
    try {
      const cacheKey = "articles";
      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        console.log("Cache HIT! ✅");
        return JSON.parse(cachedData);
      }

      console.log("Cache MISS ❌, Fetching from DB");

      const articles = await strapi.entityService.findMany(
        // @ts-ignore
        "api::article.article",
        {
          fields: ["id", "Title", "Slug", "createdAt", "blurhash"],
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
          sort: [{ createdAt: "desc" }],
        }
      );

      const articlesWithCounts = await Promise.all(
        articles.map(async (article) => {
          const likesCount = await strapi.db.query("api::like.like").count({
            where: { article: article.id },
          });

          const commentsCount = await strapi.db
            .query("api::comment.comment")
            .count({
              where: { article: article.id },
            });

          return {
            ...article,
            likesCount,
            commentsCount,
          };
        })
      );

      // Set Cache
      await client.set(cacheKey, JSON.stringify(articlesWithCounts), "EX", 300);

      console.log("✅ Data Cached Successfully!");

      ctx.body = articlesWithCounts;
    } catch (err) {
      console.error("Error fetching recent articles:", err);

      ctx.body = {
        message: "An error occurred while fetching recent articles.",
        error: err,
      };
    }
  }),
};
