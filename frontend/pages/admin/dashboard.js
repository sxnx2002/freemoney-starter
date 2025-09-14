import {useState,useEffect} from 'react'; import api from '../../utils/api';
export default function Admin(){ const [pending,setPending]=useState([]);
 useEffect(()=>{ load(); },[]);
 async function load(){ const r = await api.get('/admin/receipts/pending'); setPending(r.data); }
 async function approve(id){ await api.post('/admin/receipt/' + id + '/approve'); load(); }
 async function reject(id){ await api.post('/admin/receipt/' + id + '/reject'); load(); }
 return (<div><div className='header'><img src='/logo.svg' style={{height:34}} alt='logo' /></div><div className='container'><div className='card'><h2>Admin Dashboard</h2>
   {pending.map(p=> (<div key={p.id} style={{padding:8,borderBottom:'1px solid #eee'}}>
     <div>id:{p.id} user:{p.user_id} amt:{p.request_amount} parsed:{p.parsed_amount} conf:{p.confidence}</div>
     <div><a href={'http://localhost:4000/' + p.file_path.replace('./','')} target='_blank'>view slip</a></div>
     <div><button onClick={()=>approve(p.id)}>Approve</button> <button onClick={()=>reject(p.id)}>Reject</button></div>
   </div>))}
 </div></div></div>)
}
