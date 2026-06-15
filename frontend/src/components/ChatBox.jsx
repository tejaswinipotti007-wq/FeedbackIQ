import { useState, useRef, useEffect } from "react"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const SUGGESTIONS = [
  "What's the biggest issue right now?",
  "Which channel has the most complaints?",
  "Is sentiment improving or getting worse?",
  "What should we fix first?",
  "Are there any emerging patterns?",
  "How has feedback changed since we started?",
]

export default function ChatBox({ session }) {
  const [msgs, setMsgs]   = useState([{
    role:"agent",
    text:`I'm analysing **${session?.product_name||"your product"}** feedback. I have ${session?.interaction||1} interaction(s) of Hindsight memory loaded. Ask me anything about your users.`,
    intro:true,
  }])
  const [input, setInput] = useState("")
  const [busy, setBusy]   = useState(false)
  const prevInt            = useRef(session?.interaction)
  const bottom             = useRef(null)

  useEffect(()=>{ bottom.current?.scrollIntoView({behavior:"smooth"}) },[msgs])

  useEffect(()=>{
    if(session?.interaction>1 && session.interaction!==prevInt.current){
      prevInt.current=session.interaction
      setMsgs(p=>[...p,{
        role:"agent",system:true,
        text:`New data ingested ✓ I now have **${session.interaction} interactions** of Hindsight memory. My answers are now richer and more specific.`,
      }])
    }
  },[session?.interaction])

  const send = async text => {
    const q = text.trim()
    if(!q||busy) return
    setInput("")
    setMsgs(p=>[...p,{role:"user",text:q}])
    setBusy(true)
    try {
      const res  = await fetch(`${API}/chat`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({session_id:session.session_id,message:q}),
      })
      const data = await res.json()
      setMsgs(p=>[...p,{role:"agent",text:data.response,memUsed:!!data.memory_used,interaction:data.interaction}])
    } catch {
      setMsgs(p=>[...p,{role:"agent",text:"Connection error. Is Docker running?",error:true}])
    }
    setBusy(false)
  }

  const renderText = text => {
    if(!text) return ""
    return text.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
  }

  return (
    <div style={S.panel}>
      <div style={S.head}>
        <div>
          <div style={S.headTitle}>💬 Ask the Agent</div>
          <div style={S.headSub}>Powered by Groq + Hindsight Memory</div>
        </div>
        <div style={S.memBadge}>
          🧠 {session?.interaction||1} interaction{session?.interaction!==1?"s":""} of memory
        </div>
      </div>

      <div style={S.messages}>
        {msgs.map((m,i)=>(
          <div key={i} style={{...S.msgWrap,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="agent"&&(
              <div style={S.agentAvatar}>IQ</div>
            )}
            <div style={{
              ...S.bubble,
              ...(m.role==="user"?S.userBub:S.agentBub),
              ...(m.system?S.sysBub:{}),
              ...(m.error?S.errBub:{}),
              ...(m.intro?S.introBub:{}),
            }}>
              <span dangerouslySetInnerHTML={{__html:renderText(m.text)}}/>
              {m.memUsed&&(
                <div style={S.memTag}>
                  🧠 Hindsight memory context applied · Interaction {m.interaction}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy&&(
          <div style={S.msgWrap}>
            <div style={S.agentAvatar}>IQ</div>
            <div style={{...S.bubble,...S.agentBub}}>
              <div style={S.dots}>
                <div style={{...S.dot,animationDelay:"0s"}}/>
                <div style={{...S.dot,animationDelay:".15s"}}/>
                <div style={{...S.dot,animationDelay:".3s"}}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottom}/>
      </div>

      {/* Suggestions */}
      <div style={S.suggWrap}>
        <div style={S.suggLabel}>Quick questions:</div>
        <div style={S.suggRow}>
          {SUGGESTIONS.slice(0,3).map(s=>(
            <button key={s} style={S.sugg} onClick={()=>send(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div style={S.inputRow}>
        <input
          style={S.input}
          placeholder="Ask about your product feedback..."
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send(input)}
          disabled={busy}
        />
        <button
          style={{...S.sendBtn,opacity:busy?.5:1}}
          onClick={()=>send(input)}
          disabled={busy}
        >→</button>
      </div>
    </div>
  )
}

const G = "linear-gradient(135deg,#6EE7B7,#3B82F6)"
const S = {
  panel:     {display:"flex",flexDirection:"column",height:"100%",borderRight:"1px solid #0F1923",background:"#070B14"},
  head:      {padding:"1rem 1.2rem",borderBottom:"1px solid #0F1923",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0A0F1A"},
  headTitle: {fontSize:"13px",fontWeight:"700",color:"#fff",fontFamily:"'Syne',sans-serif"},
  headSub:   {fontSize:"10px",color:"#374151",marginTop:"2px"},
  memBadge:  {fontSize:"10px",color:"#6EE7B7",background:"rgba(110,231,183,.07)",border:"1px solid rgba(110,231,183,.18)",padding:"4px 10px",borderRadius:"10px",fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"},
  messages:  {flex:1,overflowY:"auto",padding:"1rem",display:"flex",flexDirection:"column",gap:".75rem"},
  msgWrap:   {display:"flex",alignItems:"flex-start",gap:"8px"},
  agentAvatar:{width:"26px",height:"26px",background:G,borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"800",color:"#000",flexShrink:0,marginTop:"2px",fontFamily:"'Syne',sans-serif"},
  bubble:    {maxWidth:"85%",padding:"10px 14px",borderRadius:"12px",fontSize:"13px",lineHeight:1.6},
  agentBub:  {background:"#0D1117",border:"1px solid #1F2937",color:"#D1D5DB"},
  userBub:   {background:G,color:"#000",fontWeight:"600",fontSize:"13px"},
  sysBub:    {background:"rgba(110,231,183,.05)",border:"1px solid rgba(110,231,183,.15)",color:"#6EE7B7",fontSize:"11px"},
  errBub:    {background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.2)",color:"#EF4444"},
  introBub:  {background:"#0A0F1A",border:"1px solid rgba(110,231,183,.2)"},
  memTag:    {marginTop:"8px",fontSize:"9px",color:"#374151",borderTop:"1px solid #1F2937",paddingTop:"7px",letterSpacing:".03em"},
  dots:      {display:"flex",gap:"4px",alignItems:"center",height:"16px"},
  dot:       {width:"5px",height:"5px",borderRadius:"50%",background:"#374151",animation:"pulse 1.2s ease infinite"},
  suggWrap:  {padding:".5rem 1rem",borderTop:"1px solid #0F1923"},
  suggLabel: {fontSize:"9px",color:"#374151",marginBottom:"5px",letterSpacing:".08em"},
  suggRow:   {display:"flex",flexDirection:"column",gap:"3px"},
  sugg:      {background:"transparent",border:"1px solid #1F2937",color:"#4B5563",padding:"5px 10px",borderRadius:"6px",fontSize:"11px",textAlign:"left",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"color .2s"},
  inputRow:  {display:"flex",gap:"8px",padding:"1rem",borderTop:"1px solid #0F1923"},
  input:     {flex:1,background:"#0D1117",border:"1px solid #1F2937",borderRadius:"8px",padding:"10px 14px",color:"#fff",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",outline:"none"},
  sendBtn:   {background:G,color:"#000",border:"none",borderRadius:"8px",width:"40px",fontSize:"18px",cursor:"pointer",fontWeight:"800"},
}