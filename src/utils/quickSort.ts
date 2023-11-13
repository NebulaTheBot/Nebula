type Corresponding = [...any[]] | null;

// Swap the values
function swap(sortItems: number[], corresponding: Corresponding, leftIndex: number, rightIndex: number) {
  let temp = sortItems[leftIndex];
  sortItems[leftIndex] = sortItems[rightIndex];
  sortItems[rightIndex] = temp;

  // Swap the corresponding values
  if (!corresponding) return;
  for (let i = 0; i < corresponding.length; i++) {
    let subArray = corresponding[i];

    if (Array.isArray(subArray)) {
      // Swap the corresponding sub-array values
      let tempValue = subArray[leftIndex];
      subArray[leftIndex] = subArray[rightIndex];
      subArray[rightIndex] = tempValue;
    }
  }
}

// Partition the array
function partition(sortItems: number[], corresponding: Corresponding, leftIndex: number, rightIndex: number): number {
  let pivot: number = sortItems[Math.floor((rightIndex + leftIndex) / 2)], // middle element
    leftPointer: number = leftIndex, // left pointer
    rightPointer: number = rightIndex; // right pointer

  while (leftPointer <= rightPointer) {
    while (sortItems[leftPointer] < pivot) leftPointer++;
    while (sortItems[rightPointer] > pivot) rightPointer--;

    if (leftPointer <= rightPointer) {
      swap(sortItems, corresponding, leftPointer, rightPointer); // swapping two elements
      leftPointer++;
      rightPointer--;
    }
  }

  return leftPointer;
}

/**
 * Sorts an array of items and returns the sorted items and corresponding items
 * @param sortItems The items to sort
 * @param corresponding The corresponding items to sort, but linked to the exact index of the sortItems array (input [[...], [...], ...]) (Optional)
 * @param leftIndex The left index of the sortItems array
 * @param rightIndex The right index of the sortItems array
 * @returns The sorted items and corresponding items
 */
// Initialize the quicksort function
export default function quickSort(
  sortItems: number[],
  corresponding: Corresponding,
  leftIndex: number,
  rightIndex: number
): [number[], Corresponding] {
  let index: number;

  if (sortItems.length > 1) {
    index = partition(sortItems, corresponding, leftIndex, rightIndex); // index returned from partition

    if (leftIndex < index - 1) {
      // more elements on the left side of the pivot
      quickSort(sortItems, corresponding, leftIndex, index - 1);
    }

    if (index < rightIndex) {
      // more elements on the right side of the pivot
      quickSort(sortItems, corresponding, index, rightIndex);
    }
  }

  return [sortItems, corresponding]; // Return both sorted items and corresponding array
}
