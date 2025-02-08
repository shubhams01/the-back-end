const path = require("path");
// @ts-ignore
const { generateBlurhash } = require("../../../../utils/blurhash");

module.exports = {

  async afterCreate(event) {
    const data = event.result;
    console.log("category create event", data.image);

    const categoryId = data.id;

    let coverBlurhash = null;
    if (data.image) {
      const imagePath = path.join(strapi.dirs.static.public, data.image.url);
      console.log("Category image path: ", imagePath);
      coverBlurhash = await generateBlurhash(imagePath);
      console.log("Category create image blurHash: ", coverBlurhash);
      await strapi.entityService.update("api::category.category", categoryId, {
        data: { blurhash: coverBlurhash },
      });
    }
  },
  
  async afterUpdate(event) {
    const data = event.result;
    console.log("category Updated event", data.image);

    const categoryId = data.id;

    let coverBlurhash = null;
    if (data.image) {
      const imagePath = path.join(strapi.dirs.static.public, data.image.url);
      console.log("Category image path: ", imagePath);
      coverBlurhash = await generateBlurhash(imagePath);
      console.log("Category updated image blurHash: ", coverBlurhash);
      await strapi.entityService.update("api::category.category", categoryId, {
        data: { blurhash: coverBlurhash },
      });
    }
  },
};
