import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Save one Valhalla trip under the current user.
 * @param {Object} data { from, to, profile, encoded, trip }
 */
export async function saveRouteForUser(data) {
  const user = auth.currentUser;
  if (!user) throw new Error('not_authenticated');

  // /users/{uid}/routes/{auto-id}
  const colRef = collection(db, 'users', user.uid, 'routes');
  await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
}
