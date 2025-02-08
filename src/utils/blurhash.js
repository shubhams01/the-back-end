const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { encode } = require("blurhash");

async function generateBlurhash(imagePath) {
  try {
    // console.log('blurhash ', imagePath)
    const imageBuffer = fs.readFileSync(imagePath);
    const image = await sharp(imageBuffer)
      .resize(32, 32) 
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // @ts-ignore
    return encode(image.data, image.info.width, image.info.height, 4, 4);
  } catch (error) {
    console.error("Error generating BlurHash:", error);
    return null;
  }
}

module.exports = { generateBlurhash };
