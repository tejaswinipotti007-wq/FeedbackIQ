const G = "linear-gradient(135deg,#6EE7B7,#3B82F6)"

export default function Analytics({ session }) {
  const data      = session?.data    || {}
  const history   = session?.history || []
  const sentiment = data.sentiment   || {positive:0,negative:0,neutral:0,score:50}
  const themes    = data.top_themes  || []
  const channels  = data.channels    || {}
  const total     = Object.values(channels).reduce((a,b)=>a+b,0)
  const interaction = session?.interaction || 1

  const sentColor = sentiment.score>=60?"#6EE7B7":sentiment.score>=40?"#F59E0B":"#EF4444"

  return (
    <div style={S.panel}>
      <div style={S.head}>
        <div>
          <div style={S.headTitle}>📊 Live Signals</div>
          <div style={S.headSub}>Real-time analytics</div>
        </div>
        <div style={S.liveBadge}><span style={S.liveDot}/>LIVE</div>
      </div>

      <div style={S.scroll}>

        {/* Sentiment Score */}
        <div style={S.card}>
          <div style={S.cardLabel}>SENTIMENT SCORE</div>
          <div style={{...S.bigNum,color:sentColor}}>{sentiment.score}%</div>
          <div style={S.sentStatus}>
            {sentiment.score>=60?"📈 Positive trend":sentiment.score>=40?"↔ Mixed signals":"⚠️ Needs attention"}
          </div>
          <div style={S.sentBars}>
            <SBar label="Positive" count={sentiment.positive} color="#6EE7B7" total={sentiment.positive+sentiment.negative+sentiment.neutral}/>
            <SBar label="Neutral"  count={sentiment.neutral}  color="#F59E0B" total={sentiment.positive+sentiment.negative+sentiment.neutral}/>
            <SBar label="Negative" count={sentiment.negative} color="#EF4444" total={sentiment.positive+sentiment.negative+sentiment.neutral}/>
          </div>
        </div>

        {/* Trend chart */}
        {history.length>1&&(
          <div style={S.card}>
            <div style={S.cardLabel}>SENTIMENT TREND</div>
            <LineChart history={history}/>
          </div>
        )}

        {/* Top issues */}
        {themes.length>0&&(
          <div style={S.card}>
            <div style={S.cardLabel}>🔥 TOP ISSUES DETECTED</div>
            {themes.map((t,i)=>(
              <div key={i} style={S.themeRow}>
                <span style={S.themeRank}>#{i+1}</span>
                <span style={S.themeName}>{t.theme}</span>
                <div style={S.themeBarWrap}>
                  <div style={{...S.themeBar,width:`${Math.min((t.count/10)*100,100)}%`}}/>
                </div>
                <span style={S.themeCount}>{t.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Channel breakdown */}
        {total>0&&(
          <div style={S.card}>
            <div style={S.cardLabel}>📢 BY CHANNEL</div>
            {Object.entries(channels).map(([ch,cnt])=>{
              const pct=total>0?Math.round((cnt/total)*100):0
              return (
                <div key={ch} style={{marginBottom:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",marginBottom:"4px"}}>
                    <span style={{color:"#6B7280"}}>{fmtCh(ch)}</span>
                    <span style={{color:"#4B5563"}}>{cnt} <span style={{color:"#374151"}}>({pct}%)</span></span>
                  </div>
                  <div style={S.barWrap}>
                    <div style={{...S.bar,width:`${pct}%`}}/>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Alert */}
        {sentiment.score<40&&(
          <div style={S.alert}>
            <div style={S.alertIcon}>⚠️</div>
            <div>
              <div style={S.alertTitle}>Sentiment Critical</div>
              <div style={S.alertDesc}>Score below 40% — major issues may be escalating across channels.</div>
            </div>
          </div>
        )}

        {/* Memory depth */}
        <div style={S.card}>
          <div style={S.cardLabel}>🧠 HINDSIGHT MEMORY DEPTH</div>
          <div style={S.memMeter}>
            <div style={S.memBarWrap}>
              <div style={{...S.memBar,width:`${Math.min((interaction/20)*100,100)}%`}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:"#374151",marginTop:"4px"}}>
              <span>Interaction 1</span>
              <span style={{color:"#6EE7B7",fontWeight:"700"}}>{interaction}/20</span>
              <span>Expert</span>
            </div>
          </div>
          <div style={S.memStage}>
            {interaction<=3?"🟡 Early — basic patterns only":
             interaction<=8?"🟠 Building — cross-channel insights emerging":
             interaction<=15?"🟢 Deep — timeline & causation visible":
             "🔵 Expert — full predictive capability"}
          </div>
        </div>

        {/* Avg rating */}
        {data.avg_rating&&(
          <div style={S.card}>
            <div style={S.cardLabel}>⭐ AVG RATING</div>
            <div style={S.ratingWrap}>
              <div style={S.ratingNum}>{data.avg_rating}</div>
              <div style={S.ratingStars}>
                {"★★★★★".split("").map((s,i)=>(
                  <span key={i} style={{color:i<Math.round(data.avg_rating)?"#F59E0B":"#1F2937",fontSize:"16px"}}>{s}</span>
                ))}
              </div>
              <div style={S.ratingLabel}>out of 5.0</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function SBar({label,count,color,total}) {
  const pct=total>0?Math.round((count/total)*100):0
  return (
    <div style={{marginBottom:"6px"}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",marginBottom:"3px"}}>
        <span style={{color:"#4B5563"}}>{label}</span>
        <span style={{color}}>{count} ({pct}%)</span>
      </div>
      <div style={{height:"3px",background:"#1F2937",borderRadius:"2px",overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:"2px",transition:"width .5s"}}/>
      </div>
    </div>
  )
}

function LineChart({history}) {
  const scores=history.map(h=>{
    const m=h.collected?.match(/Sentiment: (\d+)%/)
    return m?parseInt(m[1]):50
  })
  if(scores.length<2) return null
  const W=200,H=60
  const pts=scores.map((s,i)=>{
    const x=(i/(scores.length-1))*W
    const y=H-(s/100)*H
    return `${x},${y}`
  }).join(" ")
  return (
    <div style={{paddingTop:"8px"}}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6EE7B7"/>
            <stop offset="100%" stopColor="#3B82F6"/>
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {scores.map((s,i)=>{
          const x=(i/(scores.length-1))*W
          const y=H-(s/100)*H
          return <circle key={i} cx={x} cy={y} r="3" fill="#6EE7B7"/>
        })}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",color:"#374151",marginTop:"2px"}}>
        <span>Start</span><span>Now</span>
      </div>
    </div>
  )
}

const fmtCh=c=>({app_store:"App Store",reddit:"Reddit",g2:"G2",trustpilot:"Trustpilot",support_tickets:"Support"}[c]||c)

const S = {
  panel:     {display:"flex",flexDirection:"column",height:"100%",background:"#070B14"},
  head:      {padding:"1rem 1.2rem",borderBottom:"1px solid #0F1923",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0A0F1A"},
  headTitle: {fontSize:"13px",fontWeight:"700",color:"#fff",fontFamily:"'Syne',sans-serif"},
  headSub:   {fontSize:"10px",color:"#374151",marginTop:"2px"},
  liveBadge: {display:"flex",alignItems:"center",gap:"5px",fontSize:"10px",color:"#6EE7B7",letterSpacing:".1em",fontWeight:"700",fontFamily:"'Syne',sans-serif"},
  liveDot:   {width:"6px",height:"6px",borderRadius:"50%",background:"#6EE7B7",animation:"pulse 1.5s infinite"},
  scroll:    {flex:1,overflowY:"auto",padding:"1rem",display:"flex",flexDirection:"column",gap:".8rem"},
  card:      {background:"#0D1117",border:"1px solid #1F2937",borderRadius:"12px",padding:"1rem"},
  cardLabel: {fontSize:"9px",color:"#4B5563",letterSpacing:".12em",marginBottom:"10px",fontFamily:"'Syne',sans-serif"},
  bigNum:    {fontSize:"2.8rem",fontWeight:"800",fontFamily:"'Syne',sans-serif",lineHeight:1},
  sentStatus:{fontSize:"11px",color:"#6B7280",marginTop:"4px",marginBottom:"10px"},
  sentBars:  {},
  themeRow:  {display:"flex",alignItems:"center",gap:"7px",fontSize:"10px",marginBottom:"7px"},
  themeRank: {color:"#374151",width:"18px",fontFamily:"'Syne',sans-serif"},
  themeName: {color:"#9CA3AF",width:"100px"},
  themeBarWrap:{flex:1,height:"3px",background:"#1F2937",borderRadius:"2px",overflow:"hidden"},
  themeBar:  {height:"100%",background:"linear-gradient(90deg,#6EE7B7,#3B82F6)",borderRadius:"2px",transition:"width .5s"},
  themeCount:{color:"#374151",fontSize:"9px"},
  barWrap:   {height:"3px",background:"#1F2937",borderRadius:"2px",overflow:"hidden"},
  bar:       {height:"100%",background:"linear-gradient(90deg,#6EE7B7,#3B82F6)",borderRadius:"2px",transition:"width .5s"},
  alert:     {background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.2)",borderRadius:"12px",padding:"1rem",display:"flex",gap:"10px",alignItems:"flex-start"},
  alertIcon: {fontSize:"1.2rem"},
  alertTitle:{fontSize:"12px",fontWeight:"700",color:"#EF4444",marginBottom:"3px",fontFamily:"'Syne',sans-serif"},
  alertDesc: {fontSize:"11px",color:"#9CA3AF",lineHeight:1.5},
  memMeter:  {marginBottom:"8px"},
  memBarWrap:{height:"6px",background:"#1F2937",borderRadius:"3px",overflow:"hidden",marginBottom:"6px"},
  memBar:    {height:"100%",background:"linear-gradient(90deg,#6EE7B7,#3B82F6)",borderRadius:"3px",transition:"width .6s"},
  memStage:  {fontSize:"11px",color:"#6B7280"},
  ratingWrap:{display:"flex",alignItems:"center",gap:"10px"},
  ratingNum: {fontSize:"2rem",fontWeight:"800",fontFamily:"'Syne',sans-serif",color:"#F59E0B"},
  ratingStars:{display:"flex",gap:"1px"},
  ratingLabel:{fontSize:"10px",color:"#4B5563"},
}