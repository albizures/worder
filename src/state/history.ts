import {
	atom,
	ResetRecoilState,
	SetRecoilState,
	Snapshot,
} from 'recoil';
import {
	ActionHistory,
	Action,
	CallbackParams,
	ActionItemType,
	MergeWord,
	UnMergeWord,
	HistoryAtoms,
	Word,
	RemoveWord,
	AddWord,
} from '../types';
import { saveLocalStorage } from '../utils';
import { sortByUsage } from '../utils/words';
import { updateItem, removeItem } from '../utils/array';
import { wordIndexAtom, wordsAtom } from '../atoms';

export const historyAtoms: HistoryAtoms = {};

export const historyState = atom<ActionHistory>({
	key: 'history',
	default: {
		past: [],
		future: [],
	},
});

export const createActionHandlers = (
	set: SetRecoilState,
	reset: ResetRecoilState,
	snapshot: Snapshot,
) => {
	const merge = async (data: MergeWord) => {
		const { main, secundary } = data;

		const words = await snapshot.getPromise(wordsAtom);

		const currentWord = words[main];
		const word = words[secundary];
		const updateWord: Word = {
			...currentWord,
			usages: currentWord.usages + word.usages,
		};

		const update = removeItem(
			updateItem(words, currentWord, updateWord),
			word,
		).sort(sortByUsage);

		const newIndex = update.indexOf(updateWord);
		set(wordIndexAtom, newIndex);

		saveLocalStorage({
			words: update,
			common: [],
		});

		set(wordsAtom, update);

		return {
			type: ActionItemType.UnMergeWord,
			payload: {
				...word,
				main: newIndex,
				secundary,
			},
		};
	};

	const unMerge = async (data: UnMergeWord) => {
		const { main, word, usages } = data;

		const words = await snapshot.getPromise(wordsAtom);

		const currentWord = words[main];
		const updateWordWord: Word = {
			...currentWord,
			usages: words[main].usages - usages,
		};

		const secundaryWord = {
			word,
			usages,
		};

		const update = updateItem(words, currentWord, updateWordWord)
			.concat(secundaryWord)
			.sort(sortByUsage);

		set(wordsAtom, update);

		const mainIndex = update.indexOf(updateWordWord);
		const secundary = update.indexOf(secundaryWord);

		return {
			type: ActionItemType.MergeWord,
			payload: {
				main: mainIndex,
				secundary,
			},
		};
	};

	const removeWord = async (data: RemoveWord) => {
		const { index } = data;
		const words = await snapshot.getPromise(wordsAtom);
		const currentIndex = await snapshot.getPromise(wordIndexAtom);

		const word = words[index];
		const updateWords = removeItem(words, word);

		set(wordsAtom, updateWords);

		if (index === currentIndex) {
			set(wordIndexAtom, null);
		}

		saveLocalStorage({
			words: updateWords,
			common: [],
		});

		return {
			type: ActionItemType.AddWord,
			payload: {
				...word,
			},
		};
	};

	const addWord = async (data: AddWord) => {
		const { usages, word } = data;
		const words = await snapshot.getPromise(wordsAtom);

		const newWord: Word = {
			usages,
			word,
		};
		const updateWords = words.concat(newWord).sort(sortByUsage);

		set(wordsAtom, updateWords);

		saveLocalStorage({
			words: updateWords,
			common: [],
		});

		return {
			type: ActionItemType.AddWord,
			payload: {
				...newWord,
			},
		};
	};

	const applyAction = async (action: Action) => {
		const newAction: Action = [];
		for (let i = 0; i < action.length; i++) {
			const item = action[i];

			if (item.type === ActionItemType.MergeWord) {
				newAction.push(await merge(item.payload as MergeWord));
			} else if (item.type === ActionItemType.UnMergeWord) {
				newAction.push(await unMerge(item.payload as UnMergeWord));
			} else if (item.type === ActionItemType.RemoveWord) {
				newAction.push(await removeWord(item.payload as RemoveWord));
			} else if (item.type === ActionItemType.AddWord) {
				newAction.push(await addWord(item.payload as AddWord));
			}
		}

		return newAction.reverse();
	};

	return {
		merge,
		unMerge,
		removeWord,
		addWord,
		applyAction,
	};
};

// Undo and redo work using two separeted arrays, past and future.
// When a new action is made a "reverse action" is created
// and added it into the past array.
// Then if the user undo their action the reverse action is applied
// and an "anti reserse action" is created and added it into the future array
export const undoCallback = ({
	set,
	snapshot,
	reset,
}: CallbackParams) => {
	const { applyAction } = createActionHandlers(set, reset, snapshot);

	return async () => {
		const { past } = await snapshot.getPromise(historyState);
		if (past.length == 0) {
			return;
		}

		const reverseAction = await applyAction(past[past.length - 1]);

		set(historyState, ({ past, future }) => ({
			past: past.slice(0, past.length - 1),
			future: [reverseAction, ...future],
		}));
	};
};

export const redoCallback = ({
	set,
	snapshot,
	reset,
}: CallbackParams) => {
	const { applyAction } = createActionHandlers(set, reset, snapshot);

	return async () => {
		const { future } = await snapshot.getPromise(historyState);

		if (future.length === 0) {
			return;
		}

		const reverseAction = await applyAction(future[0]);

		set(historyState, ({ future, past }) => ({
			past: [...past, reverseAction],
			future: future.slice(1),
		}));
	};
};
