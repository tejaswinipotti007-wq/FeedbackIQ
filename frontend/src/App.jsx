import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import Login     from "./pages/Login"
import Landing   from "./pages/Landing"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [user, setUser]       = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <Loader />
  if (!user)    return <Login />
  if (!session) return <Landing user={user} setSession={setSession} />
  return <Dashboard user={user} session={session} setSession={setSession} />
}

function Loader() {
  return (
    <div style={{minHeight:"100vh",background:"#070B14",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"1rem",fontFamily:"'Syne',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:"36px",height:"36px",border:"2px solid #1F2937",borderTop:"2px solid #6EE7B7",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{color:"#374151",fontSize:"13px",letterSpacing:".08em"}}>Loading FeedbackIQ...</div>
    </div>
  )
}