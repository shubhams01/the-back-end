const path = require("path");
// @ts-ignore
const { generateBlurhash } = require("../../../../utils/blurhash");
const { redisClient } = require("../../../../plugins/cache/server/services");

module.exports = {
  async afterCreate(event) {
    const data = event.result;
    console.log("Article Created event", data.Image[0]?.url);

    const articleId = data.id;

    // Process Main Article Image
    let coverBlurhash = null;
    if (data.Image && data.Image.length > 0) {
      const imagePath = path.join(strapi.dirs.static.public, data.Image[0].url);
      coverBlurhash = await generateBlurhash(imagePath);
      console.log("Cover image blurHash: ", coverBlurhash);
    }

    // Process Sections and Nested Sections
    if (data.sections && data.sections.length > 0) {
      // @ts-ignore
      await processSections(articleId, data.sections, coverBlurhash);
    } else {
      // If no sections exist, update only the cover blurhash
      await strapi.entityService.update("api::article.article", articleId, {
        data: { blurhash: coverBlurhash },
      });
    }
  },

  async afterUpdate(event) {
    const data = event.result;
    console.log("Article Updated event", data.Image[0]?.url);

    const articleId = data.id;

    // Process Main Article Image
    let coverBlurhash = null;
    if (data.Image && data.Image.length > 0) {
      const imagePath = path.join(strapi.dirs.static.public, data.Image[0].url);
      coverBlurhash = await generateBlurhash(imagePath);
      console.log("Cover image blurHash: ", coverBlurhash);
    }

    // Process Sections and Nested Sections
    if (data.sections && data.sections.length > 0) {
      // @ts-ignore
      await processSections(articleId, data.sections, coverBlurhash);
    } else {
      // If no sections exist, update only the cover blurhash
      await strapi.entityService.update("api::article.article", articleId, {
        data: { blurhash: coverBlurhash },
      });
    }

    // Caching
    const { result } = event;
    // Invalidate cache when article is updated
    const cacheKey = `article:${result.id}`;
    await redisClient.del(cacheKey);
  },

  async afterDelete(event) {
    const { result } = event;
    // Invalidate cache when article is deleted
    const cacheKey = `article:${result.id}`;
    await redisClient.del(cacheKey);
  },
};

// @ts-ignore
async function processSections(articleId, sections, coverBlurhash) {
  try {
    const updatedSections = await Promise.all(
      // @ts-ignore
      sections.map(async (section) => {
        let updatedSection = { ...section };

        // Section Image
        if (section?.SectionImage) {
          console.log("Processing section image:", section?.SectionImage?.url);
          const sectionImagePath = path.join(
            strapi.dirs.static.public,
            section?.SectionImage?.url
          );
          const blurhash = await generateBlurhash(sectionImagePath);
          console.log("Generated section blurhash:", section.id, blurhash);
          if (blurhash) {
            updatedSection.SectionImageBlurhash = blurhash;
          }
        }

        // Nested Sections
        if (
          Array.isArray(section.NestedSections) &&
          section.NestedSections.length > 0
        ) {
          const updatedNestedSections = await Promise.all(
            section.NestedSections.map(async (nestedSection) => {
              let updatedNestedSection = { ...nestedSection };

              if (nestedSection?.NestedSectionImage) {
                console.log(
                  "Processing nested section image:",
                  nestedSection?.NestedSectionImage?.url
                );
                const nestedSectionImagePath = path.join(
                  strapi.dirs.static.public,
                  nestedSection.NestedSectionImage.url
                );
                const nestedBlurhash = await generateBlurhash(
                  nestedSectionImagePath
                );
                console.log(
                  "Generated nested section blurhash:",
                  nestedSection.id,
                  nestedBlurhash
                );
                if (nestedBlurhash) {
                  updatedNestedSection.NestedSectionImageBlurhash =
                    nestedBlurhash;
                }
              }

              return updatedNestedSection;
            })
          );

          updatedSection.NestedSections = updatedNestedSections;
        }

        return updatedSection;
      })
    );

    // Update the article with modified sections and cover blurhash
    // @ts-ignore
    await strapi.entityService.update("api::article.article", articleId, {
      data: {
        sections: updatedSections,
        // @ts-ignore
        blurhash: coverBlurhash,
      },
    });

    console.log(
      "Sections, NestedSections, and Cover Image Blurhash updated successfully"
    );
  } catch (error) {
    console.error("Error updating sections:", error);
  }
}
