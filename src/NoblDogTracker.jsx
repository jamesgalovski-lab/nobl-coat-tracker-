import { useState, useRef, useCallback } from "react";

// ── NOBL Brand Colors ─────────────────────────────────────────────────────────
const C = {
  forest:     "#3C5C53",
  sky:        "#72AAB9",
  ember:      "#CC6633",
  fog:        "#F1F1F0",
  white:      "#FFFFFF",
  forestDark: "#2a423c",
  skyLight:   "#a8cdd8",
  skyDark:    "#4d8ea0",
  text:       "#1e2e2a",
  textMid:    "#4a6660",
  textLight:  "#7a9990",
};

// ── NOBL Logo (embedded PNG) ──────────────────────────────────────────────────
const LOGO = "data:image/png;base64,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";

// ── Dog Breeds ────────────────────────────────────────────────────────────────
const DOG_BREEDS = [
  "Mixed / Unknown",
  "Labrador Retriever","Golden Retriever","French Bulldog","German Shepherd",
  "Poodle (Standard)","Poodle (Miniature)","Poodle (Toy)","Bulldog",
  "Beagle","Rottweiler","Dachshund","German Shorthaired Pointer",
  "Boxer","Siberian Husky","Great Dane","Doberman Pinscher",
  "Australian Shepherd","Cavalier King Charles Spaniel","Shih Tzu",
  "Boston Terrier","Bernese Mountain Dog","Shetland Sheepdog",
  "Pomeranian","Yorkshire Terrier","Cocker Spaniel","Border Collie",
  "Maltese","Chihuahua","Weimaraner","Basset Hound","Vizsla",
  "Collie","Newfoundland","Belgian Malinois","Bichon Frisé",
  "West Highland White Terrier","Havanese","Bloodhound",
  "Rhodesian Ridgeback","Whippet","Akita","Samoyed","Pug",
  "Miniature Schnauzer","Standard Schnauzer","Giant Schnauzer",
  "Irish Setter","Brittany","Soft Coated Wheaten Terrier",
  "Chinese Shar-Pei","Chow Chow","Dalmatian","Italian Greyhound",
  "Papillon","Pembroke Welsh Corgi","Cardigan Welsh Corgi",
  "Russell Terrier","Scottish Terrier","Bull Terrier",
  "Staffordshire Bull Terrier","American Staffordshire Terrier",
  "Alaskan Malamute","Saint Bernard","English Springer Spaniel",
  "Flat-Coated Retriever","Chesapeake Bay Retriever",
  "Nova Scotia Duck Tolling Retriever","Irish Water Spaniel",
  "Portuguese Water Dog","Lagotto Romagnolo","Other",
];

