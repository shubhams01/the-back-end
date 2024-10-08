"use strict";

/**
 * article controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::article.article", ({ strapi }) => ({
  async findMany(ctx) {
    try {
      // Get the current logged-in user ID
      const userId = ctx.state.user?.id;

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

      // Include the count of likes and comments
      const articlesWithCounts = await Promise.all(
        articles.map(async (article) => {
          const likesCount = await strapi.db.query("api::like.like").count({
            // @ts-ignore
            where: { article: article.id },
          });

          const commentsCount = await strapi.db.query("api::comment.comment").count({
            // @ts-ignore
            where: { article: article.id },
          });

          const isLiked = userId
            ? (await strapi.db.query("api::like.like").count({
                // @ts-ignore
                where: { article: article.id, user: userId },
              })) > 0
            : false;

          const isSaved = userId
            ? (await strapi.db.query("api::save.save").count({
                // @ts-ignore
                where: { article: article.id, user: userId },
              })) > 0
            : false;

          return {
            // @ts-ignore
            ...article,
            likesCount,
            commentsCount,
            isLiked,
            isSaved,
          };
        })
      );

      ctx.body = articlesWithCounts;
    } catch (err) {
      // Log the error to console
      console.error("Error fetching articles:", err);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching articles.",
        error: err,
      };
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?.id;

      // Fetch the article by ID with specified fields and populate sections, Image, likes, comments, and nested sections
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
              category: true,
            },
          },
        }
      );

      // Include the count of likes and comments
      const likesCount = await strapi.db.query("api::like.like").count({
        // @ts-ignore
        where: { article: article.id },
      });

      const commentsCount = await strapi.db.query("api::comment.comment").count({
        // @ts-ignore
        where: { article: article.id },
      });

      const isLiked = userId
        ? (await strapi.db.query("api::like.like").count({
            // @ts-ignore
            where: { article: article.id, user: userId },
          })) > 0
        : false;

      const isSaved = userId
        ? (await strapi.db.query("api::save.save").count({
            // @ts-ignore
            where: { article: article.id, user: userId },
          })) > 0
        : false;

      const articleWithCounts = {
        // @ts-ignore
        ...article,
        likesCount,
        commentsCount,
        isLiked,
        isSaved,
      };

      // Set the response body
      if (article) {
        ctx.body = articleWithCounts;
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

  async getArticlesByCategory(ctx) {
    try {
      // Extract category ID from the request parameters
      const { category } = ctx.params;
      const userId = ctx.state.user?.id;

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
              fields: ['Title', 'Slug'],
            }
          },
        }
      );

      // Include the count of likes and comments
      const articlesWithCounts = await Promise.all(
        articles.map(async (article) => {
          const likesCount = await strapi.db.query("api::like.like").count({
            // @ts-ignore
            where: { article: article.id },
          });

          const commentsCount = await strapi.db.query("api::comment.comment").count({
            // @ts-ignore
            where: { article: article.id },
          });

          const isLiked = userId
            ? (await strapi.db.query("api::like.like").count({
                // @ts-ignore
                where: { article: article.id, user: userId },
              })) > 0
            : false;

          const isSaved = userId
            ? (await strapi.db.query("api::save.save").count({
                // @ts-ignore
                where: { article: article.id, user: userId },
              })) > 0
            : false;

          return {
            // @ts-ignore
            ...article,
            likesCount,
            commentsCount,
            isLiked,
            isSaved,
          };
        })
      );

      // Set the response body
      ctx.body = articlesWithCounts;
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

  async getArticleActivities(ctx) {
    try {
      const { articleId } = ctx.params;
      const userId = ctx.state.user?.id;

      // Fetch likes and comments counts
      const likesCount = await strapi.db.query("api::like.like").count({
        where: { article: articleId },
      });

      const commentsCount = await strapi.db.query("api::comment.comment").count({
        where: { article: articleId },
      });

      let isLiked = false;
      let isSaved = false;

      if (userId) {
        isLiked = await strapi.db.query("api::like.like").count({
          where: { article: articleId, user: userId },
        }) > 0;

        isSaved = await strapi.db.query("api::save.save").count({
          where: { article: articleId, user: userId },
        }) > 0;
      }

      const articleActivities = {
        likesCount,
        commentsCount,
        isLiked,
        isSaved,
      };

      // Set the response body
      ctx.body = articleActivities;
    } catch (err) {
      // Log the error to console
      console.error("Error fetching article activities:", err);

      // Set the response body to the error message
      ctx.body = {
        message: "An error occurred while fetching the article activities.",
        error: err,
      };
    }
  },
  
}));