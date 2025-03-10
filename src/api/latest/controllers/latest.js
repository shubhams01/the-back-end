"use strict";

const { caching } = require("../../../plugins/cache/server/services");
// @ts-ignore
const {
  client,
} = require("../../../plugins/cache/server/services/redis-client");

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
        console.log("Cache HIT Latest ! ✅");
        return JSON.parse(cachedData);
      }

      console.log("Cache MISS Latest ❌, Fetching from DB");

      // @ts-ignore
      const categories = await strapi.entityService.findMany(
        "api::category.category",
        {
          fields: ["id", "Title"],
        }
      );

      // Initialize an array to hold the latest articles
      const latestArticles = [];

      // Fetch the latest article for each category
      for (const category of categories) {
        // @ts-ignore
        const latestArticle = await strapi.entityService.findMany(
          "api::article.article",
          {
            filters: { category: category.id },
            sort: { createdAt: "desc" },
            limit: 1,
            fields: ["id", "Title", "Slug", "createdAt", "blurhash"],
            populate: {
              sections: {
                // fields: ["SectionImageBlurhash"],
                populate: {
                  SectionImage: true,
                  NestedSections: {
                    // fields: ["NestedSectionImageBlurhash"],
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

        if (latestArticle.length > 0) {
          latestArticles.push({
            // @ts-ignore
            categoryTitle: category.Title,
            categorySlug: category.Slug,
            ...latestArticle[0],
          });
        }
      }

      // Set Cache
      await client.set(cacheKey, JSON.stringify(latestArticles), "EX", 300);

      console.log("✅Latest Data Cached Successfully!");

      ctx.body = latestArticles;
    } catch (err) {
      // Log the error to console
      console.error("Error fetching latest articles from each category:", err);

      // Set the response body to the error message
      ctx.body = {
        message:
          "An error occurred while fetching the latest articles from each category.",
        error: err,
      };
    }
  }),
};
