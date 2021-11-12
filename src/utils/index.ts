import { TopWords } from '../types';

let timeout = null;
export const saveLocalStorage = (data: TopWords) => {
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		localStorage.setItem('top-words', JSON.stringify(data));
	}, 5 * 1000);
};

export const getDataFromLocalStorage = (): TopWords => {
	return (
		(JSON.parse(
			localStorage.getItem('top-words'),
		) as TopWords | null) || {
			words: [],
			common: [],
		}
	);
};
