import {Button, CircularProgress, TextField, Typography} from '@mui/material';
import {signIn} from './user/Auth';
import type {User} from '@supabase/supabase-js';
import {useState} from 'react';

interface LogicPageProps {
  user?: User|null;
  onSetUser: (user: User|null) => unknown;
}

export default function LoginPage({user, onSetUser}: LogicPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function login() {
    const {data: {user}, error} = await signIn(email, password);
    if (error) {
      console.error(error);
    } else {
      onSetUser(user);
    }
  }

  async function reactOnEnter(event: {keyCode: number}) {
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
