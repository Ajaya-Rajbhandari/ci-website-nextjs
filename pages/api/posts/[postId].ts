import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseStore } from '../../../lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export async function getPost(postId?: string){
  if(postId === undefined) return undefined;
  const docRef = doc(firebaseStore, "articles", postId);
  try {
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      return docSnap.data();
    } else {
      console.log("No such post!");
      return undefined;
    }    
  } catch(e){
    console.log("Error: " + (e instanceof Error ? e.message : String(e)));
    return undefined;
  }

}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const postId = Array.isArray(req.query.postId) ? req.query.postId[0] : req.query.postId;
  const post = await getPost(postId);
  return res.status(post == undefined ? 400 : 200).json(post != null ? post : { "message": "No such post!"});
}
