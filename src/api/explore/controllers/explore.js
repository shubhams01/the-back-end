"use strict";

// @ts-ignore
const { createCoreController } = require("@strapi/strapi").factories;

/**
 * A set of functions called "actions" for `explore`
 */

module.exports = {
  // @ts-ignore
  random: async (ctx, next) => {
    try {
      const { limit } = ctx.query;

      // Fetch all articles
      const articles = await strapi.entityService.findMany(
        // @ts-ignore
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
            category: {
              fields: ["Title", "Slug"],
            },
          },
        }
      );

      // Shuffle articles
      const shuffled = articles.sort(() => 0.5 - Math.random());

      // Return limited random articles
      const randomArticles = limit ? shuffled.slice(0, limit) : shuffled;

      // Include the count of likes and comments, and format the response
      const articlesWithCounts = await Promise.all(
        randomArticles.map(async (article) => {
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
            // @ts-ignore
            ...articles,
            likesCount,
            commentsCount,
          };
        })
      );

      // Set the response body
      ctx.body = articlesWithCounts;
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

  // @ts-ignore
  findOne: async (ctx, next) => {
    try {
      const { id } = ctx.params;

      // Fetch the article by ID with specified fields and populate sections, Image, and nested sections
      const article = await strapi.entityService.findOne(
        // @ts-ignore
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
            Image: true,
            category: {
              fields: ["Title", "Slug"],
            },
          },
        }
      );

      if (!article) {
        ctx.body = "No article found";
        return;
      }

      // Include the count of likes and comments
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

      const articleWithCounts = {
        article,
        likesCount,
        commentsCount,
      };

      // Set the response body
      ctx.body = articleWithCounts;
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
