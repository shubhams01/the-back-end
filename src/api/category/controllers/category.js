"use strict";

// @ts-ignore
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  // @ts-ignore
  "api::category.category",
  ({ strapi }) => ({
    async find(ctx) {
      try {
        const categories = await strapi.entityService.findMany(
          // @ts-ignore
          "api::category.category",
          {
            fields: ["id", "Title", "Slug", 'blurhash'],
            populate: {
              image: true,
            },
          }
        );

        const formattedCategories = categories.map((category) => ({
          id: category.id,
          Title: category.Title,
          Slug: category.Slug,
          Image: category.image.formats.large?.url,
          blurhash: category.blurhash,
        }));

        ctx.body = formattedCategories;
      } catch (err) {
        console.error("Error fetching categories:", err);
        ctx.body = {
          message: "An error occurred while fetching categories.",
          error: err.message,
        };
      }
    },
  })
);
