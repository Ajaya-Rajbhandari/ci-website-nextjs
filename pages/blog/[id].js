import Image from 'next/image';
import Head from 'next/head';
import Navbar from '../../components/Navbar.js';

import { FaFacebook, FaInstagram, FaDotCircle } from 'react-icons/fa';
import { AiFillHeart } from 'react-icons/ai';

import styles from './blogpage.module.css';
import EditorJSRenderer from '../../components/EditorJSRenderer';
import PortableBody from '../../components/blog/PortableBody.js';

import { getPost } from '../api/posts/[postId].js';
import { UserService } from '../../lib/service/UserService.js';
import { getBlogPostBySlug } from '../../lib/sanity/fetchers.js';
import Footer from '../../components/footer/Footer.js';

// Firebase user article: author comes from the Firebase user record.
function FirebaseBlogPage({ blog: blogData, user: userData }){
  return (
    <div>
      <Head>
        <title> Charicha Insitute Blogs | { blogData?.title || "Empty Blog" } </title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className={'bg-gradient-[-45deg] from-eggblue to-slategray pb-10'}>
        <Navbar/>

	<div className='px-8 md:px-10 xl:px-20 2xl:px-48 mt-10 text-white'>

	<header>
	  <h1 className='text-2xl mb-4 lg:text-4xl text-cheeseyellow'> { blogData.title } </h1>
        </header>

        <div className={'flex flex-col gap-2'}>
          <div className={'flex gap-2 xl:gap-4 items-center'}>
            <Image alt={userData?.first_name + " Profile"} src={ userData?.profile_URL || "/profile.jpg" } className={styles.profileImg + ' shadow-md'} width="60px" height="60px" objectFit='cover'/>
            <div className={''}>
              <p className={styles.infoText}> { userData?.first_name + " " + userData?.last_name }</p>
              <div className={'flex items-center gap-2 text-xs lg:text-sm font-extralight text-cheeseyellow'}>
                <p className={''}> { new Date(blogData.createdAt).toUTCString() } </p>
                <FaDotCircle size="5px"/>
                <p className={styles.infoTextGrey}> { parseInt(blogData?.body.length / 1000) + " min read"}</p>
              </div>
            </div>
          </div>

          <div className={'flex gap-4'}>
            <FaFacebook className='text-3xl text-white/90 hover:text-white cursor-pointer'/>
            <FaInstagram className='text-3xl text-white/90 hover:text-white cursor-pointer'/>
          </div>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.content}>
            <EditorJSRenderer data={blogData.body}/>
          </div>
          <div className={styles.rightContents}>
            <Image alt={userData?.first_name + "'s Profile Picture"}
                   src={ userData?.profile_URL || "/profile.jpg" }
                   width="80px"
                   height="80px"
                   objectFit="cover"
                   className='rounded-full shadow-lg'/>
            <div className='flex items-center gap-2'>
              <AiFillHeart className='text-3xl text-red-600'/>
              <p className='text-sm font-light text-white'> { userData?.hearts } Likes </p>
            </div>
            <p className={styles.infoText}> { userData?.first_name + " " + userData?.last_name } </p>
            <p className={'font-light text-cheeseyellow'}> { userData?.rank }</p>
            <div className={'flex gap-2 mt-2'}>
              <FaFacebook className='text-white text-3xl'/>
              <FaInstagram className='text-white text-3xl'/>
            </div>
          </div>
    </div>
            </div>

      </main>

      <Footer/>
    </div>
  );
}

// Sanity editorial post: inline author, Portable Text body, no hearts/likes.
function SanityBlogPage({ blog }){
  return (
    <div>
      <Head>
        <title> Charicha Insitute Blogs | { blog?.title || "Empty Blog" } </title>
        <meta name="description" content={blog?.excerpt || ''} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={'bg-gradient-[-45deg] from-eggblue to-slategray pb-10'}>
        <Navbar/>

	<div className='px-8 md:px-10 xl:px-20 2xl:px-48 mt-10 text-white'>

	<header>
	  <h1 className='text-2xl mb-4 lg:text-4xl text-cheeseyellow'> { blog.title } </h1>
        </header>

        <div className={'flex gap-2 xl:gap-4 items-center mb-6'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={blog.authorName + " profile"} src={blog.authorImg} className={styles.profileImg + ' shadow-md'} width="60" height="60" style={{ objectFit: 'cover' }}/>
          <div>
            <p className={styles.infoText}> { blog.authorName }</p>
            <div className={'flex items-center gap-2 text-xs lg:text-sm font-extralight text-cheeseyellow'}>
              <p> { new Date(blog.publishedAt).toUTCString() } </p>
              <FaDotCircle size="5px"/>
              <p className={styles.infoTextGrey}> { blog.category || 'Tech' } </p>
            </div>
          </div>
        </div>

        {blog.coverImg && (
          <div className='mb-6'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={blog.title + ' cover'} src={blog.coverImg} className='w-full max-h-[420px] rounded-2xl shadow-lg' style={{ objectFit: 'cover' }}/>
          </div>
        )}

        <div className={styles.contentContainer}>
          <div className={styles.content}>
            <PortableBody value={blog.body}/>
          </div>
        </div>
            </div>

      </main>

      <Footer/>
    </div>
  );
}

export default function BlogPage({ blog, user }){
  if (blog?.source === 'sanity') return <SanityBlogPage blog={blog}/>;
  return <FirebaseBlogPage blog={blog} user={user}/>;
}


export async function getServerSideProps(context){
  const { id } = context.params;

  // 1) Firebase user article, matched by document id.
  const fbBlog = await getPost(id);
  if (fbBlog) {
    const userRes = await UserService.getUser(fbBlog.writtenBy);
    const user = userRes?.userData || null;

    let { createdAt, ...serializableBlog } = fbBlog;
    createdAt = createdAt?.toDate ? createdAt.toDate().toString() : new Date(createdAt).toString();

    let serializableUser = null;
    if (user) {
      const { joined_at, ...rest } = user;
      serializableUser = { ...rest, joinedAt: joined_at ? new Date(joined_at).toString() : null };
    }

    return {
      props: {
        blog: { ...serializableBlog, source: 'firebase', createdAt },
        user: serializableUser,
      }
    };
  }

  // 2) Sanity editorial post, matched by slug.
  const cmsPost = await getBlogPostBySlug(id);
  if (cmsPost) {
    return { props: { blog: { ...cmsPost, source: 'sanity' }, user: null } };
  }

  return { notFound: true };
}
