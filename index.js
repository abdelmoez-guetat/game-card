const fs = require("fs");
const sharp = require("sharp");

async function main() {
  try {
    const outputDir = "output";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const lines = fs.readFileSync("cards.json", "utf8").split("\n").filter(Boolean);

    const baseImage = await sharp("base.jpeg").toBuffer();

    const avatarFiles = fs.readdirSync("avatars");
    const avatars = {};
    for (const file of avatarFiles) {
      const keyword = file.replace(/\.jpe?g/i, "").replace(/_/g, " ");
      const imagePath = `avatars/${file}`;
      avatars[keyword] = await sharp(imagePath).resize(146, 140).toBuffer();
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [topText, bottomText] = line.replace(/"/g, "").split(",");

      const foundKeywords = [...new Set(Object.keys(avatars).filter(keyword => line.includes(keyword)))];

      const compositeOps = [];

      if (foundKeywords.length === 1) {
        const avatarBuffer = avatars[foundKeywords[0]];
        compositeOps.push({ input: avatarBuffer, top: 18, left: 508 });
        compositeOps.push({ input: avatarBuffer, top: 880, left: 18 });
      } else if (foundKeywords.length >= 2) {
        const avatarBuffer1 = avatars[foundKeywords[0]];
        compositeOps.push({ input: avatarBuffer1, top: 18, left: 508 });
        compositeOps.push({ input: avatarBuffer1, top: 880, left: 18 });

        const avatarBuffer2 = avatars[foundKeywords[1]];
        compositeOps.push({ input: avatarBuffer2, top: 18, left: 18 });
        compositeOps.push({ input: avatarBuffer2, top: 880, left: 508 });
      }

      const createTextSvg = (text, width, height) => {
          return `
          <svg width="${width}" height="${height}">
              <style>
              .title { fill: white; font-size: 32px; font-family: Arial, sans-serif; }
              </style>
              <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="title">${text}</text>
          </svg>`;
      };

      compositeOps.push({
          input: Buffer.from(createTextSvg(topText, 600, 100)),
          top: 180,
          left: 80,
      });
      compositeOps.push({
          input: Buffer.from(createTextSvg(bottomText, 600, 100)),
          top: 700,
          left: 80,
      });

      const filename = `output/card_${String(i + 1).padStart(3, '0')}.jpg`;
      await sharp(baseImage)
        .composite(compositeOps)
        .toFile(filename);

      console.log(`Generated ${filename}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
