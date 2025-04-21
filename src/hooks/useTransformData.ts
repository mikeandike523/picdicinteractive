import { useCallback, useMemo } from "react";

interface Annotation {
  // x, y, w, h
  bbox: [number, number, number, number];
  text: string;
}

interface JsonData {
  page_image: string;
  width: number;
  height: number;
  annotations: Annotation[];
}

export default function useTransformJsonData(
  data: JsonData | null,
  fn?: (word: string) => string
) {
  const defaultFn = useCallback((word: string) => word.toLowerCase(), []);

  const usedFn = fn ?? defaultFn;

  return useMemo(() => {
    if (!data) {
      return null;
    }
    const dataCopy = { ...data };
    dataCopy.annotations = dataCopy.annotations.map(
      (annotation: Annotation) => ({
        ...annotation,
        text: usedFn(annotation.text),
      })
    );
    return dataCopy as JsonData;
  }, [data, usedFn]);
}
