from PIL import Image, ImageDraw, ImageFont
import json
import random

# Example JSON data (usually you'd load this from a file)
with open("public/page_006.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Load image
image = Image.open("public/"+data["page_image"]).convert("RGB")
draw = ImageDraw.Draw(image)

# Draw annotations
for ann in data["annotations"]:
    x, y, w, h = ann["bbox"]
    text = ann["text"]
    
    # Generate a random color
    color = (255,0,0)

    # Draw rectangle
    draw.rectangle([x, y, x + w, y + h], outline=color, width=3)

# Save or show image
image.save("public/page_006_debug.png")
