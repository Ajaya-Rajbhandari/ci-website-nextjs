import type { NextApiRequest, NextApiResponse } from 'next';
import { firebaseStore } from '../../../lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export async function getUser(userId?: string){
  if(userId === undefined)
    return {
      error: "Not valid user id"
    };

  const docRef = doc(firebaseStore, "ci_users", userId);
  try {
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      return docSnap.data();
    } else {
      console.log("No such user!");
      return undefined;
    }    
  } catch(e){
    console.log("Error: " + (e instanceof Error ? e.message : String(e)));
    return undefined;
  }

}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
  const user = await getUser(userId);
  return res.status(user == undefined ? 400 : 200).json(user != null ? user : { "message": "No such user!"});
}
