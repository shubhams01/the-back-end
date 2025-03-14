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
  random: async (ctx) => {
    try {
      let { page, pageSize } = ctx.query;
      page = parseInt(page, 10) || 1; // Default page = 1
      pageSize = parseInt(pageSize, 25) || 25; // Default page size = 10

      const start = (page - 1) * pageSize;
      const cacheKey = `articles_page_${page}_size_${pageSize}`; // Unique cache key per page

      // const flush = client.flushAll();
      // console.log('flushed ', flush)
      console.log("cacheKey:", cacheKey);
      // Check if this specific page is cached
      const cachedData = await client.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT! ✅ Page ${page}`);
        ctx.body = JSON.parse(cachedData);
        return;
      }

      console.log(`Cache MISS ❌ Page ${page}, Fetching from DB`);

      // Fetch paginated articles
      const [articles, totalItems] = await Promise.all([
        strapi.db.query("api::article.article").findMany({
          select: ["id", "Title", "Slug", "createdAt", "blurhash"],
          populate: {
            sections: {
              populate: {
                SectionImage: true,
                NestedSections: {
                  populate: { NestedSectionImage: true },
                },
              },
            },
            Image: true,
            category: { select: ["Title", "Slug"] },
          },
          orderBy: { createdAt: "desc" },
          offset: start, // Offset for pagination
          limit: pageSize, // Limit per page
        }),
        strapi.db.query("api::article.article").count(), // Total count
      ]);

      const totalPages = Math.ceil(totalItems / pageSize);

      // Fetch likes & comments counts for each article
      const articlesWithCounts = await Promise.all(
        articles.map(async (article) => {
          const [likesCount, commentsCount] = await Promise.all([
            strapi.db.query("api::like.like").count({
              where: { article: article.id },
            }),
            strapi.db.query("api::comment.comment").count({
              where: { article: article.id },
            }),
          ]);

          return { ...article, likesCount, commentsCount };
        })
      );

      const response = {
        data: articlesWithCounts,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };

      // Cache this page separately
      await client.set(cacheKey, JSON.stringify(response), "EX", 300); // Cache expires in 5 min

      console.log(`✅ Cached Page ${page} Successfully!`);

      ctx.body = response;
    } catch (err) {
      console.error("Error fetching paginated articles:", err);

      ctx.body = {
        message: "An error occurred while fetching articles.",
        error: err,
      };
    }
  },
};
