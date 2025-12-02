const fs = require("fs");
const Jimp = require("jimp");

async function main() {
  const lines = fs.readFileSync("cards.json", "utf8").split("\n").filter(Boolean);

  const template = await Jimp.read("base.jpeg");
  const fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const fontBlack = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  for (let i = 0; i < lines.length; i++) {
    const [topText, bottomText] = lines[i].replace(/"/g, "").split(",");

    const img = template.clone();

    // --- Detect which image to use based on text ---
    let icon = null;
    if (/EL FON/.test(lines[i])) icon = "FON.jpg";
    if (/EL LOUZ/.test(lines[i])) icon = "LOUZ.jpg";
    if (/EL BASH/.test(lines[i])) icon = "BASH.jpg";

    if (icon) {
      const iconImg = await Jimp.read(icon);
      iconImg.resize(200, Jimp.AUTO);
      // draw the icon inside upper white area
      img.composite(iconImg, 50, 50);
    }

    // --- Draw text ---
    img.print(fontWhite, 80, 180, topText, 600);   // RED AREA
    img.print(fontWhite, 80, 700, bottomText, 600); // BLACK AREA

    await img.writeAsync(`output/card_${i + 1}.png`);
    console.log(`Generated card_${i + 1}.png`);
  }
}

main();

