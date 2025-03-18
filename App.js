import React, { useState } from 'react';
import Login from './src/components/Login';

export default function App(){
  const [user, setUser] = useState('');
  if (!user) {
    return <Login changeStatus={(user) => setUser(user)}/>
  }
  
}