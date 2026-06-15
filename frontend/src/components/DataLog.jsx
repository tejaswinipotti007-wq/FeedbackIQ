const G = "linear-gradient(135deg,#6EE7B7,#3B82F6)"

export default function DataLog({ session }) {
  const history  = session?.history  || []
  const channels = session?.data?.channels || {}

  return (
    <div style={S.panel}>
      <div style={S.head}>
        <div>
          <div style={S.headTitle}>📋 Data Log</div>
          <div style={S.headSub}>Collected & learned per interaction</div>
        </div>
        <div style={S.totalBadge}>{history.length} interactions</div>
      </div>

      <div style={S.scroll}>
        {[...history].reverse().map((entry, i) => (
          <div key={i} style={{...S.card, ...(i===0?S.cardNew:{}), animation:"fadeIn .3s ease"}}>
            {i===0 && <div style={S.newTag}>NEW</div>}

            <div style={S.cardTop}>
              <div>
                <div style={S.intLabel}>Interaction {entry.interaction}</div>
                <div style={S.dateLabel}>{fmtDate(entry.date)}</div>
              </div>
              <div style={S.countBadge}>{parseCount(entry.collected)}</div>
            </div>

            {/* Channel bars - only for latest */}
            {i===0 && Object.keys(channels).length > 0 && (
              <div style={S.bars}>
                {Object.entries(channels).map(([ch, cnt]) => {
                  const max = Math.max(...Object.values(channels))
                  return (
                    <div key={ch} style={S.barRow}>
                      <span style={S.chName}>{fmtCh(ch)}</span>
                      <div style={S.barWrap}>
                        <div style={{...S.bar, width:`${(cnt/max)*100}%`}}/>
                      </div>
                      <span style={S.chCnt}>{cnt}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={S.learnBox}>
              <div style={S.learnHead}>
                <span style={S.brainIcon}>🧠</span>
                <span style={S.learnTitle}>Hindsight Learned:</span>
              </div>
              <p style={S.learnText}>{entry.learned}</p>
            </div>
          </div>
        ))}

        {history.length===0 && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>📭</div>
            <div style={S.emptyText}>Waiting for first data batch...</div>
          </div>
        )}
      </div>
    </div>
  )
}

const fmtDate = iso => {
  try { return new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) }
  catch { return iso }
}
const parseCount = s => {
  const m = s?.match(/Collected (\d+)/)
  return m ? `${m[1]} items` : s?.split(".")[0]||""
}
const fmtCh = c => ({app_store:"App Store",reddit:"Reddit",g2:"G2",trustpilot:"Trustpilot",support_tickets:"Support"}[c]||c)

const S = {
  panel:    {borderRight:"1px solid #0F1923",display:"flex",flexDirection:"column",height:"100%",background:"#070B14"},
  head:     {padding:"1rem 1.2rem",borderBottom:"1px solid #0F1923",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0A0F1A"},
  headTitle:{fontSize:"13px",fontWeight:"700",color:"#fff",fontFamily:"'Syne',sans-serif"},
  headSub:  {fontSize:"10px",color:"#374151",marginTop:"2px"},
  totalBadge:{background:"#1F2937",color:"#6B7280",padding:"3px 10px",borderRadius:"10px",fontSize:"10px"},
  scroll:   {flex:1,overflowY:"auto",padding:"1rem",display:"flex",flexDirection:"column",gap:".8rem"},
  card:     {background:"#0D1117",border:"1px solid #1F2937",borderRadius:"12px",padding:"1rem",position:"relative"},
  cardNew:  {border:"1px solid rgba(110,231,183,.25)",background:"rgba(110,231,183,.02)"},
  newTag:   {position:"absolute",top:"8px",right:"8px",background:"linear-gradient(135deg,#6EE7B7,#3B82F6)",color:"#000",fontSize:"8px",fontWeight:"900",padding:"2px 7px",borderRadius:"4px",letterSpacing:".1em",fontFamily:"'Syne',sans-serif"},
  cardTop:  {display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"},
  intLabel: {color:"#fff",fontSize:"12px",fontWeight:"700",fontFamily:"'Syne',sans-serif"},
  dateLabel:{color:"#374151",fontSize:"9px",marginTop:"2px"},
  countBadge:{background:"rgba(110,231,183,.08)",color:"#6EE7B7",padding:"3px 8px",borderRadius:"8px",fontSize:"10px",fontFamily:"'Syne',sans-serif",fontWeight:"600"},
  bars:     {marginBottom:"10px",display:"flex",flexDirection:"column",gap:"5px"},
  barRow:   {display:"flex",alignItems:"center",gap:"6px",fontSize:"9px"},
  chName:   {color:"#4B5563",width:"68px",flexShrink:0},
  barWrap:  {flex:1,height:"3px",background:"#1F2937",borderRadius:"2px",overflow:"hidden"},
  bar:      {height:"100%",background:"linear-gradient(90deg,#6EE7B7,#3B82F6)",borderRadius:"2px",transition:"width .6s ease"},
  chCnt:    {color:"#374151",width:"20px",textAlign:"right"},
  learnBox: {background:"#0A0F1A",borderRadius:"8px",padding:"10px",borderLeft:"2px solid rgba(110,231,183,.3)"},
  learnHead:{display:"flex",alignItems:"center",gap:"6px",marginBottom:"5px"},
  brainIcon:{fontSize:"12px"},
  learnTitle:{fontSize:"9px",color:"#6EE7B7",letterSpacing:".08em",fontWeight:"600"},
  learnText:{fontSize:"11px",color:"#6B7280",lineHeight:1.6},
  empty:    {display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem",gap:"1rem"},
  emptyIcon:{fontSize:"2rem"},
  emptyText:{color:"#374151",fontSize:"12px"},
}