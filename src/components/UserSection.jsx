// Welcome banner — only rendered when the user is logged in
import React from 'react';

export default function UserSection({ username, isLoggedIn }) {
  if (!isLoggedIn) {
    return null;
  }

  return (
    <section id="user" className="user-section">
      <h2 className="user-name">Welcome {username}!</h2>
    </section>
  );
}
