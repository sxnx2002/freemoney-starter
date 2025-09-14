import { useState } from 'react';
import { apiRequest } from '../utils/api';
export default function Register() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');
  const handle = async (e)=>{
    e.preventDefault();
    const r = await apiRequest('/auth/register','POST',{email,password});
    setMsg(r.message || (r.success?'Registered':'Error'));
  }
  return (<div style={{maxWidth:600,margin:'40px auto'}}>
    <h1>Register</h1>
    <form onSubmit={handle}>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button type="submit">Register</button>
    </form>
    <p>{msg}</p>
  </div>)
}