// ── Photo zones ───────────────────────────────────────────────────────────────
const PHOTO_ZONES = [
  {
    id:"back", label:"Back & Top Coat", shortLabel:"Back",
    tip:"Stand your dog naturally. Hold phone directly above their back, about 2 feet up. Capture neck to tail.",
    svgGuide:(
      <svg viewBox="0 0 160 100" width="100%" style={{borderRadius:"8px",display:"block"}}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        <ellipse cx="80" cy="52" rx="38" ry="22" fill="#b5907a"/>
        <ellipse cx="80" cy="26" rx="16" ry="14" fill="#c9a48e"/>
        <ellipse cx="66" cy="24" rx="7" ry="10" fill="#a07860"/>
        <ellipse cx="94" cy="24" rx="7" ry="10" fill="#a07860"/>
        <path d="M80 74 Q88 86 96 82" stroke="#b5907a" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <circle cx="80" cy="52" r="30" fill="none" stroke="#72AAB9" strokeWidth="1.5" strokeDasharray="4 3"/>
        <line x1="80" y1="18" x2="80" y2="86" stroke="#72AAB9" strokeWidth="1" strokeDasharray="3 3"/>
        <line x1="46" y1="52" x2="114" y2="52" stroke="#72AAB9" strokeWidth="1" strokeDasharray="3 3"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill="#4a6660" fontFamily="sans-serif">top-down view</text>
      </svg>
    ),
  },
  {
    id:"belly", label:"Belly & Undercoat", shortLabel:"Belly",
    tip:"Gently roll your dog onto their back. Hold phone about 18 inches above. Capture chest to groin.",
    svgGuide:(
      <svg viewBox="0 0 160 100" width="100%" style={{borderRadius:"8px",display:"block"}}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        <ellipse cx="80" cy="54" rx="40" ry="24" fill="#e8c9b0"/>
        <ellipse cx="52" cy="36" rx="8" ry="14" fill="#c9a48e" transform="rotate(-20 52 36)"/>
        <ellipse cx="108" cy="36" rx="8" ry="14" fill="#c9a48e" transform="rotate(20 108 36)"/>
        <ellipse cx="48" cy="72" rx="8" ry="14" fill="#c9a48e" transform="rotate(15 48 72)"/>
        <ellipse cx="112" cy="72" rx="8" ry="14" fill="#c9a48e" transform="rotate(-15 112 72)"/>
        <circle cx="80" cy="54" r="28" fill="none" stroke="#72AAB9" strokeWidth="1.5" strokeDasharray="4 3"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill="#4a6660" fontFamily="sans-serif">dog on back · belly up</text>
      </svg>
    ),
  },
  {
    id:"ears", label:"Ears (Both Sides)", shortLabel:"Ears",
    tip:"Fold one ear back to show the inner flap. Hold phone 8–10 inches away. Repeat for the other ear.",
    svgGuide:(
      <svg viewBox="0 0 160 100" width="100%" style={{borderRadius:"8px",display:"block"}}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        <ellipse cx="80" cy="55" rx="44" ry="36" fill="#c9a48e"/>
        <ellipse cx="80" cy="58" rx="30" ry="24" fill="#e8b090"/>
        <ellipse cx="80" cy="60" rx="18" ry="14" fill="#d49070"/>
        <path d="M36 30 Q80 10 124 30" stroke="#72AAB9" strokeWidth="2" fill="none" strokeDasharray="4 3"/>
        <text x="80" y="18" textAnchor="middle" fontSize="8" fill="#4d8ea0" fontFamily="sans-serif">fold ear back</text>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill="#4a6660" fontFamily="sans-serif">inner flap visible · 8–10 in</text>
      </svg>
    ),
  },
  {
    id:"paws", label:"Paws & Between Toes", shortLabel:"Paws",
    tip:"Hold a paw and gently spread the toes. Hold phone 6–8 inches away. Capture skin between toes.",
    svgGuide:(
      <svg viewBox="0 0 160 100" width="100%" style={{borderRadius:"8px",display:"block"}}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        <ellipse cx="80" cy="62" rx="30" ry="24" fill="#c9a48e"/>
        <ellipse cx="56" cy="42" rx="11" ry="12" fill="#b8907a"/>
        <ellipse cx="74" cy="36" rx="11" ry="12" fill="#b8907a"/>
        <ellipse cx="93" cy="36" rx="11" ry="12" fill="#b8907a"/>
        <ellipse cx="110" cy="42" rx="11" ry="12" fill="#b8907a"/>
        <line x1="66" y1="50" x2="72" y2="56" stroke="#72AAB9" strokeWidth="1.5"/>
        <line x1="80" y1="48" x2="80" y2="56" stroke="#72AAB9" strokeWidth="1.5"/>
        <line x1="94" y1="50" x2="88" y2="56" stroke="#72AAB9" strokeWidth="1.5"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill="#4a6660" fontFamily="sans-serif">toes spread · 6–8 in away</text>
      </svg>
    ),
  },
  {
    id:"face", label:"Face & Muzzle", shortLabel:"Face",
    tip:"Get your dog to face you at eye level. Hold phone about 12 inches away. Capture muzzle, eyes, and forehead.",
    svgGuide:(
      <svg viewBox="0 0 160 100" width="100%" style={{borderRadius:"8px",display:"block"}}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        <ellipse cx="80" cy="52" rx="38" ry="40" fill="#c9a48e"/>
        <ellipse cx="44" cy="36" rx="12" ry="18" fill="#a07860"/>
        <ellipse cx="116" cy="36" rx="12" ry="18" fill="#a07860"/>
        <circle cx="63" cy="44" r="7" fill="#3a2810"/>
        <circle cx="97" cy="44" r="7" fill="#3a2810"/>
        <circle cx="65" cy="42" r="2" fill="white"/>
        <circle cx="99" cy="42" r="2" fill="white"/>
        <ellipse cx="80" cy="64" rx="22" ry="16" fill="#b8907a"/>
        <ellipse cx="80" cy="60" rx="10" ry="6" fill="#8a6050"/>
        <rect x="34" y="18" width="92" height="72" rx="4" fill="none" stroke="#72AAB9" strokeWidth="1.5" strokeDasharray="4 3"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill="#4a6660" fontFamily="sans-serif">facing you · eye level · 12 in</text>
      </svg>
    ),
  },
];

