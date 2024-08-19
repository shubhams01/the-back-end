module.exports = {
  routes: [
    {
      method: "POST",
      path: "/comments",
      handler: "comment.create",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/comments/article/:articleId",
      handler: "comment.findByArticle",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/comments/:id",
      handler: "comment.update",
      config: {
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/comments/:id",
      handler: "comment.delete",
      config: {
        policies: [],
      },
    },
  ],
};
