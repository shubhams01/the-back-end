"use strict";

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
            fields: ["id", "Title", "Slug"],
            populate: {
              image: true,
            },
          }
        );

        // Map through categories to ensure image URLs are included
        const formattedCategories = categories.map((category) => ({
          id: category.id,
          Title: category.Title,
          Slug: category.Slug,
          Image: category.image.formats.large.url,
        }));

        // Send the formatted response
        ctx.body = formattedCategories;
      } catch (err) {
        // Log and return the error message
        console.error("Error fetching categories:", err);
        ctx.body = {gi
  })
);
