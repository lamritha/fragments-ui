import React from 'react';

export default function LoginButton(){
    const handleLogin = ()=>{
        console.log("Login button clicked!");
    };
    return (
        <>
        <div className='login-section'>
            <button onClick={handleLogin} id='login'>Login</button>
        </div>
        </>
    );
}