'use strict';

const { createCoreController } = require("@strapi/strapi").factories;

/**
 * A set of functions called "actions" for `explore`
 */

module.exports = {
  random: async (ctx, next) => {
    try {
      const { limit } = ctx.query;

      // Fetch all articles
      const articles = await strapi.entityService.findMany("api::article.article", {
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
      });

      // Shuffle articles
      const shuffled = articles.sort(() => 0.5 - Math.random());

      // Return limited random articles
      const randomArticles = limit ? shuffled.slice(0, limit) : shuffled;

      // Set the response body
      ctx.body = randomArticles;
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
      const article = await strapi.entityService.findOne("api::article.article", id, {
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
          category: true,
        },
      });

      // Set the response body
      if(article) {
        
        ctx.body = article;
      }
      else {
        ctx.body = "No article found"
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
};
