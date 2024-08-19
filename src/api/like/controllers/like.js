'use strict';

module.exports = {
  async create(ctx) {
    const { article } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in to perform this action.");
    }

    try {
      // Check if the like already exists
      const existingLike = await strapi.db.query("api::like.like").findOne({
        where: {
          user: user.id,
          article: article,
        },
      });

      if (existingLike) {
        // If the like exists, remove it
        await strapi.db.query("api::like.like").delete({
          where: {
            id: existingLike.id,
          },
        });

        ctx.body = {
          message: "Like removed successfully",
        };
      } else {
        // If the like does not exist, create it
        const like = await strapi.db.query("api::like.like").create({
          data: {
            user: user.id,
            article: article,
          },
        });

        ctx.body = like;
      }
    } catch (error) {
      ctx.body = {
        message: "Error processing like action",
        error: error.message,
      };
    }
  },

  async isLikedByUser(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?.id;

      if (!userId) {
        return (ctx.body = { isLiked: false });
      }

      const isLiked = await strapi.db.query("api::like.like").count({
        where: { article: id, user: userId },
      }) > 0;

      ctx.body = { isLiked };
    } catch (err) {
      console.error("Error checking if article is liked:", err);
      ctx.body = {
        message: "An error occurred while checking if the article is liked.",
        error: err,
      };
    }
  },

  async getLikedPosts(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("You must be logged in to perform this action.");
      }

      // Fetch liked posts of the logged-in user
      const likedPosts = await strapi.db.query("api::like.like").findMany({
        where: { user: userId },
        populate: {
          article: {
            fields: ["id", "Title", "Slug", "createdAt"],
            populate: {
              // sections: {
              //   populate: {
              //     SectionImage: true,
              //     NestedSections: {
              //       populate: {
              //         NestedSectionImage: true,
              //       },
              //     },
              //   },
              // },
              category: true,
              Image: true,
            },
          },
        },
      });

      // Format the response
      const formattedLikedPosts = likedPosts.map((like) => ({
        id: like.id,
        article: like.article,
      }));

      ctx.body = formattedLikedPosts;
    } catch (err) {
      console.error("Error fetching liked posts:", err);
      ctx.body = {
        message: "An error occurred while fetching liked posts.",
        error: err,
      };
    }
  },
};
