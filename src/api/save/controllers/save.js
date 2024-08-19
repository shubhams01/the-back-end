'use strict';

module.exports = {
  async create(ctx) {
    const { article } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to perform this action.');
    }

    try {
      // Check if the save already exists
      const existingSave = await strapi.db.query('api::save.save').findOne({
        where: {
          user: user.id,
          article: article,
        },
      });

      if (existingSave) {
        // If the save exists, remove it
        await strapi.db.query('api::save.save').delete({
          where: {
            id: existingSave.id,
          },
        });

        ctx.body = {
          message: 'Save removed successfully',
        };
      } else {
        // If the save does not exist, create it
        const save = await strapi.db.query('api::save.save').create({
          data: {
            user: user.id,
            article: article,
          },
        });

        ctx.body = save;
      }
    } catch (error) {
      ctx.body = {
        message: 'Error processing save action',
        error: error.message,
      };
    }
  },

  async isSavedByUser(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?.id;

      if (!userId) {
        return (ctx.body = { isSaved: false });
      }

      const isSaved = await strapi.db.query('api::save.save').count({
        where: { article: id, user: userId },
      }) > 0;

      ctx.body = { isSaved };
    } catch (err) {
      console.error('Error checking if article is saved:', err);
      ctx.body = {
        message: 'An error occurred while checking if the article is saved.',
        error: err,
      };
    }
  },

  async getSavedPosts(ctx) {
    try {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized('You must be logged in to perform this action.');
      }

      // Fetch saved posts of the logged-in user
      const savedPosts = await strapi.db.query('api::save.save').findMany({
        where: { user: userId },
        populate: {
          article: {
            fields: ['id', 'Title', 'Slug', 'createdAt'],
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
              Image: true,
            },
          },
        },
      });

      // Format the response
      const formattedSavedPosts = savedPosts.map((save) => ({
        id: save.id,
        article: save.article,
      }));

      ctx.body = formattedSavedPosts;
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      ctx.body = {
        message: 'An error occurred while fetching saved posts.',
        error: err,
      };
    }
  },
};
