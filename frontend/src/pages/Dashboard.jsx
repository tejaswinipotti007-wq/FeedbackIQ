import { useState, useEffect } from "react"
import { signOut } from "../lib/supabase"
import DataLog   from "../components/DataLog"
import ChatBox   from "../components/ChatBox"
import Analytics from "../components/Analytics"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const STATUS = {
  scraping:{msg:"🔍 Scraping channels...",   color:"#F59E0B"},
  storing: {msg:"🧠 Storing in Hindsight...", color:"#8B5CF6"},
  learning:{msg:"✨ Agent learning...",        color:"#6EE7B7"},
  done:    {msg:"✅ Updated.",                color:"#6EE7B7"},
  error:   {msg:"❌ Backend error.",          color:"#EF4444"},
}

export default function Dashboard({ session, setSession, user }) {
  const [cur, setCur]       = useState(session)
  const [busy, setBusy]     = useState(false)
  const [status, setStatus] = useState(null)
  const [activeTab, setActiveTab] = useState("chat")

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  const getNewData = async () => {
    setBusy(true)
    setStatus("scraping"); await sleep(700)
    setStatus("storing");  await sleep(700)
    setStatus("learning")
    try {
      const res  = await fetch(`${API}/new-data`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ session_id: cur.session_id }),
      })
      const data = await res.json()
      setCur(data)
      setStatus("done")
    } catch { setStatus("error") }
    await sleep(2000)
    setStatus(null)
    setBusy(false)
  }

  const handleSignOut = () => signOut()

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{overflow-x:hidden}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#070B14}
        ::-webkit-scrollbar-thumb{background:#1F2937;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        @media(max-width:768px){
          .desktop-panels{display:none !important}
          .mobile-panels{display:flex !important}
          .tab-bar{display:flex !important}
        }
        @media(min-width:769px){
          .mobile-panels{display:none !important}
          .tab-bar{display:none !important}
          .desktop-panels{display:grid !important}
        }
      `}</style>

      {/* Top bar */}
      <div style={S.bar}>
        <div style={S.barLeft}>
          <button style={S.back} onClick={() => setSession(null)}>← Back</button>
          <div style={S.logo}><div style={S.mark}>IQ</div><span style={S.logoTxt}>FeedbackIQ</span></div>
          <div style={S.prodBadge}><span style={S.dot}/>{cur.product_name}</div>
          <div style={S.intBadge}>#{cur.interaction}</div>
        </div>
        <div style={S.barRight}>
          {status && <div style={{fontSize:"10px",color:STATUS[status]?.color,display:"none"}} className="status-msg">{STATUS[status]?.msg}</div>}
          <button style={{...S.newBtn,opacity:busy?.6:1}} onClick={getNewData} disabled={busy}>
            {busy?"...":"🔄 New Data"}
          </button>
          <button style={S.signOut} onClick={handleSignOut}>Out</button>
        </div>
      </div>

      {/* Status bar */}
      {status && (
        <div style={{padding:"6px 1rem",background:"#0A0F1A",fontSize:"11px",color:STATUS[status]?.color,borderBottom:"1px solid #0F1923"}}>
          {STATUS[status]?.msg}
        </div>
      )}

      {/* Desktop — 3 panels */}
      <div className="desktop-panels" style={S.panels}>
        <DataLog   session={cur}/>
        <ChatBox   session={cur}/>
        <Analytics session={cur}/>
      </div>

      {/* Mobile — tab switcher */}
      <div className="tab-bar" style={S.tabBar}>
        {["data","chat","analytics"].map(t=>(
          <button key={t} style={{...S.tab,...(activeTab===t?S.tabActive:{})}} onClick={()=>setActiveTab(t)}>
            {t==="data"?"📋 Log":t==="chat"?"💬 Chat":"📊 Stats"}
          </button>
        ))}
      </div>

      <div className="mobile-panels" style={S.mobilePanel}>
        {activeTab==="data"    && <DataLog   session={cur}/>}
        {activeTab==="chat"    && <ChatBox   session={cur}/>}
        {activeTab==="analytics" && <Analytics session={cur}/>}
      </div>
    </div>
  )
}

const G = "linear-gradient(135deg,#6EE7B7,#3B82F6)"
const S = {
  page:     {minHeight:"100vh",background:"#070B14",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",color:"#fff"},
  bar:      {display:"flex",alignItems:"center",justifyContent:"space-between",padding:".6rem 1rem",borderBottom:"1px solid #0F1923",background:"#0A0F1A",flexWrap:"wrap",gap:".4rem",position:"sticky",top:0,zIndex:50},
  barLeft:  {display:"flex",alignItems:"center",gap:".6rem",flexWrap:"wrap"},
  back:     {background:"transparent",border:"1px solid #1F2937",color:"#4B5563",padding:"4px 8px",borderRadius:"6px",cursor:"pointer",fontSize:"11px",fontFamily:"'DM Sans',sans-serif"},
  logo:     {display:"flex",alignItems:"center",gap:"6px"},
  mark:     {width:"22px",height:"22px",background:G,borderRadius:"5px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"800",color:"#000",fontFamily:"'Syne',sans-serif"},
  logoTxt:  {fontSize:"13px",fontWeight:"700",fontFamily:"'Syne',sans-serif"},
  prodBadge:{display:"flex",alignItems:"center",gap:"5px",color:"#D1D5DB",fontSize:"12px",fontWeight:"600",fontFamily:"'Syne',sans-serif"},
  dot:      {width:"5px",height:"5px",background:"#6EE7B7",borderRadius:"50%",animation:"pulse 2s infinite"},
  intBadge: {background:"rgba(110,231,183,.08)",border:"1px solid rgba(110,231,183,.2)",color:"#6EE7B7",padding:"2px 8px",borderRadius:"20px",fontSize:"9px",fontFamily:"'Syne',sans-serif"},
  barRight: {display:"flex",alignItems:"center",gap:"6px"},
  newBtn:   {background:G,color:"#000",border:"none",borderRadius:"6px",padding:"6px 12px",fontSize:"11px",fontWeight:"700",cursor:"pointer",fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"},
  signOut:  {background:"transparent",border:"1px solid #1F2937",color:"#4B5563",padding:"5px 8px",borderRadius:"6px",cursor:"pointer",fontSize:"11px",fontFamily:"'DM Sans',sans-serif"},
  panels:   {gridTemplateColumns:"1fr 1.3fr 1fr",flex:1,height:"calc(100vh - 50px)"},
  tabBar:   {borderBottom:"1px solid #0F1923",background:"#0A0F1A",flexShrink:0},
  tab:      {flex:1,padding:"10px",background:"transparent",border:"none",color:"#4B5563",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",borderBottom:"2px solid transparent"},
  tabActive:{color:"#6EE7B7",borderBottom:"2px solid #6EE7B7"},
  mobilePanel:{flexDirection:"column",flex:1,overflow:"hidden"},
}
