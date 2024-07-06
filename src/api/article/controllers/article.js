"use strict";

/**
 * article controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

//module.exports = createCoreController('api::article.article');

module.exports = {
  findMany: async (ctx, next) => {
    try {
      // Fetch all articles
      const articles = await strapi.entityService.findMany(
        "api::article.article",
        {
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
            category: true,
          },
        }
      );

      ctx.body = articles;
    } catch (err) {
      // Log the error to console
      console.error("Error fetching random articles:", err);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching random articles.",
        error: err,
      };
    }
  },

  findOne: async (ctx, next) => {
    try {
      const { id } = ctx.params;

      // Fetch the article by ID with specified fields and populate sections, Image, and nested sections
      const article = await strapi.entityService.findOne(
        "api::article.article",
        id,
        {
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
          },
        }
      );

      // Set the response body
      if (article) {
        ctx.body = article;
      } else {
        ctx.body = "No article found";
      }
    } catch (err) {
      // Log the error to console
      console.error("Error fetching article:", err);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching the article.",
        error: err,
      };
    }
  },

  getArticlesByCategory: async (ctx, next) => {
    try {
      // Extract category ID from the request parameters
      const { category } = ctx.params;

      // Fetch articles for the specified category
      const articles = await strapi.entityService.findMany(
        "api::article.article",
        {
          filters: {
            category: {
              Title: {
                $containsi: category, // Case-insensitive contains filter
              },
            },
          },
          fields: ["id", "Title", "Slug", "createdAt"],
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
            category: true
          },
        }
      );

      // Set the response body
      ctx.body = articles;
    } catch (err) {
      // Log the error to console
      console.error("Error fetching articles by category:", err);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching articles by category.",
        error: err,
      };
    }
  },
};
