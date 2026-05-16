import React from 'react';

export default function AuthButton({ label, onClick }) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}