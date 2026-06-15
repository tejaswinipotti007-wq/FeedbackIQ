import { signInWithGoogle } from "../lib/supabase"

export default function Login() {
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{background:#070B14;overflow-x:hidden}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .google-btn:hover{opacity:.9 !important}
        @media(max-width:480px){
          .login-card{padding:1.8rem 1.2rem !important}
          .login-h1{font-size:1.3rem !important}
        }
      `}</style>
      <div style={S.grid}/>
      <div style={S.glow}/>
      <div style={S.card} className="login-card">
        <div style={S.logoWrap}>
          <div style={S.logoMark}>IQ</div>
          <span style={S.logoText}>FeedbackIQ</span>
        </div>
        <h1 style={S.h1} className="login-h1">Welcome back</h1>
        <p style={S.desc}>Sign in to access your product intelligence dashboard</p>
        <button className="google-btn" style={S.googleBtn} onClick={signInWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>
        <div style={S.divider}>
          <div style={S.line}/><span style={S.or}>secured by Supabase</span><div style={S.line}/>
        </div>
        <div style={S.feats}>
          {[["🧠","Hindsight Memory","Learns from every interaction"],["📡","4 Channels","App Store · Reddit · G2 · Trustpilot"],["📈","Live Analytics","Sentiment trends & top issues"]].map(([ic,t,d])=>(
            <div key={t} style={S.feat}>
              <span style={S.fi}>{ic}</span>
              <div>
                <div style={S.ft}>{t}</div>
                <div style={S.fd}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={S.terms}>No credit card required · Free plan available</p>
      </div>
      <p style={S.badge}>Built with Hindsight × CascadeFlow Hackathon 2026</p>
    </div>
  )
}

const G="linear-gradient(135deg,#6EE7B7,#3B82F6)"
const S={
  page:     {minHeight:"100vh",background:"#070B14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"},
  grid:     {position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(110,231,183,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,183,.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"},
  glow:     {position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:"400px",height:"400px",background:"radial-gradient(ellipse,rgba(110,231,183,.07) 0%,transparent 70%)",pointerEvents:"none"},
  card:     {background:"#0D1117",border:"1px solid #1F2937",borderRadius:"20px",padding:"2.5rem",width:"100%",maxWidth:"400px",position:"relative",zIndex:1,animation:"fadeUp .4s ease"},
  logoWrap: {display:"flex",alignItems:"center",gap:"10px",marginBottom:"2rem",justifyContent:"center"},
  logoMark: {width:"36px",height:"36px",background:G,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"800",color:"#000",fontFamily:"'Syne',sans-serif"},
  logoText: {fontSize:"20px",fontWeight:"800",fontFamily:"'Syne',sans-serif",color:"#fff"},
  h1:       {fontSize:"1.5rem",fontWeight:"800",fontFamily:"'Syne',sans-serif",color:"#fff",textAlign:"center",marginBottom:"8px"},
  desc:     {fontSize:"13px",color:"#6B7280",textAlign:"center",marginBottom:"1.8rem",lineHeight:1.6},
  googleBtn:{width:"100%",background:"#fff",color:"#1a1a1a",border:"none",borderRadius:"10px",padding:"13px",fontSize:"14px",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",fontFamily:"'DM Sans',sans-serif",marginBottom:"1.2rem",transition:"opacity .2s"},
  divider:  {display:"flex",alignItems:"center",gap:"10px",marginBottom:"1.2rem"},
  line:     {flex:1,height:"1px",background:"#1F2937"},
  or:       {fontSize:"10px",color:"#374151",letterSpacing:".08em",whiteSpace:"nowrap"},
  feats:    {display:"flex",flexDirection:"column",gap:"10px",marginBottom:"1.5rem"},
  feat:     {display:"flex",alignItems:"center",gap:"12px",padding:"10px 12px",background:"#0A0F1A",borderRadius:"10px",border:"1px solid #1F2937"},
  fi:       {fontSize:"1.1rem",flexShrink:0},
  ft:       {fontSize:"12px",fontWeight:"600",color:"#D1D5DB",marginBottom:"2px",fontFamily:"'Syne',sans-serif"},
  fd:       {fontSize:"10px",color:"#4B5563"},
  terms:    {fontSize:"10px",color:"#374151",textAlign:"center"},
  badge:    {marginTop:"1.5rem",fontSize:"10px",color:"#1F2937",letterSpacing:".06em",textAlign:"center"},
}
