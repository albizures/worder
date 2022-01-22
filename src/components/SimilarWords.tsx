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
import React from 'react';
import {
	useRecoilValue,
	useRecoilCallback,
	useSetRecoilState,
} from 'recoil';
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
import diciojs from 'dicionario.js';
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

interface WordInfo {
	class: string;
	meanings: string;
	etymology: string;
}

export const SimilarWords: React.FC = () => {
	const currentWord = useRecoilValue(currentWordAtom);
	const similar = useRecoilValue(similarWordsAtom);
	const setIndex = useSetRecoilState(wordIndexAtom);
	const [info, setInfo] = React.useState<WordInfo>();

	const onClose = () => {
		setIndex(undefined);
	};

	console.log(info);

	React.useEffect(() => {
		if (currentWord) {
			diciojs.significado(currentWord.word).then((info: WordInfo) => {
				setInfo(info);
			});
		}
	}, [currentWord]);

	if (!currentWord) {
		return null;
	}

	const normalizedWord = currentWord.word
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

	return (
		<div className="sticky top-10">
			<div className="flex justify-between">
				<div>
					<span>word:</span>{' '}
					<span className="font-bold">{currentWord.word}</span>
				</div>
				<div>
					<button
						onClick={onClose}
						className="border rounded px-3 py-1 m-1 text-red-300"
					>
						x
					</button>
				</div>
			</div>
			{info && (
				<>
					<p>Type: {info.class}</p>
					<details>
						<summary>Meanings</summary>
						<p>{info.meanings}</p>
					</details>
					<details>
						<summary>Etymology</summary>
						<p>{info.etymology}</p>
					</details>
				</>
			)}
			<p className="white">
				<a
					className="text-blue-400 underline mr-1"
					href={`https://www.dicio.com.br/${encodeURIComponent(
						normalizedWord,
					)}/`}
					target="_blank"
				>
					dictionary
				</a>
				<a
					className="text-blue-400 underline mr-1"
					href={`https://translate.google.com/?sl=pt&tl=es&text=${encodeURIComponent(
						currentWord.word,
					)}&op=translate`}
					target="_blank"
				>
					translation
				</a>
				<a
					className="text-blue-400 underline"
					href={`https://www.conjugacao.com.br/busca.php?q=${encodeURIComponent(
						currentWord.word,
					)}`}
					target="_blank"
				>
					conjugation
				</a>
				{/* <a
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
				</a> */}
			</p>
			<ul>
				{similar.map((word, index) => {
					return <SimilarItem key={index} {...word} />;
				})}
			</ul>
		</div>
	);
};
