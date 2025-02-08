"use strict";

// @ts-ignore
const { createCoreController } = require("@strapi/strapi").factories;

/**
 * A set of functions called "actions" for `explore`
 */

module.exports = {
  random: async (ctx, next) => {
    try {
      // Fetch all articles sorted from recent to old
      const articles = await strapi.entityService.findMany(
        // @ts-ignore
        "api::article.article",
        {
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
          sort: [{ createdAt: "desc" }],
        }
      );



      // Include the count of likes and comments
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

      ctx.body = articlesWithCounts;
    } catch (err) {
      console.error("Error fetching recent articles:", err);

      ctx.body = {
        message: "An error occurred while fetching recent articles.",
        error: err,
      };
    }
  },

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
        where: { article: article.id },
      });

      const commentsCount = await strapi.db
        .query("api::comment.comment")
        .count({
          where: { article: article.id },
        });

      const articleWithCounts = {
        ...article,
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
