/**
 * Panel rendered next to the list of words
 * filled with similiar words, with the ability to:
 * - merge words
 * - make a words the main one
 * - delete words
 * - add a word to common words
 *
 * @module
 */

import { useRecoilValue, useRecoilCallback } from 'recoil';
import {
	currentWordAtom,
	similarWordsAtom,
	wordIndexAtom,
} from '../atoms';
import {
	ActionItemType,
	CallbackParams,
	SimilarWord,
	Word,
} from '../types';
import { Button } from './Button';
import { createActionHandlers, historyState } from '../state/history';

const mergeCallback = (params: CallbackParams) => {
	const { set, snapshot, reset } = params;
	const { applyAction } = createActionHandlers(set, reset, snapshot);
	return async (main: number, secundary: number) => {
		const action = {
			type: ActionItemType.MergeWord,
			payload: {
				main,
				secundary,
			},
		};
		const reverseAction = await applyAction([action]);

		set(historyState, ({ past }) => ({
			past: [...past, reverseAction],
			future: [],
		}));
	};
};

const removeCallback = (params: CallbackParams) => {
	const { set, snapshot, reset } = params;
	const { applyAction } = createActionHandlers(set, reset, snapshot);
	return async (index: number) => {
		const action = {
			type: ActionItemType.RemoveWord,
			payload: {
				index,
			},
		};

		const reverseAction = await applyAction([action]);

		set(historyState, ({ past }) => ({
			past: [...past, reverseAction],
			future: [],
		}));
	};
};

const SimilarItem: React.FC<SimilarWord> = (word) => {
	const merge = useRecoilCallback(mergeCallback, []);
	const remove = useRecoilCallback(removeCallback, []);
	const currentIndex = useRecoilValue(wordIndexAtom);

	const onMerge = () => {
		merge(currentIndex, word.index);
	};

	const onMakeMain = () => {
		merge(word.index, currentIndex);
	};

	const onSaveToCommon = () => {};
	const onRemove = () => {
		remove(word.index);
	};

	return (
		<li key={word.word}>
			{word.word.slice(0, word.word.length - word.offset)}
			<span className="text-gray-300">
				{word.word.slice(word.word.length - word.offset)}
			</span>
			<Button onClick={onMerge}>merge</Button>
			<Button onClick={onMakeMain}>main</Button>
			<Button onClick={onSaveToCommon} color="green">
				+
			</Button>{' '}
			<Button onClick={onRemove} color="red">
				x
			</Button>
		</li>
	);
};

export const SimilarWords: React.FC = () => {
	const currentWord = useRecoilValue(currentWordAtom);
	const similar = useRecoilValue(similarWordsAtom);

	if (!currentWord) {
		return (
			<div className="border-l py-1 px-2">
				<span>no word selected</span>
			</div>
		);
	}

	return (
		<div className="border-l py-1 px-2">
			<span>word:</span>{' '}
			<span className="font-bold">{currentWord.word}</span>
			<p className="white">
				<a
					className="text-blue-400 underline"
					target="_blank"
					href={`https://translate.yandex.ru/?lang=ru-en&text=${currentWord.word}`}
				>
					translation
				</a>{' '}
				<a
					className="text-blue-400 underline"
					target="_blank"
					href={`https://cooljugator.com/ru/${currentWord.word}`}
				>
					verb
				</a>{' '}
				<a
					className="text-blue-400 underline"
					target="_blank"
					href={`https://cooljugator.com/run/${currentWord.word}`}
				>
					noun
				</a>{' '}
				<a
					className="text-blue-400 underline"
					target="_blank"
					href={`https://cooljugator.com/rua/${currentWord.word}`}
				>
					adjectives
				</a>
			</p>
			<ul>
				{similar.map((word, index) => {
					return <SimilarItem key={index} {...word} />;
				})}
			</ul>
		</div>
	);
};
