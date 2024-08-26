import {Button, TextField, Typography, CircularProgress} from '@mui/material';
import {useGlobalState} from './GlobalStateProvider';
import React, {useEffect, useState} from 'react';
import {signIn} from './user/Auth';
import type {Session, User} from '@supabase/supabase-js';
import supabase from './supabase/client';

interface LogicPageProps {
  user?: User|null;
  onSetUser: (user: User|null) => unknown;
}

export default function LoginPage({user, onSetUser}: LogicPageProps) {
  const [globalState, setGlobalState] = useGlobalState();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  async function login() {
    const {data: {user}, error} = await signIn(email, password);
    if (error) {
      console.error(error);
    } else {
      onSetUser(user);
    }
  }

  async function reactOnEnter(event: any) {
    if (event.keyCode === 13) {
      await login();
    }
  }

  return <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center'}}>
    <Typography variant='h1'>Bio-Light</Typography>
    {user !== undefined ?
      <>
        <TextField type='email' value={email} onChange={(event) => setEmail(event.target.value)} label='Imejl adresa'></TextField>
        <TextField type='password' value={password} onChange={(event) => setPassword(event.target.value)} label='Lozinka'></TextField>
        <Button variant='contained' onClick={login} onKeyDown={reactOnEnter}>Prijavi se</Button>
      </>
      : <CircularProgress />
    }
  </div>;
}
