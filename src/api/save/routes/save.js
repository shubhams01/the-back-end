module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/saves',
      handler: 'save.create',
      // config: {
      //   auth: true,
      // },
    },
    {
      method: 'GET',
      path: '/saved/:id',
      handler: 'save.isSavedByUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/saved',
      handler: 'save.getSavedPosts',
      // config: {
      //   auth: {
      //     strategies: ['jwt'],
      //   },
      // },
    },
  ],
};
