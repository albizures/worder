import React from 'react';
import { useSetRecoilState } from 'recoil';
import { getWords } from '../utils/words';
import { wordsAtom } from '../atoms';

export const Uploader = () => {
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
