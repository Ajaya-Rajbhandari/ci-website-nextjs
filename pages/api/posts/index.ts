import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseStore } from '../../../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getPosts(req, res);

  // POST/PUT/DELETE previously dispatched to addPost/updatePost/deletePost,
  // which were never defined -- those verbs threw a ReferenceError. Until the
  // write paths exist, answer honestly.
  res.setHeader('Allow', 'GET');
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}

const postsRef = collection(firebaseStore, "articles");

export async function getPostsFirestore(){
  const querySnapshot = await getDocs(postsRef);
  const allArticles: unknown[] = [];
  querySnapshot.forEach((doc) => {
    // console.log(doc.id, " => ", doc.data());
    allArticles.push(doc.data());
  });
  return JSON.parse(JSON.stringify(allArticles));
}

export async function getPosts(_req: NextApiRequest, res: NextApiResponse){
  return res.status(200).json(await getPostsFirestore());
}
