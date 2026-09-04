"use client";
import { useEffect, useState } from "react";

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

const moduleInfo: Record<string,{icon:string;title:string;description:string;status:string}> = {
  "Pro Editor": {icon:"✂", title:"Professional Editor", description:"Timeline, trim, split, transitions, effects, keyframes, B-roll and thumbnails.", status:"WORKSPACE READY"},
  "Audio & Voice": {icon:"🎙", title:"Audio & Voice Studio", description:"Voice cleanup, noise removal, dubbing, music, mixer and voice-over workflow.", status:"WORKSPACE READY"},
  "Photo Studio": {icon:"▣", title:"Photo Studio", description:"Layers, crop, retouch, background tools, typography and social graphics.", status:"WORKSPACE READY"},
  "Captions": {icon:"CC", title:"Captions & Subtitles", description:"Auto captions, translation, speaker labels, styling and subtitle export.", status:"WORKSPACE READY"},
  "50 Languages": {icon:"🌍", title:"Global Production", description:"Translate, subtitle and dub creator content across 50 languages.", status:"WORKSPACE READY"},
  "Live Production": {icon:"●", title:"Live Production", description:"Scenes, guests, overlays, production controls and live publishing workflow.", status:"WORKSPACE READY"},
  "AI Teacher": {icon:"👩‍🏫", title:"AI Teacher Academy", description:"Courses, lessons, tutoring and creator education workflows.", status:"WORKSPACE READY"},
  "Enterprise": {icon:"🏢", title:"Enterprise AI", description:"Secure company workspaces, analytics and automation workflows.", status:"WORKSPACE READY"},
  "Copyright": {icon:"©", title:"Copyright Center", description:"Rights management, authenticity, claims and takedown workflows.", status:"WORKSPACE READY"},
  "Social": {icon:"📱", title:"Social Publishing", description:"Prepare content for YouTube, TikTok, Instagram, Facebook and Snapchat.", status:"WORKSPACE READY"},
  "Settings": {icon:"⚙", title:"Settings", description:"Workspace preferences, account controls and production configuration.", status:"WORKSPACE READY"},
};

