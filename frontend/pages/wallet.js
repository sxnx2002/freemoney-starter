import {useState,useEffect} from 'react'; import api from '../utils/api';
export default function Wallet(){
  const [wallet,setWallet]=useState(null); const [amount,setAmount]=useState(0); const [receipts,setReceipts]=useState([]); const [file,setFile]=useState(null);
  useEffect(()=>{ load(); },[]);
  async function load(){ try{ const r = await api.get('/wallet'); setWallet(r.data); const rs = await api.get('/wallet/receipts'); setReceipts(rs.data); }catch(e){} }
  async function create(){ const r = await api.post('/wallet/topup-request',{amount: Number(amount)}); alert('Request created: ' + r.data.receipt.id); load(); }
  async function upload(id){ if(!file) return alert('choose file'); const fd = new FormData(); fd.append('file', file); const r = await api.post('/wallet/upload-slip/' + id, fd); alert('Upload result: ' + JSON.stringify(r.data)); load(); }
  return (<div><div className='header'><img src='/logo.svg' style={{height:34}} alt='logo' /></div><div className='container'><div className='card'><h2>Wallet</h2><p>Balance: {wallet ? wallet.balance : '—'}</p>
    <div><input type='number' value={amount} onChange={e=>setAmount(e.target.value)} /><button onClick={create}>Create topup request</button></div>
    <hr/>
    <h3>Receipts</h3>
    {receipts.map(r=> (<div key={r.id} style={{border:'1px solid #eee', padding:8, marginBottom:8}}>
      <div>id: {r.id} amount: {r.request_amount} status: {r.status}</div>
      <div><input type='file' onChange={e=>setFile(e.target.files[0])} /> <button onClick={()=>upload(r.id)}>Upload slip for {r.id}</button></div>
    </div>))}
  </div></div></div>);
}
