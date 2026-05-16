import React from "react";
import Header from "./components/Header";
import LoginButton from "./components/LoginButton";
import UserSection from "./components/UserSection";
import "./styles/app.css";

export default function App(){
  return (
    <>
    <div className="app-container">
    <Header/>
    <LoginButton/>
    <UserSection username="Amritha" isLoggedIn={true}/>
    </div>

    </>
  );
}