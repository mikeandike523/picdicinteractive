export type ColorSampleArray<NumA extends number> = NumA extends 1
  ? string[][][]
  : string[][][][];

export default function generateColorSamples<NumA extends number>({
  numH,
  numS,
  numL,
  numA,
}: {
  numH: number;
  numS: number;
  numL: number;
  numA?: NumA;
}): ColorSampleArray<NumA>;

export type GenerateColorSamplesFunction = typeof generateColorSamples;
