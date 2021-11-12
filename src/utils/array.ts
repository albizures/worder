export const updateArrayItem = <T>(
	arr: T[],
	index: number,
	item: T,
): T[] => {
	return [].concat(arr.slice(0, index), item, arr.slice(index + 1));
};

export const updateItem = <T>(arr: T[], oldItem: T, item: T): T[] => {
	const index = arr.indexOf(oldItem);
	if (index === -1) {
		return arr;
	}
	return updateArrayItem(arr, index, item);
};

export const removeArrayItem = <T>(arr: T[], index: number): T[] => {
	return [].concat(arr.slice(0, index), arr.slice(index + 1));
};

export const removeItem = <T>(arr: T[], item: T): T[] => {
	const index = arr.indexOf(item);
	if (index === -1) {
		return arr;
	}
	return removeArrayItem(arr, index);
};
