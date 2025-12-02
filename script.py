import os
from PIL import Image, ImageDraw, ImageFont

def main():
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)

    # Read cards.json
    with open("cards.json", "r", encoding="utf8") as f:
        lines = [line.strip() for line in f if line.strip()]

    # Load template
    template = Image.open("base.jpeg")

    # Load possible avatar names
    avatar_files = os.listdir("avatars")
    keywords = [
        os.path.splitext(f)[0].replace("_", " ").lower()
        for f in avatar_files
    ]

    # Load font (change path if needed)
    font = ImageFont.truetype("arial.ttf", 48)

    def place_avatars(img, avatars, y):
        """Place one or two avatars at defined positions."""
        avatar_images = []
        for avatar in avatars:
            filename = avatar.replace(" ", "_") + ".jpg"
            path = os.path.join("avatars", filename)
            if os.path.exists(path):
                avatar_images.append(Image.open(path))

        draw_positions = []

        if len(avatar_images) == 1:
            a = avatar_images[0].resize((200, int(200 * avatar_images[0].height / avatar_images[0].width)))
            # top right + bottom left
            img.paste(a, (550, y))
            img.paste(a, (50, y + 250))
        
        elif len(avatar_images) >= 2:
            a1 = avatar_images[0].resize((200, int(200 * avatar_images[0].height / avatar_images[0].width)))
            a2 = avatar_images[1].resize((200, int(200 * avatar_images[1].height / avatar_images[1].width)))

            # avatar1
            img.paste(a1, (550, y))       # top right
            img.paste(a1, (50, y + 250))  # bottom left
            # avatar2
            img.paste(a2, (50, y))        # top left
            img.paste(a2, (550, y + 250)) # bottom right

    for i, line in enumerate(lines):
        topText, bottomText = line.replace('"', "").split(",")

        # Clone template
        img = template.copy()
        draw = ImageDraw.Draw(img)

        # Detect avatar matches
        lt = topText.lower()
        lb = bottomText.lower()

        topAvatars = [k for k in keywords if k in lt]
        bottomAvatars = [k for k in keywords if k in lb]

        # Place avatars
        place_avatars(img, topAvatars, 50)
        place_avatars(img, bottomAvatars, 600)

        # Draw text
        draw.text((80, 180), topText, font=font, fill="white")
        draw.text((80, 700), bottomText, font=font, fill="white")

        # Save output
        filename = f"output/card_{str(i+1).zfill(3)}.jpg"
        img.save(filename, "JPEG")
        print(f"Generated {filename}")

if __name__ == "__main__":
    main()

