import os
import json
import shutil
from typing import OrderedDict
from PIL import Image

ANNOTATIONS_PATH = os.path.realpath("data-to-reformat/output_json")
IMAGES_PATH = os.path.realpath("data-to-reformat/collinsdic_images")

OUTPUT_IMAGES_PATH = os.path.realpath("public/pages/images")
OUTPUT_ANNOTATIONS_PATH = os.path.realpath("public/pages/annotations")

pagelist_path = os.path.join("public", "pages", "pageList.json")

def clear_folder(folder_path):
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
    os.makedirs(folder_path, exist_ok=True)

def get_image_width_height(image_path):
    image = Image.open(image_path)
    width, height = image.size
    return width, height

clear_folder(OUTPUT_IMAGES_PATH)
clear_folder(OUTPUT_ANNOTATIONS_PATH)

page_paths = {}

for filename in os.listdir(ANNOTATIONS_PATH):
    if not filename.endswith(".json"):
        continue
    full_pagename = os.path.splitext(filename)[0]
    page_number_str = full_pagename.split("_")[-1]
    page_number = int(page_number_str)

    page_paths[page_number] = {
        "image": os.path.join(IMAGES_PATH, f"{full_pagename}.png"),
        "annotations": os.path.join(ANNOTATIONS_PATH, filename),
    }

for page_number, page_info in sorted(page_paths.items(), key=lambda x: x[0]):
    image_path = page_info["image"]
    annotations_path = page_info["annotations"]
    print(f"Processing page {page_number}...")
    with open(annotations_path, "r", encoding="utf-8") as f:
        annotations_data = json.load(f)
    del annotations_data["page_image"]
    image_width, image_height = get_image_width_height(image_path)
    annotations_data["width"] = image_width
    annotations_data["height"] = image_height
    output_annotations_filename = os.path.join(OUTPUT_ANNOTATIONS_PATH, f"{page_number}.json")
    output_image_filename = os.path.join(OUTPUT_IMAGES_PATH, f"{page_number}.png")
    shutil.copy(image_path, output_image_filename)
    with open(output_annotations_filename, "w", encoding="utf-8") as f:
        json.dump(annotations_data, f, indent=2)

with open(pagelist_path, "w", encoding="utf-8") as f:
    #  to be manually filled
    pagelist_with_titles = OrderedDict()
    for key in sorted(page_paths.keys()):
        pagelist_with_titles[key]=""
    json.dump(pagelist_with_titles, f, indent=2)