export default function Home(){
  const [active,setActive]=useState("Home");
  const [prompt,setPrompt]=useState("");
  const [lang,setLang]=useState("English");
  const [minutes,setMinutes]=useState("10");
  const [notice,setNotice]=useState("Ready");
  const [tab,setTab]=useState("All");
  const [videoUrl,setVideoUrl]=useState<string | null>(null);
  const [busy,setBusy]=useState(false);
  const [paymentNotice,setPaymentNotice]=useState("");
  const [search,setSearch]=useState("");
  const [projectNotice,setProjectNotice]=useState("");
  const [loggedIn,setLoggedIn]=useState(false);
  const [credits,setCredits]=useState(0);
  const [projectCount,setProjectCount]=useState(3);
  const [toast,setToast]=useState("");

  function flash(message:string){
    setToast(message);
    window.setTimeout(()=>setToast(""),3200);
  }

  useEffect(()=>{
    fetch("/api/auth/google?mode=session", {credentials:"include"})
      .then(r=>r.ok?r.json():null)
      .then(data=>{ if(data?.authenticated) setLoggedIn(true); })
      .catch(()=>{});
    try{
      const savedCount = Number(localStorage.getItem("smartpoint_project_count") || "3");
      if(savedCount >= 3) setProjectCount(savedCount);
    }catch{}
  },[]);

  function startGoogleLogin(){
    window.location.href = "/api/auth/google?mode=start";
  }

  async function signOut(){
    try{ await fetch("/api/auth/google?mode=logout", {credentials:"include"}); }catch{}
    setLoggedIn(false);
    flash("Signed out.");
  }

  function saveProject(){
    if(!prompt.trim()){
      setNotice("Write a video idea before saving the project.");
      setActive("AI Video");
      return;
    }
    const next = projectCount + 1;
    setProjectCount(next);
    try{
      localStorage.setItem("smartpoint_project_count", String(next));
      localStorage.setItem("smartpoint_last_prompt", prompt);
    }catch{}
    flash("Project saved to this browser workspace.");
  }

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

      if(data.provider === "fal" && data.falRequestId){
        setNotice(data.message || "Video generation queued…");
        let finished=false;
        for(let attempt=0; attempt<90; attempt++){
          await new Promise(resolve=>window.setTimeout(resolve,2000));
          const statusRes=await fetch(`/api/generate/status?requestId=${encodeURIComponent(data.falRequestId)}`,{cache:"no-store"});
          const status=await statusRes.json();
          if(!statusRes.ok){
            throw new Error(status?.error || "Could not check video generation status.");
          }
          if(status.status === "COMPLETED" && status.videoUrl){
            setVideoUrl(status.videoUrl);
            setNotice("Video generated successfully.");
            finished=true;
            break;
          }
          if(status.status === "FAILED"){
            throw new Error(status?.error || "fal.ai video generation failed.");
          }
          if(status.status === "IN_PROGRESS"){
            setNotice("AI is generating your video…");
          }else{
            setNotice("Your video is in the AI queue…");
          }
        }
        if(!finished){
          throw new Error("The video is still processing. Please try again in a moment.");
        }
      }else if(data.videoUrl){
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

  const openPaymentSetup = () => {
    setPaymentNotice("Billing UI is ready. No money is charged in demo mode. Connect Paystack server-side before accepting real payments.");
  };

  const paymentsPage = active === "Payments";
  const securityPage = active === "Security";
  const workspacePage = Boolean(moduleInfo[active]);
  const workspace = moduleInfo[active];

  const openTool = (title:string) => {
    const map: Record<string,string> = {
      "AI Video Production":"AI Video",
      "Professional Editor":"Pro Editor",
      "Color & Effects":"Pro Editor",
      "Audio Studio":"Audio & Voice",
      "Captions & Subtitles":"Captions",
      "Photo Studio":"Photo Studio",
      "Global Production":"50 Languages",
      "Live Production":"Live Production",
      "AI Teacher Academy":"AI Teacher",
      "Enterprise AI":"Enterprise",
      "Copyright Center":"Copyright",
      "Payments & Monetization":"Payments",
      "Social Publishing":"Social",
      "Cyber Security":"Security",
      "Render Cloud":"Pro Editor"
    };
    setActive(map[title] || "Home");
  };

  return <div className="app">
    {toast && <div style={{position:"fixed",right:20,top:76,zIndex:50,padding:"14px 18px",borderRadius:14,border:"1px solid rgba(255,255,255,.18)",background:"rgba(15,15,22,.96)",boxShadow:"0 18px 50px rgba(0,0,0,.35)"}}>{toast}</div>}
    <header className="top">
      <div className="brand"><div className="mark">S</div><div><strong>SmartPoint</strong><small>AI CREATIVE CLOUD</small></div></div>
      <div className="search">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tools, projects, templates..." /></div>
      <div className="topright"><span className="status">● System ready</span><span style={{opacity:.75}}>Credits: {credits}</span><button onClick={()=>setNotice("Help Center: choose a workspace from the left menu or describe a video in AI Video.")}>Help</button><button className="avatar" onClick={()=>loggedIn?signOut():startGoogleLogin()} title={loggedIn?"Sign out":"Sign in with Google"}>{loggedIn?"ME":"AI"}</button></div>
    </header>

    <div className="body">
      <aside className="side">
        <div className="new"><button onClick={()=>{setPrompt("");setVideoUrl(null);setNotice("New project ready.");setActive("AI Video");flash("New project started.")}}>＋ New project</button></div>
        <div className="label">WORKSPACE</div>
        {nav.map(([icon,name])=><button key={name} className={active===name?"nav active":"nav"} onClick={()=>setActive(name)}><span>{icon}</span>{name}</button>)}
        <div className="label">PROJECTS</div>
        <button className="project" onClick={()=>{setPrompt("Create a wedding story with cinematic B-roll and narration");setActive("AI Video");setProjectNotice("Wedding Story opened")}}>Wedding Story <i>•</i></button>
        <button className="project" onClick={()=>{setPrompt("Create a professional news package with narration and captions");setActive("AI Video");setProjectNotice("News Package opened")}}>News Package</button>
        <button className="project" onClick={()=>{setPrompt("Create a podcast episode with two-person dialogue and clean audio");setActive("AI Video");setProjectNotice("Podcast Episode opened")}}>Podcast Episode</button>
        <div className="sidefoot">📁 {projectCount} projects in this browser workspace<br/><br/>🔒 Secure workspace<br/><small>Secrets stay server-side.</small>{projectNotice && <><br/><small>{projectNotice}</small></>}</div>
      </aside>

      <main>
        {active === "Home" && search.trim() ? (
          <section style={{padding:"32px 24px"}}>
            <div style={{border:"1px solid rgba(255,255,255,.12)",borderRadius:24,padding:32,background:"rgba(255,255,255,.035)",maxWidth:1000}}>
              <div style={{fontSize:13,letterSpacing:1.5,opacity:.7}}>SMARTPOINT SEARCH</div>
              <h1 style={{fontSize:42,margin:"10px 0"}}>Search results</h1>
              <p style={{opacity:.75}}>Results for <b>{search}</b></p>
              <div style={{display:"grid",gap:12,marginTop:24}}>
                {tools.filter(t=>t.join(" ").toLowerCase().includes(search.toLowerCase())).map(([icon,title,desc])=><button key={title} onClick={()=>openTool(title)} style={{textAlign:"left",padding:18,borderRadius:16,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"inherit"}}><b>{icon} {title}</b><div style={{opacity:.7,marginTop:6}}>{desc}</div></button>)}
                {!tools.some(t=>t.join(" ").toLowerCase().includes(search.toLowerCase())) && <div style={{opacity:.7}}>No matching workspace found. Try “video”, “audio”, “payments” or “security”.</div>}
              </div>
            </div>
          </section>
        ) : active === "Settings" ? (
          <section style={{padding:"32px 24px"}}>
            <div style={{border:"1px solid rgba(255,255,255,.12)",borderRadius:24,padding:32,background:"rgba(255,255,255,.035)",maxWidth:1000}}>
              <div style={{fontSize:13,letterSpacing:1.5,opacity:.7}}>SMARTPOINT AI STUDIO • SETTINGS</div>
              <h1 style={{fontSize:42,margin:"10px 0"}}>Workspace Settings</h1>
              <p style={{opacity:.75}}>Control your creator workspace without exposing provider secrets in the browser.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:26}}>
                {[["Account","Creator workspace",loggedIn?"SIGNED IN":"GUEST"],["Generation","AI video defaults","HD • scene workflow"],["Privacy","Private media","Server-side storage"],["Notifications","Production alerts","Ready"]].map(([a,b,c])=><div key={a} style={{padding:20,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}><b>{a}</b><h3>{b}</h3><p style={{opacity:.7}}>{c}</p></div>)}
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:20}}>
                {!loggedIn && <button className="primary" onClick={startGoogleLogin}>Continue with Google</button>}
                {loggedIn && <button className="primary" onClick={signOut}>Sign out</button>}
                <small style={{alignSelf:"center",opacity:.65}}>Secure Google sign-in • server-side session</small>
              </div>
            </div>
          </section>
        ) : active === "AI Video" ? (
          <section style={{padding:"32px 24px"}}>
            <div style={{border:"1px solid rgba(255,255,255,.12)",borderRadius:24,padding:32,background:"rgba(255,255,255,.035)",maxWidth:1000}}>
              <div style={{fontSize:13,letterSpacing:1.5,opacity:.7}}>SMARTPOINT AI STUDIO • AI VIDEO</div>
              <h1 style={{fontSize:42,margin:"10px 0"}}>AI Video Production</h1>
              <p style={{opacity:.75}}>Create scripts, scenes, narration, B-roll and long-form video from one prompt.</p>
              <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe the video you want to create..." style={{width:"100%",minHeight:150,marginTop:20,padding:16,borderRadius:14}} />
              <div className="controls" style={{marginTop:14}}>
                <select value={lang} onChange={e=>setLang(e.target.value)}><option>English</option><option>Somali</option><option>Arabic</option><option>Swahili</option><option>French</option><option>Spanish</option></select>
                <select value={minutes} onChange={e=>setMinutes(e.target.value)}><option value="1">1 min</option><option value="5">5 min</option><option value="10">10 min</option><option value="30">30 min</option><option value="60">60 min</option><option value="180">180 min</option></select>
                <button className="primary" onClick={create} disabled={busy}>{busy?"Generating…":"Generate video →"}</button>
              </div>
              <p style={{opacity:.7,marginTop:12}}>{notice}</p>
              {videoUrl && <video controls src={videoUrl} style={{width:"100%",borderRadius:14,marginTop:12}} />}
            </div>
          </section>
        ) : securityPage ? (
          <section style={{padding:"32px 24px"}}>
            <div style={{border:"1px solid rgba(255,255,255,.12)",borderRadius:24,padding:32,background:"rgba(255,255,255,.035)",maxWidth:1000}}>
              <div style={{fontSize:13,letterSpacing:1.5,opacity:.7}}>SMARTPOINT AI STUDIO • SECURITY V29</div>
              <h1 style={{fontSize:42,margin:"10px 0"}}>Security Center</h1>
              <p style={{fontSize:16,opacity:.78,maxWidth:760}}>Production hardening for secrets, headers, input validation, abuse protection, authentication and private media.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:28}}>
                {[
                  ["🔐","Secrets","Server-side provider secrets","READY"],
                  ["🛡️","Security Headers","CSP, HSTS and browser hardening","READY"],
                  ["🧪","Input Validation","Validated generation requests","READY"],
                  ["🚦","Abuse Protection","Request guards + provider-side rate limits","READY"],
                  ["👤","Authentication","Google OAuth + PKCE secure session","READY"],
                  ["📋","Audit","Request IDs + signed payment webhooks","READY"],
                ].map(([icon,title,desc,status])=><div key={title} style={{padding:20,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:28}}>{icon}</div><h3>{title}</h3><p style={{opacity:.7}}>{desc}</p><b style={{fontSize:12,letterSpacing:1}}>{status}</b>
                </div>)}
              </div>
              <div style={{marginTop:24,padding:18,borderRadius:14,border:"1px dashed rgba(255,255,255,.16)",opacity:.78}}>
                🔒 Provider keys never belong in the browser. Keep Cloudflare and payment secrets in Worker/server-side secrets.
              </div>
            </div>
          </section>
        ) : paymentsPage ? (
          <section style={{padding:"32px 24px"}}>
            <div style={{
              border:"1px solid rgba(255,255,255,.12)",
              borderRadius:24,
              padding:32,
              background:"rgba(255,255,255,.035)",
              maxWidth:1000
            }}>
              <div style={{fontSize:13,letterSpacing:1.5,opacity:.7}}>SMARTPOINT AI STUDIO • BILLING</div>
              <h1 style={{fontSize:42,margin:"10px 0"}}>Payments & Monetization</h1>
              <p style={{fontSize:16,opacity:.78,maxWidth:720}}>
                Manage subscriptions, AI video credits and creator billing from one secure workspace.
              </p>

              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
                gap:16,
                marginTop:28
              }}>
                <div style={{padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:30}}>💳</div>
                  <h3>Subscriptions</h3>
                  <p style={{opacity:.7}}>Free, Creator and Pro plans can be connected here.</p>
                </div>
                <div style={{padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:30}}>🎬</div>
                  <h3>AI Video Credits</h3>
                  <p style={{opacity:.7}}>Credits can control AI generation and long-video usage.</p>
                </div>
                <div style={{padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:30}}>📱</div>
                  <h3>M-PESA + Cards</h3>
                  <p style={{opacity:.7}}>Designed for Kenya payments and card checkout.</p>
                </div>
              </div>

              <div style={{
                marginTop:24,
                padding:22,
                borderRadius:18,
                background:"rgba(255,255,255,.045)",
                border:"1px solid rgba(255,255,255,.1)"
              }}>
                <h2 style={{marginTop:0}}>Gateway connection</h2>
                <p style={{opacity:.75}}>
                  The billing workspace is functional in the dashboard. Real Paystack checkout and webhook crediting require the payment provider credentials to be added server-side.
                </p>
                <button className="primary" onClick={openPaymentSetup}>Prepare Paystack setup →</button><button onClick={()=>{setCredits(c=>c+10);flash("Demo wallet credited with 10 credits. Real payments remain server-side.")}}>＋10 demo credits</button>
                {paymentNotice && <div style={{marginTop:12,opacity:.8}}>{paymentNotice}</div>}
              </div>

              <div style={{
                marginTop:18,
                padding:18,
                borderRadius:14,
                border:"1px dashed rgba(255,255,255,.16)",
                fontSize:14,
                opacity:.75
              }}>
                🔒 Security: payment secrets should stay server-side. Do not place gateway secret keys in this page.
              </div>
            </div>
          </section>
        ) : workspacePage ? (
          <section style={{padding:"32px 24px"}}>
            <div style={{border:"1px solid rgba(255,255,255,.12)",borderRadius:24,padding:32,background:"rgba(255,255,255,.035)",maxWidth:1000}}>
              <div style={{fontSize:13,letterSpacing:1.5,opacity:.7}}>SMARTPOINT AI STUDIO • WORKSPACE</div>
              <div style={{fontSize:42,marginTop:10}}>{workspace?.icon}</div>
              <h1 style={{fontSize:42,margin:"8px 0"}}>{workspace?.title}</h1>
              <p style={{fontSize:16,opacity:.78,maxWidth:760}}>{workspace?.description}</p>
              <div style={{marginTop:24,padding:22,borderRadius:18,border:"1px solid rgba(255,255,255,.1)"}}>
                <b>{workspace?.status}</b>
                <p style={{opacity:.7}}>This workspace is connected to the SmartPoint production shell. Production providers, storage and worker services can be connected here without changing the existing creator interface.</p>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}>
                  <button className="primary" onClick={()=>setActive("AI Video")}>Create with AI Video →</button>
                  <button onClick={()=>flash("Workspace action prepared. Connect the matching production provider/worker for live processing.")}>Run workspace action</button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="hero">
              <div>
                <div className="eyebrow">SMARTPOINT AI STUDIO • V29</div>
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
                  <button className="primary" onClick={create} disabled={busy}>{busy ? "Generating…" : "Create"}</button><button onClick={saveProject} disabled={busy}>Save</button>
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
                  <div className="toolIcon">{icon}</div><h3>{title}</h3><p>{desc}</p><button onClick={()=>openTool(title)}>Open workspace <span>→</span></button>
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
