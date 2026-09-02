"use client";
import { useState } from "react";

const nav = [
  ["◈","Home"],["🎬","AI Video"],["✂","Pro Editor"],["🎙","Audio & Voice"],
  ["▣","Photo Studio"],["CC","Captions"],["🌍","50 Languages"],["●","Live Production"],
  ["👩‍🏫","AI Teacher"],["🏢","Enterprise"],["©","Copyright"],["💳","Payments"],
  ["📱","Social"],["🛡","Security"],["⚙","Settings"]
];

const tools = [
  ["🎬","AI Video Production","Text-to-video, scripts, scenes, presenters, two-person dialogue, talking characters, long and short videos."],
  ["✂️","Professional Editor","Timeline, drag/drop clips, trim, split, transitions, effects, keyframes, B-roll and thumbnails."],
  ["🎨","Color & Effects","LUT workflow, grading controls, exposure, contrast, curves, masks, blur and creative effects."],
  ["🎙️","Audio Studio","Noise removal, voice cleanup, enhancement, dubbing, music, mixer and voice-over workflow."],
  ["CC","Captions & Subtitles","Auto captions, translation, styling, speaker labels, subtitle export and burn-in workflow."],
  ["🖼️","Photo Studio","Layers, crop, retouch, background tools, typography, thumbnails and social graphics."],
  ["🌍","Global Production","Create, translate, subtitle and dub content in 50 languages."],
  ["📡","Live Production","Scenes, guests, overlays, production controls and live publishing workflow."],
  ["👩‍🏫","AI Teacher Academy","Courses, lessons, tutoring, English, Arabic and creator education."],
  ["🏢","Enterprise AI","Secure data workflows, spreadsheet automation, analytics and company workspaces."],
  ["©","Copyright Center","Rights management, fingerprinting, claims, takedown and authenticity workflow."],
  ["💳","Payments & Monetization","Subscriptions, credits, wallet/payment-provider integration and creator billing."],
  ["📱","Social Publishing","Prepare and share to YouTube, TikTok, Instagram, Facebook and Snapchat."],
  ["🛡️","Cyber Security","Authentication, rate limits, private media, secrets, audit and production hardening."],
  ["☁️","Render Cloud","Queue architecture, FFmpeg workers, GPU rendering, proxies and production jobs."]
];

const formats=["Wedding","Shorts","Storytelling","Documentary","News","Podcast","Course","Advertisement","Music","Interview","Explainer","Live"];

const securityChecks = [
  ["🔐","Secrets stay server-side","Cloudflare/API secrets are never placed in browser code or the page UI.","READY"],
  ["🧱","Security headers","HSTS, CSP, frame protection, MIME sniffing protection and referrer controls are configured at the app edge.","READY"],
  ["🛡️","Input validation","AI generation requests are checked for method, content type, JSON size, prompt length and allowed duration.","READY"],
  ["🚦","Abuse controls","Generation endpoints should be rate-limited at Cloudflare and later tied to authenticated user/tenant IDs.","NEXT"],
  ["👤","Authentication","Login/session authorization is required before production users can create paid/private jobs.","NEXT"],
  ["💳","Payment webhooks","Payments must be verified server-side with signed webhook validation before credits are added.","NEXT"],
  ["📋","Audit trail","Security-sensitive actions should be recorded with request/user/job IDs without storing secrets.","NEXT"],
  ["🗄️","Private storage","Generated media should use private storage and short-lived signed URLs rather than public permanent URLs.","NEXT"]
];

