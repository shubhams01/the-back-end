module.exports = {
  routes: [
    {
      method: "GET",
      path: "/articles/trending",
      handler: "trending.fetchTrendingArticles",
      config: {
        policies: [],
      },
    },
  ],
};
