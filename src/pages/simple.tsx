import React from 'react';
import {
	useRecoilCallback,
	useRecoilState,
	useRecoilValue,
} from 'recoil';
import hotkeys from 'hotkeys-js';
import { Word, TopWords } from '../types';
import { removeItem } from '../utils/array';
import { Button } from '../components/Button';
import { SimilarWords } from '../components/SimilarWords';
import { Uploader } from '../components/Uploader';
import { wordsAtom, wordIndexAtom } from '../atoms';
import { getDataFromLocalStorage, saveLocalStorage } from '../utils';
import { redoCallback, undoCallback } from '../state/history';
import classNames from 'classnames';

interface FullListProps {
	saveToCommon: (index: number) => void;
	removeWord: (index: number) => void;
}

const FullList: React.FC<FullListProps> = (props) => {
	const { removeWord, saveToCommon } = props;
	const words = useRecoilValue<Word[]>(wordsAtom);
	const [currentIndex, setIndex] = useRecoilState(wordIndexAtom);

	const onSelectWord = (word: number) => {
		setIndex(word);
	};

	console.log(currentIndex);

	return (
		<div
			className={classNames('relative h-full p-2', {
				hidden: Number.isInteger(currentIndex),
			})}
		>
			<div className="overflow-y-auto">
				<ul>
					{words.map((word, index) => {
						return (
							<li
								key={word.word}
								className={
									index === currentIndex ? 'bg-gray-200' : ''
								}
							>
								<button onClick={() => onSelectWord(index)}>
									{word.word}({word.usages})
								</button>
								<Button
									onClick={() => saveToCommon(index)}
									color="green"
								>
									+
								</Button>
								<Button onClick={() => removeWord(index)} color="red">
									x
								</Button>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

const Simple = () => {
	const [common, setCommon] = React.useState([]);
	const undo = useRecoilCallback(undoCallback, []);
	const redo = useRecoilCallback(redoCallback, []);
	const [words, setWords] = useRecoilState<Word[]>(wordsAtom);
	const [currentIndex, setIndex] = useRecoilState(wordIndexAtom);

	React.useEffect(() => {
		const undoHandler = () => {
			undo();
			return false;
		};
		const redoHandler = () => {
			redo();
			return false;
		};

		hotkeys('ctrl+z,command+z', undoHandler);
		hotkeys('ctrl+shift+z,command+shift+z', redoHandler);

		return () => {
			hotkeys.unbind('ctrl+z,command+z', undoHandler);
			hotkeys.unbind('ctrl+shift+z,command+shift+z', redoHandler);
		};
	}, [undo, redo]);

	React.useEffect(() => {
		const { words, common } = getDataFromLocalStorage();

		setWords(words);
		setCommon(common);
	}, []);

	const saveToCommon = (index: number) => {
		const word = words[index];
		const updateWords = removeItem(words, word);
		const updateCommon = common.concat(word);

		setWords(updateWords);
		setCommon(updateCommon);
		if (index === currentIndex) {
			setIndex(null);
		}

		saveLocalStorage({
			words: updateWords,
			common: updateCommon,
		});
	};

	const removeWord = (index: number) => {
		const word = words[index];
		const updateWords = removeItem(words, word);

		setWords(updateWords);
		if (index === currentIndex) {
			setIndex(null);
		}

		saveLocalStorage({
			words: updateWords,
			common: common,
		});
	};

	const onDownload = () => {
		const data: TopWords = {
			words,
			common,
		};
		const link = document.createElement('a');

		link.href =
			'data:text/json;charset=utf-8,' +
			encodeURIComponent(JSON.stringify(data));
		link.download = 'data.json';
		link.click();
	};

	const onClean = () => {};

	if (words.length === 0) {
		return <Uploader />;
	}

	return (
		<div className="">
			<div className="sticky top-0 bg-white z-10 p-2 shadow">
				<p>Number of words: {words.length}</p>
				<Button color="blue" onClick={onDownload}>
					download
				</Button>
				<Button color="blue" onClick={onClean}>
					clean
				</Button>
			</div>
			<div>
				<FullList
					saveToCommon={saveToCommon}
					removeWord={removeWord}
				/>
				<SimilarWords />
			</div>
		</div>
	);
};

export default Simple;