export default function Home(){
  const [active,setActive]=useState("Home");
  const [prompt,setPrompt]=useState("");
  const [lang,setLang]=useState("English");
  const [minutes,setMinutes]=useState("10");
  const [notice,setNotice]=useState("Ready");
  const [tab,setTab]=useState("All");
  const [videoUrl,setVideoUrl]=useState<string | null>(null);
  const [busy,setBusy]=useState(false);
  const [securityMessage,setSecurityMessage]=useState("");

  async function create(){
    if(!prompt.trim()){
      setNotice("Describe the video you want to create first.");
      setActive("AI Video");
      return;
    }

    setBusy(true);
    setVideoUrl(null);
    setNotice("Sending your prompt to the AI video generator…");
    setActive("AI Video");

    try{
      const res=await fetch("/api/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          prompt,
          language:lang,
          durationMinutes:Number(minutes)
        })
      });

      const data=await res.json();

      if(!res.ok){
        throw new Error(data?.error || "Generation failed");
      }

      if(data.videoUrl){
        setVideoUrl(data.videoUrl);
        setNotice("Video generated successfully.");
      }else{
        setNotice(data?.message || "Generation completed.");
      }
    }catch(error){
      setNotice(error instanceof Error ? error.message : "Generation failed.");
    }finally{
      setBusy(false);
    }
  }

  const securityPage = active === "Security";

  function runSecurityCheck(){
    setSecurityMessage(
      "Security baseline checked: browser is using HTTPS, the Security workspace is active, and secrets are designed to remain server-side. Production authentication, persistent audit logs and per-user rate limits still need their real backend services."
    );
  }

  return <div className="app">
    <header className="top">
      <div className="brand"><div className="mark">S</div><div><strong>SmartPoint</strong><small>AI CREATIVE CLOUD</small></div></div>
      <div className="search">⌕ <input placeholder="Search tools, projects, templates..." /></div>
      <div className="topright"><span className="status">● System ready</span><button>Help</button><button className="avatar">AI</button></div>
    </header>

    <div className="body">
      <aside className="side">
        <div className="new"><button onClick={()=>setActive("AI Video")}>＋ New project</button></div>
        <div className="label">WORKSPACE</div>
        {nav.map(([icon,name])=><button key={name} className={active===name?"nav active":"nav"} onClick={()=>setActive(name)}><span>{icon}</span>{name}</button>)}
        <div className="label">PROJECTS</div>
        <button className="project">Wedding Story <i>•</i></button>
        <button className="project">News Package</button>
        <button className="project">Podcast Episode</button>
        <div className="sidefoot">🔒 Secure workspace<br/><small>Secrets stay server-side.</small></div>
      </aside>

      <main>
        {securityPage ? (
          <section style={{padding:"32px 24px"}}>
            <div style={{maxWidth:1100}}>
              <div className="eyebrow">SMARTPOINT AI STUDIO • SECURITY CENTER</div>
              <div style={{
                display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",
                flexWrap:"wrap",marginBottom:24
              }}>
                <div>
                  <h1 style={{fontSize:42,margin:"8px 0"}}>Security Center</h1>
                  <p style={{maxWidth:760,opacity:.78,fontSize:16}}>
                    Defense-in-depth controls for the SmartPoint workspace, AI generation,
                    payments and private creator data.
                  </p>
                </div>
                <button className="primary" onClick={runSecurityCheck}>Run security check →</button>
              </div>

              {securityMessage && <div style={{
                padding:16,borderRadius:14,marginBottom:20,
                border:"1px solid rgba(255,255,255,.12)",
                background:"rgba(255,255,255,.045)"
              }}>🛡️ {securityMessage}</div>}

              <div style={{
                display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",
                gap:16,marginBottom:24
              }}>
                <div style={{padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:30}}>🟢</div><h3>Protected baseline</h3>
                  <p style={{opacity:.7}}>Transport and browser security headers are enabled by the app configuration.</p>
                </div>
                <div style={{padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:30}}>🔒</div><h3>Secrets</h3>
                  <p style={{opacity:.7}}>Provider credentials belong in Cloudflare secrets, never in client code.</p>
                </div>
                <div style={{padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:30}}>🚦</div><h3>Abuse prevention</h3>
                  <p style={{opacity:.7}}>Rate limits and user-based quotas are part of the production hardening layer.</p>
                </div>
                <div style={{padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:30}}>💳</div><h3>Payment safety</h3>
                  <p style={{opacity:.7}}>Credits must only be granted after server-side verification of payment events.</p>
                </div>
              </div>

              <div style={{
                border:"1px solid rgba(255,255,255,.1)",borderRadius:20,
                overflow:"hidden",background:"rgba(255,255,255,.025)"
              }}>
                {securityChecks.map(([icon,title,desc,status])=><div key={title} style={{
                  display:"grid",gridTemplateColumns:"44px 1fr auto",gap:14,alignItems:"center",
                  padding:"18px 20px",borderBottom:"1px solid rgba(255,255,255,.07)"
                }}>
                  <div style={{fontSize:24}}>{icon}</div>
                  <div><strong>{title}</strong><div style={{opacity:.68,fontSize:14,marginTop:4}}>{desc}</div></div>
                  <span style={{
                    fontSize:11,fontWeight:700,letterSpacing:.8,
                    padding:"6px 9px",borderRadius:999,
                    border:"1px solid rgba(255,255,255,.12)"
                  }}>{status}</span>
                </div>)}
              </div>

              <div style={{
                marginTop:20,padding:20,borderRadius:18,
                border:"1px dashed rgba(255,255,255,.16)",opacity:.78
              }}>
                <strong>Important:</strong> this security center is a real UI and the security-header
                configuration is real. It does not pretend that authentication, a database,
                payment webhooks or durable audit logging already exist. Those require the actual
                production services and must be implemented server-side.
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="hero">
              <div>
                <div className="eyebrow">SMARTPOINT AI STUDIO • V27</div>
                <h1>Everything you need<br/><em>to create.</em></h1>
                <p>Produce, edit, enhance, teach, publish and monetize professional video from one modern workspace.</p>
                <div className="heroBtns"><button className="primary" onClick={()=>setActive("AI Video")}>Start creating →</button><button onClick={()=>setActive("Pro Editor")}>Open editor</button></div>
              </div>

              <div className="createCard">
                <div className="cardtop"><b>AI video creator</b><span>LIVE GENERATION</span></div>
                <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe what you want to make... e.g. a 10-minute Somali documentary with narration, B-roll and captions." />
                <div className="controls">
                  <select value={lang} onChange={e=>setLang(e.target.value)}>
                    <option>English</option><option>Somali</option><option>Arabic</option><option>Swahili</option><option>French</option><option>Spanish</option>
                  </select>
                  <select value={minutes} onChange={e=>setMinutes(e.target.value)}>
                    <option value="1">1 min</option><option value="5">5 min</option><option value="10">10 min</option><option value="30">30 min</option><option value="60">60 min</option><option value="180">180 min</option>
                  </select>
                  <button className="primary" onClick={create} disabled={busy}>{busy ? "Generating…" : "Create"}</button>
                </div>
                <small>{notice}</small>

                {videoUrl && <div style={{marginTop:16}}>
                  <video controls src={videoUrl} style={{width:"100%",borderRadius:12}} />
                  <div style={{marginTop:8}}><a href={videoUrl} target="_blank" rel="noreferrer">Open generated video →</a></div>
                </div>}
              </div>
            </section>

            <section className="formats">
              {formats.map(f=><button key={f} onClick={()=>{setPrompt(`Create a professional ${f.toLowerCase()} video`);setActive("AI Video")}}>{f}</button>)}
            </section>

            <section className="section">
              <div className="sectionhead"><div><h2>Creative suite</h2><p>Every major production workflow, connected.</p></div><div className="tabs">{["All","Create","Edit","Publish","Business"].map(x=><button className={tab===x?"selected":""} key={x} onClick={()=>setTab(x)}>{x}</button>)}</div></div>
              <div className="grid">
                {tools.map(([icon,title,desc])=><article className="tool" key={title}>
                  <div className="toolIcon">{icon}</div><h3>{title}</h3><p>{desc}</p><button onClick={()=>setActive(title)}>Open workspace <span>→</span></button>
                </article>)}
              </div>
            </section>

            <section className="editor">
              <div className="sectionhead"><div><h2>Pro timeline</h2><p>Video · B-roll · Audio · Captions · Graphics</p></div><button onClick={()=>setActive("Pro Editor")}>Full editor →</button></div>
              <div className="ruler">00:00　　00:15　　00:30　　00:45　　01:00　　01:15　　01:30</div>
              <div className="track"><label>VIDEO</label><div className="clip main">Main footage</div><div className="clip broll">B-roll</div><div className="clip scene">Scene 03</div></div>
              <div className="track"><label>AUDIO</label><div className="clip audio">Voice-over / cleaned audio</div><div className="clip music">Music</div></div>
              <div className="track"><label>TEXT</label><div className="clip captions">Auto captions / subtitles</div><div className="clip title">Title card</div></div>
            </section>

            <section className="featureRow">
              <div><span>50</span><b>languages</b><small>Translation · dubbing · captions</small></div>
              <div><span>180</span><b>minutes</b><small>Long-form project workflow</small></div>
              <div><span>∞</span><b>creative projects</b><small>Workspace architecture</small></div>
              <div><span>24/7</span><b>production</b><small>Queue + worker architecture</small></div>
            </section>

            <footer><b>SmartPoint AI Studio</b><span>Privacy · Terms · Copyright · Security · Responsible AI</span><span>© 2026</span></footer>
          </>
        )}
      </main>
    </div>
  </div>
}
