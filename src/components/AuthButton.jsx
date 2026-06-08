// Login/logout button used in the auth section
import React from 'react';

export default function AuthButton({ label, onClick }) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}
