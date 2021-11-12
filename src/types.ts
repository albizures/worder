import {
	Snapshot,
	SetRecoilState,
	ResetRecoilState,
	atomFamily,
	RecoilState,
} from 'recoil';

export interface CallbackParams {
	snapshot: Snapshot;
	set: SetRecoilState;
	reset: ResetRecoilState;
}

interface ActionItemPayload {}

export enum ActionItemType {
	MergeWord = 'MergeWord',
	UnMergeWord = 'UnMergeWord',
	RemoveWord = 'RemoveWord',
	AddWord = 'AddWord',
}

export interface MergeWord extends ActionItemPayload {
	main: number;
	secundary: number;
}

export interface UnMergeWord extends ActionItemPayload {
	main: number;
	word: string;
	usages: number;
}

export interface RemoveWord extends ActionItemPayload {
	index: number;
}

export interface AddWord extends ActionItemPayload {
	word: string;
	usages: number;
}

export interface AddWord extends ActionItemPayload {
	word: string;
	usages: number;
}

export interface ActionItem {
	payload: MergeWord | UnMergeWord | AddWord | RemoveWord;
	type: ActionItemType;
}

export type Action = ActionItem[];

export type ActionHistory = {
	past: Action[];
	future: Action[];
};

export type AtomOrFamily =
	| RecoilState<unknown>
	| ReturnType<typeof atomFamily>;

export type HistoryAtoms = Record<string, AtomOrFamily>;

export interface Word {
	word: string;
	usages: number;
}

export type WordsMap = Record<string, Word>;

export interface SimilarWord extends Word {
	offset: number;
	index: number;
}

export interface TopWords {
	common: string[];
	words: Word[];
}
