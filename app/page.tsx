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

export default function Home(){
  const [active,setActive]=useState("Home");
  const [prompt,setPrompt]=useState("");
  const [lang,setLang]=useState("English");
  const [minutes,setMinutes]=useState("10");
  const [notice,setNotice]=useState("Ready");
  const [tab,setTab]=useState("All");

  function create(){
    setNotice("Project created in the workspace. Connect your AI provider and render worker for real generation.");
    setActive("AI Video");
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
        <section className="hero">
          <div>
            <div className="eyebrow">SMARTPOINT AI STUDIO • V26</div>
            <h1>Everything you need<br/><em>to create.</em></h1>
            <p>Produce, edit, enhance, teach, publish and monetize professional video from one modern workspace.</p>
            <div className="heroBtns"><button className="primary" onClick={()=>setActive("AI Video")}>Start creating →</button><button onClick={()=>setActive("Pro Editor")}>Open editor</button></div>
          </div>
          <div className="createCard">
            <div className="cardtop"><b>AI video creator</b><span>NEW PROJECT</span></div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe what you want to make... e.g. a 10-minute Somali documentary with narration, B-roll and captions." />
            <div className="controls">
              <select value={lang} onChange={e=>setLang(e.target.value)}><option>English</option><option>Somali</option><option>Arabic</option><option>Swahili</option><option>French</option><option>Spanish</option></select>
              <select value={minutes} onChange={e=>setMinutes(e.target.value)}><option>1 min</option><option>5 min</option><option>10 min</option><option>30 min</option><option>60 min</option><option>180 min</option></select>
              <button className="primary" onClick={create}>Create</button>
            </div>
            <small>{notice}</small>
          </div>
        </section>

        <section className="formats">
          {formats.map(f=><button key={f} onClick={()=>{setPrompt(`Create a professional ${f.toLowerCase()} video`);setActive("AI Video")}}>{f}</button>)}
        </section>

        <section className="section">
          <div className="sectionhead"><div><h2>Creative suite</h2><p>Every major production workflow, connected.</p></div><div className="tabs">{["All","Create","Edit","Publish","Business"].map(x=><button className={tab===x?"selected":""} key={x} onClick={()=>setTab(x)}>{x}</button>)}</div></div>
          <div className="grid">
            {tools.map(([icon,title,desc],i)=><article className="tool" key={title}>
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
      </main>
    </div>
  </div>
}
