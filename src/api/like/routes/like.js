module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/likes',
      handler: 'like.create',
      // config: {
      //   auth: true,
      // },
    },
    {
      method: 'GET',
      path: '/liked/:id',
      handler: 'like.isLikedByUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/liked',
      handler: 'like.getLikedPosts',
      // config: {
      //   auth: {
      //     strategies: ['jwt'],
      //   },
      // },
    },
  ],
};
