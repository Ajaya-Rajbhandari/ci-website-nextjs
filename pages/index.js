import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Navbar from '../components/Navbar.js';
import Hero from '../components/home/Hero.js';
import Footer from '../components/footer/Footer.js';

import { useCallback, useEffect } from 'react';
import { loadFull } from 'tsparticles';
import Particles from 'react-particles';
import { particleConfig } from '../lib/particle_config';

import ReactPlayer from 'react-player';
import Stories from '../components/home/Stories';
import AppStore from '../components/home/AppStore';
import { getHomePage } from '../lib/sanity/fetchers';
import { homePageFallback } from '../lib/sanity/fallbacks';

export default function Home({ home = homePageFallback }) {
  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async container => {
    console.log(container);
  }, []);

  return (
    <>
    <div className={styles.container}>
      <Head>
        <title> Charicha Institute </title>
        <meta name="description" content="Official Site of Charicha Institute" />
        <meta property="og:image" itemProp="image" content="landing_image.jpg"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={'bg-gradient-[-45deg] from-eggblue to-slategray'}>
        <Navbar path={'/'}/>
        <Particles init={particlesInit} loaded={particlesLoaded} options={particleConfig}/>        
	<div className='lg:h-20'></div>
        <Hero hero={home.hero}/>

	<div className='flex justify-center'>
	  <div className='rounded-2xl overflow-clip shadow-lg w-full max-w-2xl h-60 sm:h-96 mx-6'>
            <ReactPlayer
              width={'100%'}
              height={'100%'}
              className='w-full h-full'
              url={home.featureVideoUrl}/>
          </div>
        </div>
	<p className='mt-4 text-center text-[24px] text-white'> See us in Action </p>
	<div className='h-40'></div>

        <Stories stories={home.stories}/>
        <AppStore appPromo={home.appPromo}/>

	<div className='h-20'></div>
      </main>


      <Footer/>

    </div>

    </>
  );
}

export async function getStaticProps() {
  const home = await getHomePage();
  return { props: { home }, revalidate: 60 };
}
