import Color from "color";

export function setColorAlpha(cssColor,alpha=1.0){
    const color = Color(cssColor);
    const originalAlpha = color.alpha();
    const newAlpha = originalAlpha * alpha;
    return color.alpha(newAlpha).rgb().string()
}
  