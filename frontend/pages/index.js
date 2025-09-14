import Link from 'next/link';
export default function Home(){
  return (<div>
    <div className='header'><img src='/logo.svg' style={{height:34}} alt='logo' /></div>
    <div className='container'>
      <div className='card'>
        <h1>Freemoney — Demo</h1>
        <p>ระบบเดโม: ฝากเงินโดยอัปโหลดสลิป, ระบบตรวจสอบด้วย OCR (auto-review) และแลกรางวัลด้วยแต้ม</p>
        <p><Link href='/register'>Register</Link> • <Link href='/login'>Login</Link> • <Link href='/wallet'>Wallet</Link></p>
      </div>
    </div>
  </div>);
}
