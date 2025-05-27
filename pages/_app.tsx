import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Glamcia - Salon d&apos;Esthétique</title>
        <meta name="description" content="Gestion des prestations et revenus pour salon d&apos;esthétique" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthGuard>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthGuard>
    </SessionProvider>
  );
}
