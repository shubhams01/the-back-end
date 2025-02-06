"use strict";

// @ts-ignore
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  // @ts-ignore
  "api::category.category",
  ({ strapi }) => ({
    async find(ctx) {
      try {
        // Fetch all categories with id, Title, Slug, and associated image
        const categories = await strapi.entityService.findMany(
          // @ts-ignore
          "api::category.category",
          {
            fields: ["id", "Title", "Slug", "description"],
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
          description: category.description,
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
