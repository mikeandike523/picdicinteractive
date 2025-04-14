import os
from PIL import Image
import click
import tkinter as tk
from tkinter import filedialog
import sys


@click.command()
@click.argument(
    "input_image", required=False, type=click.Path(exists=True), default=None
)
@click.option(
    "--pick",
    help="Open a file picker to select an image.",
    required=False,
    default=False,
    is_flag=True,
)
def cli(input_image=None, pick=False):
    if pick and input_image is not None:
        raise click.BadParameter("Cannot specify both input_image and pick.")

    if input_image is None and not pick:
        raise click.UsageError("Either input_image or pick must be provided.")

    if pick:
        root = tk.Tk()
        root.withdraw()  # Hide the main window
        input_image = filedialog.askopenfilename(
            initialdir=os.getcwd(),
            title="Select an image file",
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")],
        )
        if not input_image:  # User canceled the file selection
            print("No file selected / dialog canceled.")
            sys.exit(0)  # Exit quietly

    image = Image.open(input_image)
    width, height = image.size
    print(f"{width}x{height}")


if __name__ == "__main__":
    cli()