const DIET_OPTIONS = ["Kibble (dry food)","Wet / canned food","Raw diet (BARF)","Home-cooked meals","Mixed / combination","Prescription diet","Other"];
const WEEKS = ["Baseline","Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"];

// ── PDF Generator ─────────────────────────────────────────────────────────────
async function generatePDF(dogInfo, results, weekLabel) {
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210, H = 297, m = 18;
  let y = 0;

  // Forest header bar
  doc.setFillColor(60,92,83);
  doc.rect(0,0,W,38,"F");

  // Logo
  try { doc.addImage(LOGO,"PNG",m,7,38,18); } catch(e) {
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont("helvetica","bold");
    doc.text("NOBL",m,22);
  }

  // Header text
  doc.setTextColor(168,205,216); doc.setFontSize(8); doc.setFont("helvetica","normal");
  doc.text("COAT & SKIN TRACKER",W-m,13,{align:"right"});
  doc.setTextColor(255,255,255); doc.setFontSize(10);
  doc.text(weekLabel+" Report",W-m,23,{align:"right"});
  doc.text(new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),W-m,31,{align:"right"});

  y = 50;

  // Dog info band
  doc.setFillColor(241,241,240);
  doc.roundedRect(m,y,W-m*2,24,3,3,"F");
  doc.setTextColor(30,46,42); doc.setFontSize(13); doc.setFont("helvetica","bold");
  doc.text(dogInfo.name||"—",m+6,y+9);
  doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(74,102,96);
  const dogMeta = [dogInfo.breed,dogInfo.age?"Age: "+dogInfo.age:"",dogInfo.diet,dogInfo.dietBrand].filter(Boolean).join("  ·  ");
  doc.text(dogMeta,m+6,y+18);
  if (dogInfo.email) { doc.setTextColor(77,142,160); doc.text(dogInfo.email,W-m,y+18,{align:"right"}); }

  y += 32;

  // Score
  const scores = results.filter(r=>r.score).map(r=>r.score);
  const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : "—";
  const sn = parseFloat(avg);
  const scoreLabel = sn>=9?"Excellent":sn>=7.5?"Good":sn>=6?"Fair":"Needs Attention";
  const sc = sn>=8?[114,170,185]:sn>=6?[60,92,83]:[204,102,51];

  doc.setDrawColor(...sc); doc.setLineWidth(2.5);
  doc.circle(m+16,y+13,13,"S");
  doc.setTextColor(...sc); doc.setFontSize(15); doc.setFont("helvetica","bold");
  doc.text(String(avg),m+16,y+15,{align:"center"});
  doc.setTextColor(30,46,42); doc.setFontSize(17); doc.setFont("helvetica","bold");
  doc.text(scoreLabel,m+36,y+11);
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(122,153,144);
  doc.text("Overall skin & coat score  ·  "+weekLabel,m+36,y+19);

  y += 34;

  // Zone bars
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(60,92,83);
  doc.text("RESULTS BY AREA",m,y); y+=7;

  results.forEach(r=>{
    const zone = PHOTO_ZONES.find(z=>z.id===r.zoneId);
    const s2 = r.score||0;
    const bc = s2>=8?[114,170,185]:s2>=6?[60,92,83]:[204,102,51];
    const bw = W-m*2-36;
    doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(74,102,96);
    doc.text(zone?.shortLabel||"",m,y+4);
    doc.setFillColor(220,228,226); doc.roundedRect(m+20,y-1,bw,6,1,1,"F");
    doc.setFillColor(...bc); doc.roundedRect(m+20,y-1,bw*s2/10,6,1,1,"F");
    doc.setFont("helvetica","bold"); doc.setTextColor(...bc);
    doc.text(String(s2),W-m,y+4,{align:"right"});
    y+=10;
    if(r.photoNote){
      doc.setFontSize(7.5); doc.setFont("helvetica","italic"); doc.setTextColor(122,153,144);
      doc.text("i  "+r.photoNote,m+20,y); y+=5;
    }
  });

  y+=4;

  // Findings header
  doc.setFillColor(60,92,83); doc.rect(m,y,W-m*2,7,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont("helvetica","bold");
  doc.text("KEY FINDINGS",m+4,y+5); y+=12;

  results.flatMap(r=>r.observations||[]).forEach(obs=>{
    doc.setFillColor(114,170,185); doc.circle(m+2,y+1,1.2,"F");
    doc.setTextColor(74,102,96); doc.setFontSize(9); doc.setFont("helvetica","normal");
    const lines = doc.splitTextToSize(obs,W-m*2-8);
    doc.text(lines,m+6,y+2);
    y+=lines.length*5+2;
    if(y>H-70){doc.addPage();y=m;}
  });

  y+=4;

  // Diet signal
  const ds = results.find(r=>r.dietSignals)?.dietSignals;
  if(ds){
    const dsL = doc.splitTextToSize(ds,W-m*2-14);
    const dsH = dsL.length*5+14;
    if(y+dsH>H-m){doc.addPage();y=m;}
    doc.setFillColor(232,242,246); doc.roundedRect(m,y,W-m*2,dsH,3,3,"F");
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(77,142,160);
    doc.text("DIET SIGNAL",m+6,y+7);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(30,46,42);
    doc.text(dsL,m+6,y+13);
    y+=dsH+6;
  }

  // Recommendations
  const recs = results.map(r=>r.recommendations).filter(Boolean).join(" ");
  if(recs){
    const recL = doc.splitTextToSize(recs,W-m*2-14);
    const recH = recL.length*5+14;
    if(y+recH>H-m){doc.addPage();y=m;}
    doc.setFillColor(60,92,83); doc.roundedRect(m,y,W-m*2,recH,3,3,"F");
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(168,205,216);
    doc.text("RECOMMENDATIONS",m+6,y+7);
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(241,241,240);
    doc.text(recL,m+6,y+13);
    y+=recH+6;
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for(let p=1;p<=pages;p++){
    doc.setPage(p);
    doc.setFillColor(60,92,83); doc.rect(0,H-14,W,14,"F");
    doc.setTextColor(168,205,216); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("NOBL Coat & Skin Tracker  ·  AI-assisted screening only. Not a substitute for veterinary advice.",m,H-5);
    doc.setTextColor(255,255,255);
    doc.text("nobl.com",W-m,H-5,{align:"right"});
  }

  doc.save(`NOBL-${(dogInfo.name||"Dog").replace(/\s+/g,"-")}-${weekLabel.replace(/\s+/g,"-")}-Report.pdf`);
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  page:{minHeight:"100vh",background:C.fog,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:C.text},
  header:{background:C.forest,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  body:{maxWidth:"480px",margin:"0 auto",padding:"20px 16px 40px"},
  card:{background:C.white,borderRadius:"16px",padding:"20px",marginBottom:"12px",border:"1px solid rgba(60,92,83,0.1)"},
  cardForest:{background:C.forest,borderRadius:"16px",padding:"20px",marginBottom:"12px"},
  label:{fontSize:"11px",fontWeight:"600",letterSpacing:"0.1em",textTransform:"uppercase",color:C.textLight,marginBottom:"6px"},
  input:{width:"100%",padding:"11px 14px",borderRadius:"10px",border:"1.5px solid rgba(60,92,83,0.2)",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",color:C.text,background:C.white,outline:"none",boxSizing:"border-box",marginBottom:"10px"},
  btnPrimary:{width:"100%",padding:"14px",borderRadius:"12px",border:"none",background:C.forest,color:C.white,fontSize:"15px",fontWeight:"600",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.02em"},
  btnSky:{width:"100%",padding:"13px",borderRadius:"12px",border:`1.5px solid ${C.sky}`,background:"transparent",color:C.sky,fontSize:"15px",fontWeight:"600",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:"8px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"},
};

// ── Header ────────────────────────────────────────────────────────────────────
function Header({dogName,week}){
  return(
    <div style={S.header}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <img src={LOGO} alt="NOBL" style={{height:"34px",width:"auto",objectFit:"contain"}}/>
        <div style={{width:"1px",height:"30px",background:"rgba(255,255,255,0.2)"}}/>
        <div style={{fontSize:"11px",color:C.skyLight,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:"500"}}>Coat & Skin Tracker</div>
      </div>
      {dogName&&(
        <div style={{textAlign:"right"}}>
          <div style={{color:C.skyLight,fontSize:"11px",letterSpacing:"0.06em"}}>TRACKING</div>
          <div style={{color:C.white,fontSize:"14px",fontWeight:"600"}}>{dogName}</div>
          {week!==undefined&&<div style={{color:C.skyLight,fontSize:"11px"}}>{WEEKS[week]}</div>}
        </div>
      )}
    </div>
  );
}

// ── Photo Capture ─────────────────────────────────────────────────────────────
function PhotoCapture({zones,onComplete}){
  const [idx,setIdx]=useState(0);
  const [photos,setPhotos]=useState({});
  const [previews,setPreviews]=useState({});
  const fileRef=useRef();
  const zone=zones[idx];
  const isLast=idx===zones.length-1;
  const has=!!photos[zone.id];

  const handleFile=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      setPhotos(p=>({...p,[zone.id]:reader.result.split(",")[1]}));
      setPreviews(p=>({...p,[zone.id]:URL.createObjectURL(file)}));
    };
    reader.readAsDataURL(file);
  };

  const next=()=>{ if(isLast) onComplete(photos); else setIdx(i=>i+1); };
  const retake=()=>{
    setPhotos(p=>{const n={...p};delete n[zone.id];return n;});
    setPreviews(p=>{const n={...p};delete n[zone.id];return n;});
    setTimeout(()=>fileRef.current?.click(),100);
  };

  return(
    <div>
      <div style={{...S.card,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
          <div style={{fontSize:"13px",fontWeight:"600",color:C.textMid}}>Photo {idx+1} of {zones.length}</div>
          <div style={{fontSize:"13px",color:C.textLight}}>{zone.label}</div>
        </div>
        <div style={{display:"flex",gap:"5px"}}>
          {zones.map((z,i)=>(
            <div key={z.id} style={{flex:1,height:"5px",borderRadius:"3px",background:i<idx?C.forest:i===idx?C.sky:"rgba(60,92,83,0.12)",transition:"background 0.3s"}}/>
          ))}
        </div>
      </div>

      <div style={{background:C.ember,borderRadius:"10px",padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
        <span style={{fontSize:"16px"}}>⚡</span>
        <div style={{fontSize:"13px",color:C.white,fontWeight:"600"}}>Enable flash on your camera before taking this photo</div>
      </div>

      <div style={S.card}>
        <div style={{marginBottom:"14px"}}>{zone.svgGuide}</div>
        <div style={{background:"rgba(114,170,185,0.1)",border:"1px solid rgba(114,170,185,0.25)",borderRadius:"10px",padding:"11px 14px",marginBottom:"14px",fontSize:"13px",color:C.text,lineHeight:"1.55"}}>
          <span style={{fontWeight:"700",color:C.sky}}>Position guide — </span>{zone.tip}
        </div>
        {has?(
          <div>
            <img src={previews[zone.id]} alt={zone.label} style={{width:"100%",borderRadius:"10px",maxHeight:"200px",objectFit:"cover",display:"block",marginBottom:"10px"}}/>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={retake} style={{...S.btnPrimary,background:"transparent",color:C.forest,border:`1.5px solid ${C.forest}`,flex:1}}>Retake</button>
              <button onClick={next} style={{...S.btnPrimary,flex:2}}>{isLast?"Run Analysis →":`Next: ${zones[idx+1]?.shortLabel} →`}</button>
            </div>
          </div>
        ):(
          <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed rgba(60,92,83,0.25)",borderRadius:"12px",padding:"32px 20px",textAlign:"center",cursor:"pointer",background:"rgba(60,92,83,0.03)"}}>
            <div style={{fontSize:"32px",marginBottom:"8px"}}>📷</div>
            <div style={{fontSize:"15px",fontWeight:"600",color:C.forest,marginBottom:"4px"}}>Tap to upload photo</div>
            <div style={{fontSize:"12px",color:C.textLight}}>From camera roll or take new</div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFile}/>
      </div>

      {Object.keys(previews).length>0&&(
        <div style={{...S.card,padding:"14px 16px"}}>
          <div style={S.label}>Uploaded so far</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {zones.slice(0,idx+1).map(z=>previews[z.id]&&(
              <div key={z.id} style={{position:"relative"}}>
                <img src={previews[z.id]} alt={z.label} style={{width:"56px",height:"56px",borderRadius:"8px",objectFit:"cover",border:`2px solid ${C.sky}`}}/>
                <div style={{position:"absolute",bottom:"2px",left:"2px",right:"2px",background:"rgba(0,0,0,0.5)",borderRadius:"4px",fontSize:"8px",color:"white",textAlign:"center",padding:"1px"}}>{z.shortLabel}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({score,size=84,stroke=7}){
  const r=size/2-stroke, circ=2*Math.PI*r, offset=circ-(score/10)*circ;
  const color=score>=8?C.sky:score>=6?C.forest:C.ember;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(60,92,83,0.1)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────
function AnalysisResults({results,weekLabel,dogInfo,history,currentWeek,onSelectWeek,onNextWeek}){
  const [pdfLoading,setPdfLoading]=useState(false);
  const valid=results.filter(r=>r.score);
  const avg=valid.length?parseFloat((valid.reduce((a,b)=>a+(b.score||0),0)/valid.length).toFixed(1)):0;
  const label=avg>=9?"Excellent":avg>=7.5?"Good":avg>=6?"Fair":"Needs Attention";

  const handlePDF=async()=>{
    setPdfLoading(true);
    try{ await generatePDF(dogInfo,results,weekLabel); }
    catch(e){ alert("PDF generation failed. Please try again."); }
    setPdfLoading(false);
  };

  return(
    <div>
      {history.length>1&&(
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {history.sort((a,b)=>a.week-b.week).map(e=>(
            <button key={e.week} onClick={()=>onSelectWeek(e.week)} style={{padding:"6px 14px",borderRadius:"20px",border:`1.5px solid ${e.week===currentWeek?C.forest:"rgba(60,92,83,0.2)"}`,background:e.week===currentWeek?C.forest:"transparent",color:e.week===currentWeek?C.white:C.textMid,fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{e.weekLabel}</button>
          ))}
        </div>
      )}

      <div style={{...S.cardForest,display:"flex",alignItems:"center",gap:"20px"}}>
        <div style={{position:"relative",flexShrink:0}}>
          <ScoreRing score={avg}/>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"22px",fontWeight:"700",color:C.white}}>{avg}</span>
            <span style={{fontSize:"10px",color:C.skyLight}}>/ 10</span>
          </div>
        </div>
        <div>
          <div style={{fontSize:"11px",color:C.skyLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>{weekLabel} · {dogInfo.name}</div>
          <div style={{fontSize:"20px",fontFamily:"'DM Serif Display',Georgia,serif",color:C.white,marginBottom:"6px"}}>{label}</div>
          <div style={{display:"inline-block",background:"rgba(255,255,255,0.15)",borderRadius:"20px",padding:"3px 12px",fontSize:"12px",color:C.skyLight}}>
            {results[0]?.trend==="improving"?"↑ Improving":results[0]?.trend==="declining"?"↓ Declining":"◆ Baseline"}
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.label}>By area</div>
        {results.map((r,i)=>{
          const zone=PHOTO_ZONES.find(z=>z.id===r.zoneId);
          const bc=r.score>=8?C.sky:r.score>=6?C.forest:C.ember;
          return(
            <div key={i} style={{marginBottom:"10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{fontSize:"12px",color:C.textMid,width:"68px",flexShrink:0}}>{zone?.shortLabel}</div>
                <div style={{flex:1,height:"6px",borderRadius:"3px",background:"rgba(60,92,83,0.1)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(r.score||0)*10}%`,background:bc,borderRadius:"3px",transition:"width 0.8s ease"}}/>
                </div>
                <div style={{fontSize:"13px",fontWeight:"700",color:bc,width:"24px",textAlign:"right"}}>{r.score}</div>
              </div>
              {r.photoNote&&<div style={{fontSize:"11px",color:C.textLight,marginTop:"3px",paddingLeft:"78px"}}>ℹ {r.photoNote}</div>}
            </div>
          );
        })}
      </div>

      <div style={S.card}>
        <div style={S.label}>Key findings</div>
        {results.flatMap(r=>r.observations||[]).map((obs,i)=>(
          <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"8px"}}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:C.sky,flexShrink:0,marginTop:"6px"}}/>
            <div style={{fontSize:"13px",color:C.textMid,lineHeight:"1.55"}}>{obs}</div>
          </div>
        ))}
      </div>

      <div style={{...S.card,background:"rgba(114,170,185,0.1)",border:"1px solid rgba(114,170,185,0.25)"}}>
        <div style={{...S.label,color:C.skyDark}}>Diet signal</div>
        <div style={{fontSize:"14px",color:C.text,lineHeight:"1.6"}}>{results.find(r=>r.dietSignals)?.dietSignals||"—"}</div>
      </div>

      <div style={S.cardForest}>
        <div style={{...S.label,color:C.skyLight}}>Recommendations</div>
        <div style={{fontSize:"14px",color:C.fog,lineHeight:"1.6"}}>{results.map(r=>r.recommendations).filter(Boolean).join(" ")}</div>
      </div>

      <button onClick={handlePDF} disabled={pdfLoading} style={S.btnSky}>
        {pdfLoading?"Generating PDF…":"⬇  Download PDF Report"}
      </button>

      <div style={{fontSize:"12px",color:C.textLight,lineHeight:"1.6",padding:"10px 4px"}}>
        ⚕ AI-assisted screening only. Does not replace professional veterinary diagnosis. Consult your vet for any health concerns.
      </div>

      {currentWeek<6&&(
        <button style={{...S.btnPrimary,marginTop:"4px"}} onClick={onNextWeek}>
          Schedule {WEEKS[Math.min(currentWeek+1,6)]} Check-in →
        </button>
      )}
    </div>
  );
}

// ── API ───────────────────────────────────────────────────────────────────────
async function analyzePhoto(imageBase64,zone,dogInfo,weekLabel){
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version":"2023-06-01",
      "anthropic-dangerous-direct-browser-access":"true",
    },
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      messages:[{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:"image/jpeg",data:imageBase64}},
        {type:"text",text:`You are a veterinary nutritionist AI specializing in canine skin and coat health.
Analyze this dog photo of the ${zone.label} area.
Dog info: name=${dogInfo.name}, breed=${dogInfo.breed||"unknown"}, age=${dogInfo.age||"unknown"}, diet=${dogInfo.diet} (${dogInfo.dietBrand||"unspecified brand"}), on this diet for ${dogInfo.dietDuration||"unknown duration"}.
This is their ${weekLabel} photo. Do your best even if quality is imperfect — note limitations but still provide useful analysis.
Respond ONLY with valid JSON (no markdown):
{"score":1-10,"observations":["obs1","obs2","obs3"],"dietSignals":"what this reveals about diet","recommendations":"specific dietary or care recommendation","trend":"improving/stable/declining/baseline","photoNote":"brief note if quality limited analysis, else empty string"}`}
      ]}]
    })
  });
  const data=await res.json();
  const text=data.content?.map(i=>i.text||"").join("")||"";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function NoblDogTracker(){
  const [step,setStep]=useState("onboarding");
  const [dogInfo,setDogInfo]=useState({name:"",breed:"",age:"",email:"",diet:"",dietBrand:"",dietDuration:""});
  const [currentWeek,setCurrentWeek]=useState(0);
  const [analysisPhase,setAnalysisPhase]=useState("");
  const [analysisProgress,setAnalysisProgress]=useState(0);
  const [weekResults,setWeekResults]=useState({});
  const [history,setHistory]=useState([]);
  const [viewingWeek,setViewingWeek]=useState(0);

  const handlePhotosComplete=useCallback(async(photos)=>{
    setStep("analyzing");
    const results=[];
    for(let i=0;i<PHOTO_ZONES.length;i++){
      const zone=PHOTO_ZONES[i];
      setAnalysisPhase(`Analyzing ${zone.label}...`);
      setAnalysisProgress(Math.round((i/PHOTO_ZONES.length)*100));
      try{
        const result=await analyzePhoto(photos[zone.id],zone,dogInfo,WEEKS[currentWeek]);
        results.push({zoneId:zone.id,...result});
      }catch{
        results.push({zoneId:zone.id,score:5,observations:["Analysis unavailable for this area."],dietSignals:"",recommendations:"",photoNote:"Could not process photo.",trend:"baseline"});
      }
    }
    setAnalysisProgress(100);
    const entry={week:currentWeek,weekLabel:WEEKS[currentWeek],results,timestamp:new Date().toLocaleDateString()};
    setWeekResults(r=>({...r,[currentWeek]:results}));
    setHistory(h=>[...h.filter(e=>e.week!==currentWeek),entry]);
    setViewingWeek(currentWeek);
    setStep("results");
  },[dogInfo,currentWeek]);

  const upd=(k,v)=>setDogInfo(d=>({...d,[k]:v}));
  const canStart=dogInfo.name&&dogInfo.diet&&dogInfo.email;

  return(
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet"/>
      <Header dogName={dogInfo.name||null} week={step!=="onboarding"?currentWeek:undefined}/>
      <div style={S.body}>

        {step==="onboarding"&&(
          <div>
            <div style={{...S.card,marginTop:"4px"}}>
              <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"22px",color:C.forest,marginBottom:"6px"}}>Track your dog's skin & coat health</div>
              <div style={{fontSize:"14px",color:C.textMid,lineHeight:"1.6",marginBottom:"20px"}}>Upload baseline photos today, then check in weekly for 5–6 weeks. NOBL's AI tracks changes and shows how your dog's diet is — or isn't — working.</div>

              <div style={S.label}>Dog's name *</div>
              <input style={S.input} placeholder="e.g. Buddy" value={dogInfo.name} onChange={e=>upd("name",e.target.value)}/>

              <div style={S.label}>Breed</div>
              <select style={{...S.input,background:C.white}} value={dogInfo.breed} onChange={e=>upd("breed",e.target.value)}>
                <option value="">Select breed...</option>
                {DOG_BREEDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>

              <div style={S.label}>Age</div>
              <input style={S.input} placeholder="e.g. 4 years" value={dogInfo.age} onChange={e=>upd("age",e.target.value)}/>

              <div style={S.label}>Your email address *</div>
              <input style={S.input} type="email" placeholder="you@example.com" value={dogInfo.email} onChange={e=>upd("email",e.target.value)}/>
              <div style={{fontSize:"11px",color:C.textLight,marginTop:"-6px",marginBottom:"12px"}}>For weekly reminders and your report summary</div>

              <div style={S.label}>Current diet type *</div>
              <select style={{...S.input,background:C.white}} value={dogInfo.diet} onChange={e=>upd("diet",e.target.value)}>
                <option value="">Select diet type...</option>
                {DIET_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>

              <div style={S.label}>Food brand</div>
              <input style={S.input} placeholder="e.g. Royal Canin, Orijen" value={dogInfo.dietBrand} onChange={e=>upd("dietBrand",e.target.value)}/>

              <div style={S.label}>How long on this diet?</div>
              <input style={S.input} placeholder="e.g. 6 weeks" value={dogInfo.dietDuration} onChange={e=>upd("dietDuration",e.target.value)}/>

              <div style={{fontSize:"11px",color:C.textLight,marginBottom:"12px"}}>* Required fields</div>
              <button style={{...S.btnPrimary,opacity:canStart?1:0.4}} disabled={!canStart} onClick={()=>setStep("photos")}>Begin Baseline Photos →</button>
            </div>

            <div style={S.card}>
              <div style={S.label}>5 areas we monitor</div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {PHOTO_ZONES.map(z=>(
                  <div key={z.id} style={{background:"rgba(60,92,83,0.07)",borderRadius:"8px",padding:"6px 12px",fontSize:"13px",color:C.forest,fontWeight:"500"}}>{z.shortLabel}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step==="photos"&&<PhotoCapture zones={PHOTO_ZONES} onComplete={handlePhotosComplete}/>}

        {step==="analyzing"&&(
          <div style={{...S.card,textAlign:"center",padding:"48px 24px",marginTop:"4px"}}>
            <div style={{position:"relative",width:"72px",height:"72px",margin:"0 auto 20px"}}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(60,92,83,0.1)" strokeWidth="6"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke={C.sky} strokeWidth="6"
                  strokeDasharray={`${2*Math.PI*30}`}
                  strokeDashoffset={`${2*Math.PI*30*(1-analysisProgress/100)}`}
                  strokeLinecap="round" transform="rotate(-90 36 36)"
                  style={{transition:"stroke-dashoffset 0.5s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"600",color:C.forest}}>{analysisProgress}%</div>
            </div>
            <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"20px",color:C.forest,marginBottom:"8px"}}>Analyzing {dogInfo.name}'s health</div>
            <div style={{fontSize:"14px",color:C.textMid}}>{analysisPhase||"Starting analysis..."}</div>
          </div>
        )}

        {step==="results"&&weekResults[viewingWeek]&&(
          <AnalysisResults
            results={weekResults[viewingWeek]}
            weekLabel={WEEKS[viewingWeek]}
            dogInfo={dogInfo}
            history={history}
            currentWeek={viewingWeek}
            onSelectWeek={setViewingWeek}
            onNextWeek={()=>{setCurrentWeek(w=>Math.min(w+1,6));setStep("photos");}}
          />
        )}

      </div>
    </div>
  );
}
