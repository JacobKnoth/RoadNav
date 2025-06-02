import { useFriends, unfriend } from "../services/friends";
import { useAuth } from "../contexts/AuthContext";

export default function FriendsSidebar() {
  const { currentUser } = useAuth();          // <- whatever you expose
  const friends = useFriends();

  if (!currentUser) return null;

  return (
    <section className="sidebar-section">
      <h3>Friends</h3>

      {friends.length === 0 && (
        <p className="text-muted">No friends yet 🙂</p>
      )}

      <ul className="friends-list">
        {friends.map(f => (
          <li key={f.id}>
            <span>{f.other}</span>  {/* replace with displayName lookup */}
            <button
              title="Un-friend"
              onClick={() => unfriend(f.id)}
              className="icon-btn"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
