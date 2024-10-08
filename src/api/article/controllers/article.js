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
          Image: true,
          category: true,
        },
      });

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
            ...articles,
            // @ts-ignore
            id: article.id,
            // @ts-ignore
            title: article.Title,
            // @ts-ignore
            slug: article.Slug,
            // @ts-ignore
            category: article.category?.Title || null,
            // @ts-ignore
            imageUrl: article.Image?.[0]?.formats?.large?.url || null,
            likesCount,
            commentsCount,
            isLiked,
            isSaved,
          };
        })
      );

      ctx.body = articlesWithCounts;
    } catch (err) {
      console.error("Error fetching articles:", err);
      ctx.body = { message: "An error occurred while fetching articles.", error: err };
    }
  },

  async findOne(ctx) {
    try {
        const { id } = ctx.params;
        const userId = ctx.state.user?.id;

        // Fetch the article by ID
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
            Image: true,
            category: true,
          },
        });

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

        // Filter to include only large images
        const articleWithCounts = {
            // @ts-ignore
            ...article,
            likesCount,
            commentsCount,
            isLiked,
            isSaved,
        };

        ctx.send(articleWithCounts);
    } catch (error) {
        ctx.throw(500, error);
    }
}
,

  async getArticlesByCategory(ctx) {
    try {
      const { category } = ctx.params;
      const userId = ctx.state.user?.id;

      // Fetch articles by category
      const articles = await strapi.entityService.findMany("api::article.article", {
        filters: {
          category: { Title: { $containsi: category } },
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
          category: { fields: ["Title", "Slug"] },
        },
      });

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
            id: article.id,
            // @ts-ignore
            title: article.Title,
            // @ts-ignore
            slug: article.Slug,
            // @ts-ignore
            category: article.category?.Title || null,
            // @ts-ignore
            imageUrl: article.Image?.[0]?.formats?.large?.url || null,
            likesCount,
            commentsCount,
            isLiked,
            isSaved,
          };
        })
      );

      ctx.body = articlesWithCounts;
    } catch (err) {
      console.error("Error fetching articles by category:", err);
      ctx.body = { message: "An error occurred while fetching articles by category.", error: err };
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

      const isLiked = userId
        ? (await strapi.db.query("api::like.like").count({
            where: { article: articleId, user: userId },
          })) > 0
        : false;

      const isSaved = userId
        ? (await strapi.db.query("api::save.save").count({
            where: { article: articleId, user: userId },
          })) > 0
        : false;

      const articleActivities = {
        likesCount,
        commentsCount,
        isLiked,
        isSaved,
      };

      ctx.body = articleActivities;
    } catch (err) {
      console.error("Error fetching article activities:", err);
      ctx.body = { message: "An error occurred while fetching the article activities.", error: err };
    }
  },
}));
