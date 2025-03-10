"use strict";

module.exports = {
  async findLoggedInUser(ctx) {
    try {
      const user = ctx.state.user; // This should contain the authenticated user
      if (!user) {
        return ctx.unauthorized(
          "You must be logged in to access this resource."
        );
      }

      // Fetch user details including profile photo
      const detailedUser = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user.id },
          select: ["username", "email", "interests"],
          populate: { profilePhoto: true, interests: true },
        });

      // Format the response
      ctx.body = {
        username: detailedUser.username,
        email: detailedUser.email,
        profilePhoto: detailedUser.profilePhoto
          ? detailedUser.profilePhoto.url
          : null,
        interests: detailedUser.interests || [],
      };
    } catch (err) {
      ctx.body = {
        message: "Error fetching logged-in user details",
        error: err.message,
      };
    }
  },

  async updateProfilePhoto(ctx) {
    try {
      const user = ctx.state.user; // Authenticated user
      if (!user) {
        return ctx.unauthorized(
          "You must be logged in to access this resource."
        );
      }

      const files = ctx.request.files;

      if (!files || !files.profilePhoto) {
        return ctx.badRequest("Profile photo is required.");
      }

      const file = files.profilePhoto;

      // Upload the file
      const uploadedFile = await strapi.plugins[
        "upload"
      ].services.upload.upload({
        data: {},
        files: file,
      });

      // Update user profile photo
      const updatedUser = await strapi
        .query("plugin::users-permissions.user")
        .update({
          where: { id: user.id },
          data: {
            profilePhoto: uploadedFile[0].id,
          },
        });

      ctx.body = {
        message: "Profile photo updated successfully",
        user: {
          username: updatedUser.username,
          email: updatedUser.email,
          profilePhoto: uploadedFile[0].url,
        },
      };
    } catch (err) {
      ctx.body = {
        message: "Error updating profile photo",
        error: err.message,
      };
    }
  },

  // Fetch predefined interests and user-selected interests
  async getInterests(ctx) {
    try {
      const user = ctx.state.user; // Authenticated user
      if (!user) {
        return ctx.unauthorized("You must be logged in to access this resource.");
      }

      const predefinedInterests = ["Arts", "Science", "Culture", "History", "Technology"];

      // Fetch user details including interests
      const detailedUser = await strapi.query("plugin::users-permissions.user").findOne({
        where: { id: user.id },
        select: ["interests"],
      });

      const userInterests = detailedUser.interests || [];

      ctx.body = {
        predefinedInterests,
        userInterests,
      };
    } catch (err) {
      ctx.body = {
        message: "Error fetching interests",
        error: err.message,
      };
    }
  },

  // Update user interests
  async updateInterests(ctx) {
    try {
      const user = ctx.state.user; // Authenticated user
      if (!user) {
        return ctx.unauthorized("You must be logged in to access this resource.");
      }

      const { interests } = ctx.request.body;
      const predefinedInterests = ["Arts", "Science", "Culture", "Travel", "Business", "Technology"];

      // Validate interests
      if (!Array.isArray(interests) || interests.some(interest => !predefinedInterests.includes(interest))) {
        return ctx.badRequest("Invalid interests. Only predefined interests are allowed.");
      }

      // Update user interests
      const updatedUser = await strapi.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data: {
          interests: interests,
        },
      });

      ctx.body = {
        message: "Interests updated successfully",
        interests: updatedUser.interests,
      };
    } catch (err) {
      ctx.body = {
        message: "Error updating interests",
        error: err.message,
      };
    }
  }
};
