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
      avatars[keyword] = await sharp(imagePath).resize(200).toBuffer();
    }

    for (let i = 0; i < lines.length; i++) {
      const [topText, bottomText] = lines[i].replace(/"/g, "").split(",");

      const topAvatars = Object.keys(avatars).filter(keyword => topText.includes(keyword));
      const bottomAvatars = Object.keys(avatars).filter(keyword => bottomText.includes(keyword));

      const compositeOps = [];

      const addAvatarsToComposite = (avatarKeywords, y) => {
          if (avatarKeywords.length === 1) {
              const avatarBuffer = avatars[avatarKeywords[0]];
              compositeOps.push({ input: avatarBuffer, top: y, left: 550 });
              compositeOps.push({ input: avatarBuffer, top: y + 250, left: 50 });
          } else if (avatarKeywords.length >= 2) {
              const avatarBuffer1 = avatars[avatarKeywords[0]];
              compositeOps.push({ input: avatarBuffer1, top: y, left: 550 });
              compositeOps.push({ input: avatarBuffer1, top: y + 250, left: 50 });

              const avatarBuffer2 = avatars[avatarKeywords[1]];
              compositeOps.push({ input: avatarBuffer2, top: y, left: 50 });
              compositeOps.push({ input: avatarBuffer2, top: y + 250, left: 550 });
          }
      }

      addAvatarsToComposite(topAvatars, 50);
      addAvatarsToComposite(bottomAvatars, 600);

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
