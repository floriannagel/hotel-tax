import type { AppProps } from 'next/app';
import Script from 'next/script';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Component {...pageProps} />
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </>
  );
};

export default MyApp;
