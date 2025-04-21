/**
 * Sorts an array of elements based on the result of a provided function.
 *
 * @template T - The type of elements in the array.
 * @param arr - The array to sort.
 * @param getKey - A function that takes an element of type T and returns a number.
 *                  This function will be used to determine the sorting order.
 * @returns A new array that is a sorted version of the input array.
 *          The sorting is done in ascending order based on the numbers returned by the getKey function.
 */
export function toSorted<T>(arr: T[], getKey: (value: T) => number): T[] {
  const result = [...arr];
  result.sort((a, b) => {
    const aNumber = getKey(a);
    const bNumber = getKey(b);
    return aNumber - bNumber;
  });
  return result;
}

/**
 * Generates an array of numbers from 0 to size-1.
 *
 * @param size - The length of the array to be generated.
 * @returns An array of numbers starting from 0 and ending at size-1.
 */
export function range(size: number): number[] {
  return new Array(size).fill(0).map((_, index) => index);
}

/**
 *
 *  Zips two arrays into a new array of tuples.
 *
 * @param arr1 - The first array to be zipped.
 * @param arr2 - The second array to be zipped.
 * @returns
 */
export function zip<T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] {
  return range(Math.min(arr1.length, arr2.length)).map((index) => [
    arr1[index],
    arr2[index],
  ]);
}
