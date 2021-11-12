import '../styles.css';
import React from 'react';
import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
	return (
		<RecoilRoot>
			<Component {...pageProps} />
		</RecoilRoot>
	);
};

export default App;
