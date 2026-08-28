import Head from 'next/head';
import Navbar from '../../components/Navbar.js';

import styles from './blog.module.css';

import TopBlog from '../../components/blog/TopBlog.js';
import BlogCard from '../../components/blog/BlogCard.js';

import Footer from '../../components/footer/Footer.js';
import { ArticleService } from '../../lib/service/ArticleService.js';
import { getBlogPosts } from '../../lib/sanity/fetchers.js';
import ParticlesBackground from '../../components/ParticlesBackground';


export default function Contact(props){

  return (
    <div className={styles.container}>
      <Head>
        <title> Charicha Insitute </title>
        <meta name="description" content="Charicha Institute Blogs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className={'bg-gradient-[-45deg] from-eggblue to-slategray pb-10'}>
        <Navbar path={'/blog'}/>
        <ParticlesBackground/>

	<div className='px-8 md:px-10 xl:px-20 2xl:px-48 mt-10'>
          {/* <TopBlog/> */}
	  <h1 className='text-white text-2xl lg:text-4xl mb-2'> What&apos;s on the run?</h1>
          <h2 className='text-gray-400 text-lg lg:text-xl'> These are handpicked articles for you! </h2>          
        <div style={{height: "40px"}}></div>
        <div className={styles["cards-container"]}>
          {
            props.posts.map((blog) => <BlogCard key={blog.source + blog.id} blog={blog}/>)
          }
        </div>
          <div style={{height: "40px"}}></div>
        </div>    
      </main>

      <Footer/>

    </div>
  );

}

export async function getServerSideProps(context){
  // Merge the Firebase user articles with the Sanity editorial posts, then sort
  // newest-first. Each source is normalised with a `source` discriminator and a
  // `sortTime` (ms epoch) so BlogCard can render the right shape.
  const [fbRes, cmsRes] = await Promise.all([
    ArticleService.listPublishedArticles().catch(() => []),
    getBlogPosts(),
  ]);

  const firebasePosts = JSON.parse(JSON.stringify(fbRes || [])).map((a) => ({
    ...a,
    source: 'firebase',
    sortTime: a.createdAt?.seconds
      ? a.createdAt.seconds * 1000
      : (a.createdAt ? new Date(a.createdAt).getTime() : 0),
  }));

  const cmsPosts = (cmsRes || []).map((p) => ({
    ...p,
    source: 'sanity',
    id: p.slug,
    sortTime: p.publishedAt ? new Date(p.publishedAt).getTime() : 0,
  }));

  const posts = [...firebasePosts, ...cmsPosts].sort((a, b) => b.sortTime - a.sortTime);

  return {
    props: { posts }
  };
}
