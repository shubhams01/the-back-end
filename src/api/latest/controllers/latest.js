"use strict";

const { caching } = require("../../../plugins/cache/server/services");
// @ts-ignore
const { client } = require("../../../plugins/cache/server/services/redis-client");

const cacheableResource = caching(
  "latest",
  parseInt(process.env.DEFAULT_CACHE_DURATION)
);

module.exports = {
  // @ts-ignore
  fetchLatestFromEachCategory: cacheableResource(async (ctx, next) => {
    try {
      const cacheKey = "latest";
      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        console.log("Cache HIT Latest! ✅");
        ctx.body = JSON.parse(cachedData);
        return;
      }

      console.log("Cache MISS Latest ❌, Fetching from DB");

      const categories = await strapi.entityService.findMany("api::category.category", {
        fields: ["id", "Title", "Slug"],
      });

      const latestArticles = await Promise.all(
        categories.map(async (category) => {
          const latestArticle = await strapi.entityService.findMany("api::article.article", {
            filters: { category: category.id },
            sort: { createdAt: "desc" },
            limit: 1,
            fields: ["id", "Title", "Slug", "createdAt", "blurhash"],
            populate: {
              sections: {
                populate: {
                  SectionImage: true,
                  NestedSections: { populate: { NestedSectionImage: true } },
                },
              },
              Image: true,
              category: { fields: ["Title", "Slug"] },
            },
          });

          if (latestArticle.length === 0) return null;

          const article = latestArticle[0];

          const [likeCount, commentCount] = await Promise.all([
            strapi.db.query("api::like.like").count({ where: { article: article.id } }),
            strapi.db.query("api::comment.comment").count({ where: { article: article.id } }),
          ]);

          return {
            categoryTitle: category.Title,
            categorySlug: category.Slug,
            ...article,
            likeCount,
            commentCount,
          };
        })
      );

      const filteredArticles = latestArticles.filter((article) => article !== null);

      // Set Cache
      await client.set(cacheKey, JSON.stringify(filteredArticles), "EX", 300);

      console.log("✅ Latest Data Cached Successfully!");

      ctx.body = filteredArticles;
    } catch (err) {
      console.error("Error fetching latest articles from each category:", err);
      ctx.body = {
        message: "An error occurred while fetching the latest articles from each category.",
        error: err,
      };
    }
  }),
};
