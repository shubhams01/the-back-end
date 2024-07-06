module.exports = {
  routes: [
    {
      method: "GET",
      path: "/articles/latest",
      handler: "latest.fetchLatestFromEachCategory",
      config: {
        policies: [],
      },
    },
  ],
};