import { atom, selector } from 'recoil';
import type { Word } from './types';
import { findSimilarWords } from './utils/words';

export const wordIndexAtom = atom<number | undefined>({
	key: 'words:index',
	default: undefined,
});

export const wordsAtom = atom<Word[]>({
	key: 'words',
	default: [],
});

export const currentWordAtom = selector({
	key: 'words:word',
	get: ({ get }) => {
		const index = get(wordIndexAtom);
		if (!Number.isInteger(index)) {
			return undefined;
		}
		const words = get(wordsAtom);
		const word = words[index];

		return word;
	},
});

export const similarWordsAtom = selector({
	key: 'words:similar',
	get: ({ get }) => {
		const words = get(wordsAtom);
		const word = get(currentWordAtom);

		return word ? findSimilarWords(word, words) : [];
	},
});
