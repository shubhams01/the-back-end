"use strict";

module.exports = {
  async create(ctx) {
    const { articleId, content } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in to perform this action.");
    }

    // Check if the article exists
    const article = await strapi.entityService.findOne(
      // @ts-ignore
      "api::article.article",
      articleId
    );
    if (!article) {
      return ctx.badRequest("Article not found.");
    }

    // Create the comment
    // @ts-ignore
    const comment = await strapi.entityService.create("api::comment.comment", {
      data: {
        article: articleId,
        content,
        user: user.id // Save only the user ID
      },
      populate: { user: true } // Ensure user is populated
    });

    ctx.body = {
      id: comment.id,
      content: comment.content,
      user: {
        id: comment.user.id,
        username: comment.user.username
      }
    };
  },

  async findByArticle(ctx) {
    const { articleId } = ctx.params;

    // Fetch comments for the given article
    const comments = await strapi.entityService.findMany(
      // @ts-ignore
      "api::comment.comment",
      {
        filters: { article: articleId },
        populate: { user: true }
      }
    );

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      user: {
        id: comment.user.id,
        username: comment.user.username
      }
    }));

    ctx.body = formattedComments;
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { content } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in to perform this action.");
    }

    // Fetch the comment
    const comment = await strapi.entityService.findOne(
      // @ts-ignore
      "api::comment.comment",
      id,
      { populate: { user: true } } // Ensure user is populated
    );

    if (!comment) {
      return ctx.notFound("Comment not found.");
    }

    // Check if the comment belongs to the user
    if (comment.user.id !== user.id) {
      return ctx.unauthorized("You can only edit your own comments.");
    }

    // Update the comment
    const updatedComment = await strapi.entityService.update(
      // @ts-ignore
      "api::comment.comment",
      id,
      {
        data: {
          content
        },
        populate: { user: true } // Ensure user is populated
      }
    );

    ctx.body = {
      id: updatedComment.id,
      content: updatedComment.content,
      user: {
        id: updatedComment.user.id,
        username: updatedComment.user.username
      }
    };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in to perform this action.");
    }

    // Fetch the comment
    const comment = await strapi.entityService.findOne(
      // @ts-ignore
      "api::comment.comment",
      id,
      { populate: { user: true } } // Ensure user is populated
    );

    if (!comment) {
      return ctx.notFound("Comment not found.");
    }

    // Check if the comment belongs to the user
    if (comment.user.id !== user.id) {
      return ctx.unauthorized("You can only delete your own comments.");
    }

    // Delete the comment
    // @ts-ignore
    await strapi.entityService.delete("api::comment.comment", id);

    ctx.body = { message: "Comment deleted successfully." };
  }
};
