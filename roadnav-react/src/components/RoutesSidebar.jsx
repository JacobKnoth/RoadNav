// src/components/RoutesSidebar.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';     // adjust path
import polyline from '@mapbox/polyline';
import Spinner from 'react-bootstrap/Spinner';
import Button  from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

export default function RoutesSidebar({ onSelect }) {
  const [routes, setRoutes]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setRoutes([]);
      setLoading(false);
      return;
    }

    // /users/{uid}/routes ordered by createdAt desc
    const q = query(
      collection(db, 'users', user.uid, 'routes'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      setRoutes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;     // clean up listener on unmount
  }, []);

  if (loading) {
    return (
      <div className="route-sidebar p-3">
        <Spinner animation="border" size="sm" /> Loading routes…
      </div>
    );
  }

  if (!routes.length) {
    return (
      <div className="route-sidebar p-3">
        <h5>Routes</h5>
        <p>No routes saved yet.</p>
      </div>
    );
  }

  return (
    <div className="route-sidebar p-3">
      <h5>Routes</h5>
      <ListGroup variant="flush">
        {routes.map(r => (
          <ListGroup.Item
            key={r.id}
            action
            onClick={() => {
              // Decode and hand path + meta back to parent
              const points = polyline.decode(r.encoded, 6)
                                    .map(([lat, lon]) => [lat, lon]);
              onSelect(points, r);
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>
                {r.profile} · {r.from[0].toFixed(2)},{r.from[1].toFixed(2)}
                &nbsp;→&nbsp;
                {r.to[0].toFixed(2)},{r.to[1].toFixed(2)}
              </span>

              {
              <Button
                size="sm"
                variant="outline-danger"
                onClick={async e => {
                  e.stopPropagation();
                  await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'routes', r.id));
                }}
              >
              </Button>
              }
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
