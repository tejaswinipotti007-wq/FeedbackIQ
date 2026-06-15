import { useState } from "react"
import { signOut } from "../lib/supabase"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const STEPS = [
  "Scraping App Store reviews...",
  "Crawling Reddit discussions...",
  "Pulling G2 & Trustpilot data...",
  "Analysing support tickets...",
  "Storing in Hindsight memory...",
  "Building your dashboard...",
]

export default function Landing({ user, setSession }) {
  const [name, setName]       = useState("")
  const [url, setUrl]         = useState("")
  const [plan, setPlan]       = useState("free")
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(0)
  const [error, setError]     = useState("")

  const start = async () => {
    if (!name.trim() || !url.trim()) { setError("Please fill in both fields"); return }
    setError("")
    setLoading(true)
    setStep(0)
    const iv = setInterval(() => setStep(p => p >= STEPS.length - 1 ? p : p + 1), 700)
    try {
      const res  = await fetch(`${API}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: name, product_url: url, plan }),
      })
      const data = await res.json()
      clearInterval(iv)
      setSession(data)
    } catch {
      clearInterval(iv)
      setError("Cannot reach backend.")
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{background:#070B14;overflow-x:hidden}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        input:focus{border-color:rgba(110,231,183,.4)!important;outline:none}
        .plan-card:hover{border-color:rgba(110,231,183,.3)!important}
        @media(max-width:768px){
          .form-sec{grid-template-columns:1fr !important}
          .steps3{grid-template-columns:1fr !important}
          .hero-h1{font-size:1.8rem !important}
          .nav-user{display:none !important}
        }
        @media(max-width:480px){
          .hero-h1{font-size:1.5rem !important}
          .form-sec{padding:0 1rem !important}
          .how-sec{padding:0 1rem 3rem !important}
        }
      `}</style>
      <div style={S.grid}/>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoMark}>IQ</div>
          <span style={S.logoText}>FeedbackIQ</span>
        </div>
        <div style={S.navRight}>
          <div style={S.userInfo} className="nav-user">
            <img src={user?.user_metadata?.avatar_url} alt="" style={S.avatar} onError={e=>e.target.style.display='none'}/>
            <span style={S.userName}>{user?.user_metadata?.full_name || user?.email}</span>
          </div>
          <button style={S.signOutBtn} onClick={signOut}>Sign out</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.heroBadge}><span style={S.dot}/>AI-Powered Feedback Intelligence</div>
        <h1 style={S.h1} className="hero-h1">
          Your users are talking.<br/>
          <span style={S.h1Green}>Are you listening?</span>
        </h1>
        <p style={S.heroDesc}>FeedbackIQ scrapes, remembers, and analyses your product feedback — getting smarter with every interaction.</p>
      </section>

      {/* Plan selector + form */}
      <section style={S.formSec} className="form-sec">
        <div style={S.plans}>
          {[
            {id:"free", name:"Free", price:"$0", desc:"1 AI agent · Basic analysis", features:["App Store + Reddit + G2 + Trustpilot","20 interactions/month","Standard chat responses","Sentiment tracking"]},
            {id:"pro",  name:"Pro",  price:"$50", desc:"5 specialist agents · Deep analysis", features:["Everything in Free","1 dedicated AI agent per channel","Master agent synthesis","Priority Hindsight memory","Faster, richer answers","Unlimited interactions"]},
          ].map(p=>(
            <div key={p.id} className="plan-card" onClick={()=>setPlan(p.id)} style={{
              ...S.planCard,
              ...(plan===p.id?S.planActive:{}),
            }}>
              {p.id==="pro"&&<div style={S.popTag}>⚡ Most Powerful</div>}
              <div style={S.planTop}>
                <div>
                  <div style={S.planName}>{p.name}</div>
                  <div style={S.planPrice}>{p.price}<span style={S.planPer}>/mo</span></div>
                  <div style={S.planDesc}>{p.desc}</div>
                </div>
                <div style={{...S.radio,...(plan===p.id?S.radioActive:{})}}/>
              </div>
              <div style={S.planFeats}>
                {p.features.map(f=>(
                  <div key={f} style={S.planFeat}><span style={S.check}>✓</span>{f}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={S.formCard}>
          <div style={S.formTitle}>Analyse your product</div>
          <div style={S.formDesc}>Enter any SaaS product to get started</div>
          {!loading ? (
            <>
              <div style={S.field}>
                <label style={S.label}>PRODUCT NAME</label>
                <input style={S.input} placeholder="e.g. Notion, Slack, Linear"
                  value={name} onChange={e=>setName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&start()}/>
              </div>
              <div style={S.field}>
                <label style={S.label}>PRODUCT URL</label>
                <input style={S.input} placeholder="e.g. notion.so"
                  value={url} onChange={e=>setUrl(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&start()}/>
              </div>
              {error&&<p style={S.err}>{error}</p>}
              <button style={S.btn} onClick={start}>
                {plan==="pro"?"⚡ Launch Pro Analysis →":"🚀 Start Free Analysis →"}
              </button>
              <p style={S.hint}>Using <strong style={{color:"#6EE7B7"}}>{plan==="pro"?"Pro — 5 specialist agents":"Free — 1 agent"}</strong></p>
            </>
          ) : (
            <div style={S.loadBox}>
              <div style={S.spinner}/>
              <div style={S.steps}>
                {STEPS.map((s,i)=>(
                  <div key={i} style={{...S.stepRow,color:i===step?"#6EE7B7":i<step?"#374151":"#1F2937",opacity:i<=step?1:0.3}}>
                    {i<step?"✓":i===step?"›":"○"} {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={S.howSec} className="how-sec">
        <div style={S.secTitle}>How FeedbackIQ works</div>
        <div style={S.steps3} className="steps3">
          {[
            ["1","Scrape","Pulls feedback from App Store, Reddit, G2 and Trustpilot automatically"],
            ["2","Remember","Every batch stored in Hindsight memory — agent never forgets"],
            ["3","Get Smarter","Each interaction cross-references all past data for richer answers"],
          ].map(([n,t,d])=>(
            <div key={n} style={S.step3}>
              <div style={S.stepNum}>{n}</div>
              <div style={S.stepTitle}>{t}</div>
              <div style={S.stepDesc}>{d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const G="linear-gradient(135deg,#6EE7B7,#3B82F6)"
const S={
  page:      {minHeight:"100vh",background:"#070B14",fontFamily:"'DM Sans',sans-serif",color:"#fff"},
  grid:      {position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(110,231,183,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,183,.02) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0},
  nav:       {display:"flex",alignItems:"center",justifyContent:"space-between",padding:".9rem 1.5rem",borderBottom:"1px solid #0F1923",background:"rgba(7,11,20,.98)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:10},
  logo:      {display:"flex",alignItems:"center",gap:"10px"},
  logoMark:  {width:"30px",height:"30px",background:G,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"800",color:"#000",fontFamily:"'Syne',sans-serif"},
  logoText:  {fontSize:"16px",fontWeight:"800",fontFamily:"'Syne',sans-serif"},
  navRight:  {display:"flex",alignItems:"center",gap:"1rem"},
  userInfo:  {display:"flex",alignItems:"center",gap:"8px"},
  avatar:    {width:"28px",height:"28px",borderRadius:"50%",border:"1px solid #1F2937"},
  userName:  {fontSize:"13px",color:"#9CA3AF"},
  signOutBtn:{background:"transparent",border:"1px solid #1F2937",color:"#4B5563",padding:"5px 12px",borderRadius:"6px",cursor:"pointer",fontSize:"12px",fontFamily:"'DM Sans',sans-serif"},
  hero:      {padding:"3rem 1.5rem 1.5rem",maxWidth:"700px",margin:"0 auto",textAlign:"center",position:"relative",zIndex:1},
  heroBadge: {display:"inline-flex",alignItems:"center",gap:"7px",background:"rgba(110,231,183,.07)",border:"1px solid rgba(110,231,183,.15)",color:"#6EE7B7",padding:"5px 14px",borderRadius:"20px",fontSize:"11px",marginBottom:"1.5rem",letterSpacing:".06em"},
  dot:       {width:"6px",height:"6px",borderRadius:"50%",background:"#6EE7B7",animation:"pulse 2s infinite"},
  h1:        {fontSize:"clamp(1.8rem,5vw,3.2rem)",fontWeight:"800",fontFamily:"'Syne',sans-serif",lineHeight:1.15,marginBottom:"1rem",letterSpacing:"-.02em"},
  h1Green:   {background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  heroDesc:  {color:"#6B7280",fontSize:"clamp(.85rem,2.5vw,1rem)",lineHeight:1.7,maxWidth:"500px",margin:"0 auto"},
  formSec:   {maxWidth:"1000px",margin:"2rem auto",padding:"0 1.5rem",display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:"1.5rem",position:"relative",zIndex:1},
  plans:     {display:"flex",flexDirection:"column",gap:"1rem"},
  planCard:  {background:"#0D1117",border:"1px solid #1F2937",borderRadius:"14px",padding:"1.2rem",cursor:"pointer",transition:"border-color .2s",position:"relative"},
  planActive:{border:"1px solid rgba(110,231,183,.5)",background:"rgba(110,231,183,.03)"},
  popTag:    {position:"absolute",top:"-10px",left:"16px",background:G,color:"#000",fontSize:"9px",fontWeight:"800",padding:"2px 10px",borderRadius:"10px",fontFamily:"'Syne',sans-serif"},
  planTop:   {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"},
  planName:  {fontSize:"11px",color:"#6B7280",letterSpacing:".1em",marginBottom:"4px"},
  planPrice: {fontSize:"1.8rem",fontWeight:"800",fontFamily:"'Syne',sans-serif",lineHeight:1},
  planPer:   {fontSize:"12px",color:"#6B7280",fontWeight:"400"},
  planDesc:  {fontSize:"11px",color:"#4B5563",marginTop:"2px"},
  radio:     {width:"18px",height:"18px",borderRadius:"50%",border:"2px solid #1F2937",flexShrink:0,transition:"all .2s"},
  radioActive:{border:"5px solid #6EE7B7"},
  planFeats: {display:"flex",flexDirection:"column",gap:"5px"},
  planFeat:  {fontSize:"11px",color:"#6B7280",display:"flex",alignItems:"center",gap:"6px"},
  check:     {color:"#6EE7B7",fontWeight:"700",fontSize:"10px"},
  formCard:  {background:"#0D1117",border:"1px solid #1F2937",borderRadius:"14px",padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1rem"},
  formTitle: {fontSize:"16px",fontWeight:"700",fontFamily:"'Syne',sans-serif"},
  formDesc:  {fontSize:"12px",color:"#6B7280",marginTop:"-6px"},
  field:     {display:"flex",flexDirection:"column",gap:"5px"},
  label:     {fontSize:"10px",color:"#4B5563",letterSpacing:".12em"},
  input:     {background:"#0A0F1A",border:"1px solid #1F2937",borderRadius:"8px",padding:"12px 14px",color:"#fff",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",transition:"border-color .2s"},
  err:       {color:"#EF4444",fontSize:"11px"},
  btn:       {background:G,color:"#000",border:"none",borderRadius:"9px",padding:"13px",fontSize:"13px",fontWeight:"700",cursor:"pointer",fontFamily:"'Syne',sans-serif"},
  hint:      {fontSize:"11px",color:"#374151",textAlign:"center"},
  loadBox:   {display:"flex",flexDirection:"column",gap:"1rem"},
  spinner:   {width:"28px",height:"28px",border:"2px solid #1F2937",borderTop:"2px solid #6EE7B7",borderRadius:"50%",animation:"spin 1s linear infinite"},
  steps:     {display:"flex",flexDirection:"column",gap:"7px"},
  stepRow:   {fontSize:"11px",transition:"all .3s"},
  howSec:    {maxWidth:"900px",margin:"3rem auto",padding:"0 1.5rem 4rem",position:"relative",zIndex:1},
  secTitle:  {fontSize:"clamp(1.2rem,4vw,1.5rem)",fontWeight:"800",fontFamily:"'Syne',sans-serif",textAlign:"center",marginBottom:"2rem"},
  steps3:    {display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem"},
  step3:     {background:"#0D1117",border:"1px solid #1F2937",borderRadius:"14px",padding:"1.2rem",textAlign:"center"},
  stepNum:   {width:"36px",height:"36px",background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"800",color:"#000",margin:"0 auto 1rem",fontFamily:"'Syne',sans-serif"},
  stepTitle: {fontSize:"14px",fontWeight:"700",fontFamily:"'Syne',sans-serif",marginBottom:"8px"},
  stepDesc:  {fontSize:"11px",color:"#6B7280",lineHeight:1.6},
}
