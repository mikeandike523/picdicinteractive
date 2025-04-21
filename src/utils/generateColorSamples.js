function range(length) {
  return new Array(length).fill().map((_, i) => i);
}

function linspace(start, stop, num) {
  return range(num).map((i) => start + (i * (stop - start)) / (num - 1));
}

function leftLinspace(start, stop, num) {
  return linspace(start, stop, num + 1).slice(1);
}

function formatHSLA(h, s, l, a = 1) {
  if (a === 1) {
    return `hsl(${h}, ${s}%, ${l}%)`;
  } else {
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  }
}

function isTrueInteger(num) {
  return Math.floor(num) === num;
}

export default function generateColorSamples({
  numH,
  numS,
  numL,
  numA = 1,
  hueOffset = 0,
}) {
  if (numH <= 1 || !isTrueInteger(numH)) {
    throw new Error("numH must be a positive integer > 1");
  }

  if (numS <= 1 || !isTrueInteger(numS)) {
    throw new Error("numS must be a positive integer > 1");
  }

  if (numL <= 1 || !isTrueInteger(numL)) {
    throw new Error("numL must be a positive integer > 1");
  }

  if (numA < 1 || !isTrueInteger(numA)) {
    throw new Error("numA must be a positive integer >= 1");
  }

  const linspaceHue = leftLinspace(0, 360, numH).map(
    (h) => (h + hueOffset) % 360
  );
  const linspaceSaturation = linspace(0, 1, numS);
  const linspaceLightness = linspace(0, 1, numL);

  return linspaceHue.map((h) => {
    return linspaceSaturation.map((s) => {
      return linspaceLightness.map((l) => {
        if (numA > 1) {
          const linspaceAlpha = linspace(0, 1, numA);
          return linspaceAlpha.map((a) => formatHSLA(h, s * 100, l * 100, a));
        }
        return formatHSLA(h, s * 100, l * 100);
      });
    });
  });
}
