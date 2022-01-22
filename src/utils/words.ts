import type { Word, WordsMap, SimilarWord } from '../types';
import { removeItem } from './array';

const pronouns = [
	'мне',
	'меня',
	'мной',
	'ты',
	'тебе',
	'тебя',
	'тобой',
	'он',
	'него',
	'ему',
	'его',
	'им',
	'ним',
	'нём',
	'нем',
	'она',
	'её',
	'ее',
	'неё',
	'нее',
	'ей',
	'ней',
	'мы',
	'нас',
	'нам',
	'нами',
	'вы',
	'вас',
	'вам',
	'вами',
	'они',
	'них',
	'им',
	'их',
	'ими',
	'ними',
	// possessive
	'мой',
	'твой',
	'наш',
	'ваш',
	'моё',
	'мое',
	'моя',
	'мои',
	'моего',
	'моему',
	'моим',
	'мою',
	'моими',
	'моём',
	'моем',
	'моей',
	'моих',
	'твоё',
	'твое',
	'твоя',
	'твои',
	'твоего',
	'твоих',
	'твоему',
	'твоё',
	'твое',
	'твою',
	'твоим',
	'твоими',
	'твоём',
	'твоем',
	'твоей',
	'наш',
	'наша',
	'наши',
	'нашего',
	'нашему',
	'наше',
	'нашу',
	'нашим',
	'нашими',
	'нашем',
	'нашей',
	'наших',
	'ваш',
	'ваша',
	'ваши',
	'вашего',
	'вашему',
	'ваше',
	'вашу',
	'вашим',
	'вашими',
	'вашем',
	'вашей',
	'ваших',
	'свой',
	'своё',
	'свое',
	'своя',
	'свои',
	'своего',
	'своему',
	'свою',
	'своим',
	'своими',
	'своём',
	'своем',
	'своей',
	'своих',
	'сама',
	'сами',
	'сам',
	'саму',
	'само',
	'самого',
	'самому',
	'самим',
	'самими',
	'самой',
	'самом',
	'самих',
	'себя',
	'себой',
	'себе',
	'эта',
	'это',
	'эти',
	'этот',
	'эту',
	'этого',
	'этому',
	'этим',
	'этими',
	'этой',
	'этом',
	'этих',
	'та',
	'тот',
	'ту',
	'то',
	'те',
	'той',
	'того',
	'тому',
	'тем',
	'теми',
	'том',
	'тех',
	'вся',
	'весь',
	'всю',
	'всё',
	'все',
	'всего',
	'всему',
	'всем',
	'всеми',
	'всей',
	'всём',
	'всем',
	'всех',
	'что',
	'чего',
	'чему',
	'чем',
	'чём',
	'кто',
	'кого',
	'кому',
	'кем',
	'ком',
];

const common = [
	'да',
	'до',
	'обо',
	'об',
	'во',
	'или',
	'но',
	'на',
	'по',
	'за',
	'они',
	'нет',
	'ещё',
	'еще',
	'только',
	'не',
	'из',
	'бы',
	'там',
	'было',
	'был',
	'была',
	'без',
	'чего',
	'как',
	'если',
	'про',
	'тоже',
	'от',
	'чтобы',
	'под',
	'при',
	'есть',
	'же',
].concat(pronouns);

export const sortByUsage = (a: Word, b: Word) => b.usages - a.usages;

export const getWords = (text: string, ignore = []): Word[] => {
	const map = text
		.trim()
		.replace('\n', ' ')
		.replace(/[\(\)\[\]\'\"\!\?\…\:\№\–\-,.\;\?«»\n]/g, '')
		.replace(/,/g, '')
		.replace(/[\n\t\s]/g, ' ')
		.toLowerCase()
		.split(' ')
		.filter((word) => {
			return (
				word.trim().length > 1 &&
				!Number.isInteger(Number(word)) &&
				!common.includes(word) &&
				!ignore.includes(word)
			);
		})
		.reduce((prev, current) => {
			if (!prev[current]) {
				prev[current] = {
					word: current,
					usages: 0,
				};
			}

			prev[current].usages += 1;

			return prev;
		}, {} as WordsMap);

	return Object.values(map).sort(sortByUsage);
};

export const findSimilarWords = (
	word: Word,
	words: Word[],
): SimilarWord[] => {
	const len = word.word.length;

	const offsetWords: SimilarWord[] = [];
	let leftWords: Word[] = removeItem(words, word);

	for (let offset = 1; offset < len; offset++) {
		let currentWords: Word[] = [].concat(leftWords);
		const currentLen = word.word.length - offset;

		for (let index = 0; index < leftWords.length; index++) {
			const current = leftWords[index];
			const part1 = word.word.substring(0, currentLen);
			const part2 = current.word.substring(0, currentLen);

			if (word !== current && part1.indexOf(part2) === 0) {
				offsetWords.push({
					...current,
					offset: current.word.length - part2.length - 1,
					index: words.indexOf(current),
				});

				currentWords = removeItem(currentWords, current);
			}
		}

		leftWords = currentWords;

		if (leftWords.length === 0) {
			break;
		}
	}

	return offsetWords;
};
