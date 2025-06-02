import {
  collection, query, where,
  addDoc, updateDoc, doc,
  serverTimestamp, orderBy, onSnapshot
} from 'firebase/firestore';
import { React } from 'react';
import { useState, useEffect } from 'react';
import { db, auth } from './firebase';

// --- hook that live-streams all of *my* friends ------------
export function useFriends() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(db, 'friendships'),
      where('uids', 'array-contains', uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setFriends(
        snap.docs.map(d => {
          const { uids } = d.data();
          return { id: d.id, other: uids.find(u => u !== uid) };
        })
      );
    });
    return unsub;
  }, []);

  return friends;        //  [{id, other}, …]
}

// --- send a friend request --------------------------------
export async function sendFriendRequest(toUid) {
  const from = auth.currentUser.uid;
  await addDoc(collection(db, 'friendRequests'), {
    from, to: toUid, status: 'pending', createdAt: serverTimestamp()
  });
}

// --- unfriend (delete friendship doc & optional counters) --
export async function unfriend(pairId) {
  await updateDoc(doc(db, 'friendships', pairId), { removedAt: serverTimestamp() });
}
