import React from 'react';
import {
	useRecoilCallback,
	useRecoilState,
	useSetRecoilState,
} from 'recoil';
import hotkeys from 'hotkeys-js';
import { Word, TopWords } from '../types';
import { removeItem } from '../utils/array';
import { Button } from '../components/Button';
import { SimilarWords } from '../components/SimilarWords';
import { getWords } from '../utils/words';
import { wordsAtom, wordIndexAtom } from '../atoms';
import { getDataFromLocalStorage, saveLocalStorage } from '../utils';
import { redoCallback, undoCallback } from '../state/history';

interface FullListProps {
	words: Word[];
	currentIndex: number;
	onSelectWord: (index: number) => void;
	saveToCommon: (index: number) => void;
	removeWord: (index: number) => void;
}

const FullList: React.FC<FullListProps> = (props) => {
	const {
		words,
		currentIndex,
		onSelectWord,
		saveToCommon,
		removeWord,
	} = props;
	return (
		<div
			className="flex relative h-full p-2"
			style={{ maxHeight: 999 }}
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

const Uploader = () => {
	const setWords = useSetRecoilState(wordsAtom);
	const [text, setText] = React.useState('');
	const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log(e.target.files);

		const file = e.target.files[0];

		const text = await file.text();

		setText(text);
	};
	React.useEffect(() => {
		setWords(getWords(text));
	}, [text]);

	return (
		<>
			<label htmlFor="file" className="inset-0 fixed">
				<span className="absolute flex items-center m-3 inset-0 border-gray-400 border-2 border-dashed">
					Drop a file text here
				</span>
				<input
					onChange={onChange}
					type="file"
					id="file"
					className="opacity-0 absolute inset-0 w-full"
				/>
			</label>
		</>
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

	const onSelectWord = (word: number) => {
		setIndex(word);
	};

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

	if (words.length === 0) {
		return <Uploader />;
	}

	return (
		<div className="flex fixed flex-col">
			<div>
				<span>Number of words: {words.length}</span>
				<Button color="blue" onClick={onDownload}>
					download
				</Button>
			</div>
			<div className="flex">
				<FullList
					onSelectWord={onSelectWord}
					currentIndex={currentIndex}
					words={words}
					saveToCommon={saveToCommon}
					removeWord={removeWord}
				/>
				<SimilarWords />
			</div>
		</div>
	);
};

export default Simple;
