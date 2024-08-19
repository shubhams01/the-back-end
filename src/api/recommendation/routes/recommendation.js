module.exports = {
  routes: [
    {
      method: "GET",
      path: "/recommendations",
      handler: "recommendation.getRecommendations",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
