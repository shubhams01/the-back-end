'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/user/me',
      handler: 'user.findLoggedInUser',
      // config: {
      //   policies: ['plugins::users-permissions.isAuthenticated'],
      // },
    },
    {
      method: 'PUT',
      path: '/user/profile-photo',
      handler: 'user.updateProfilePhoto',
      // config: {
      //   policies: ['plugins::users-permissions.isAuthenticated'],
      //   middlewares: [],
      // },
    },
    {
      "method": "GET",
      "path": "/user/interests",
      "handler": "user.getInterests",
      // "config": {
      //   "policies": ["global::isAuthenticated"]
      // }
    },
    {
      "method": "PUT",
      "path": "/user/interests",
      "handler": "user.updateInterests",
      // "config": {
      //   "policies": ["global::isAuthenticated"]
      // }
    }
  ],
};
