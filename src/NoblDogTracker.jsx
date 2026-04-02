import { useState, useRef, useCallback } from "react";

const C = {
  forest:    "#3C5C53",
  sky:       "#72AAB9",
  ember:     "#CC6633",
  fog:       "#F1F1F0",
  white:     "#FFFFFF",
  skyLight:  "#a8cdd8",
  skyDark:   "#4d8ea0",
  text:      "#1e2e2a",
  textMid:   "#4a6660",
  textLight: "#7a9990",
};

const LOGO_SRC = "data:image/png;base64,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";

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

const PHOTO_ZONES = [
  {
    id:"back", label:"Back & Top Coat", shortLabel:"Back",
    tip:"Stand your dog naturally. Hold phone directly above their back, about 2 feet up. Capture neck to tail.",
    checks:["Full back visible from neck to tail","Top-down angle","Flash enabled"],
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
    checks:["Dog on back, belly facing up","Full belly area visible","Flash enabled"],
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
    tip:"Fold one ear back to show the inner flap. Hold phone 8–10 inches away.",
    checks:["Ear folded back, inner flap visible","8–10 inches from ear","Flash enabled"],
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
    tip:"Spread the toes gently. Hold phone 6–8 inches away. Capture skin between toes.",
    checks:["Toes spread apart","Skin between toes visible","6–8 inches away"],
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
    tip:"Dog facing you at eye level. Hold phone about 12 inches away. Capture muzzle, eyes, and forehead.",
    checks:["Dog facing camera","At eye level","Muzzle and eyes in frame"],
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

// ── Detect HEIC from base64 signature ────────────────────────────────────────
function isHeicFormat(b64) {
  // HEIC files start with ftyp box; base64 signature varies but common patterns:
  const head = b64.substring(0, 12);
  return head.startsWith("AAAB") || head.startsWith("AAAC") || head.startsWith("AAAM") ||
         head.startsWith("AAAAf") || head.startsWith("AAAAg");
}

// ── Client-side soft check ────────────────────────────────────────────────────
async function softCheck(file) {
  return new Promise(resolve => {
    // Check HEIC by file extension or MIME type first
    const name = file.name?.toLowerCase() || "";
    const type = file.type?.toLowerCase() || "";
    if (name.endsWith(".heic") || name.endsWith(".heif") || type.includes("heic") || type.includes("heif")) {
      resolve({
        warnings: ["HEIC photo format detected"],
        isHeic: true,
        heicInstructions: "iPhone photos in HEIC format cannot be processed. To fix this:\n\n1. Go to iPhone Settings → Camera → Formats\n2. Select \"Most Compatible\"\n3. Retake the photo — it will now save as JPEG\n\nOr: Take a screenshot of the photo (press Side button + Volume Up) and upload the screenshot instead."
      });
      return;
    }

    const warnings = [];
    if (file.size < 15000) { warnings.push("File is very small — the photo may not have saved correctly."); resolve({warnings,isHeic:false}); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 150 || img.height < 150) warnings.push("Resolution is very low. Move closer or use a higher quality setting.");
      const canvas = document.createElement("canvas");
      canvas.width = 32; canvas.height = 32;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 32, 32);
      const d = ctx.getImageData(0,0,32,32).data;
      let r=0,g=0,b=0;
      const n=d.length/4;
      for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}
      let rv=0,gv=0,bv=0;
      const rm=r/n,gm=g/n,bm=b/n;
      for(let i=0;i<d.length;i+=4){rv+=(d[i]-rm)**2;gv+=(d[i+1]-gm)**2;bv+=(d[i+2]-bm)**2;}
      const variance=(rv+gv+bv)/(3*n);
      const brightness=(rm+gm+bm)/3;
      if(variance<120){
        if(brightness<35) warnings.push("Photo is too dark. Enable camera flash and try again.");
        else if(brightness>230) warnings.push("Photo is overexposed. Adjust your angle or lighting.");
        else warnings.push("Photo has very little detail. Check the correct body area fills the frame.");
      }
      URL.revokeObjectURL(url);
      resolve({warnings,isHeic:false});
    };
    img.onerror=()=>{URL.revokeObjectURL(url);warnings.push("Could not read image. Please try again.");resolve({warnings,isHeic:false});};
    img.src=url;
  });
}

// ── Validate photo via AI before committing ───────────────────────────────────
async function validatePhotoWithAI(base64, zone) {
  try {
    const res = await fetch("/.netlify/functions/analyze", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ imageBase64: base64, zoneLabel: zone.label, dogInfo:{}, weekLabel:"Baseline", validateOnly: true }),
    });
    if (!res.ok) return { usable: true, issue: "", suggestion: "" }; // fail open
    return await res.json();
  } catch { return { usable: true, issue: "", suggestion: "" }; }
}

// ── Full analysis ─────────────────────────────────────────────────────────────
async function callAnalyze(imageBase64, zone, dogInfo, weekLabel) {
  const res = await fetch("/.netlify/functions/analyze", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ imageBase64, zoneLabel: zone.label, dogInfo, weekLabel }),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  return res.json();
}

// ── PDF ───────────────────────────────────────────────────────────────────────
async function generatePDF(dogInfo, results, weekLabel) {
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,H=297,m=18;
  let y=0;

  doc.setFillColor(60,92,83); doc.rect(0,0,W,40,"F");
  try { doc.addImage(LOGO_SRC,"PNG",m,6,50,26); }
  catch(e) { doc.setTextColor(204,102,51); doc.setFontSize(22); doc.setFont("helvetica","bold"); doc.text("NOBL",m,26); }
  doc.setTextColor(168,205,216); doc.setFontSize(8); doc.setFont("helvetica","normal");
  doc.text("COAT & SKIN TRACKER",W-m,14,{align:"right"});
  doc.setTextColor(255,255,255); doc.setFontSize(11);
  doc.text(weekLabel+" Report",W-m,24,{align:"right"});
  doc.setFontSize(8); doc.setTextColor(168,205,216);
  doc.text(new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),W-m,32,{align:"right"});
  y=52;

  doc.setFillColor(241,241,240); doc.roundedRect(m,y,W-m*2,26,3,3,"F");
  doc.setTextColor(30,46,42); doc.setFontSize(13); doc.setFont("helvetica","bold");
  doc.text(dogInfo.name||"—",m+6,y+10);
  doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(74,102,96);
  const meta=[dogInfo.breed,dogInfo.age?"Age: "+dogInfo.age:"",dogInfo.diet,dogInfo.dietBrand].filter(Boolean).join("  ·  ");
  doc.text(meta,m+6,y+19);
  if(dogInfo.email){doc.setTextColor(77,142,160);doc.text(dogInfo.email,W-m,y+19,{align:"right"});}
  y+=34;

  const scores=results.filter(r=>r.score&&r.score>0).map(r=>r.score);
  const avg=scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):"—";
  const sn=parseFloat(avg);
  const lbl=sn>=9?"Excellent":sn>=7.5?"Good":sn>=6?"Fair":"Needs Attention";
  const sc=sn>=8?[114,170,185]:sn>=6?[60,92,83]:[204,102,51];
  doc.setDrawColor(...sc); doc.setLineWidth(2.5); doc.circle(m+16,y+13,13,"S");
  doc.setTextColor(...sc); doc.setFontSize(15); doc.setFont("helvetica","bold"); doc.text(String(avg),m+16,y+15,{align:"center"});
  doc.setTextColor(30,46,42); doc.setFontSize(17); doc.setFont("helvetica","bold"); doc.text(lbl,m+36,y+11);
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(122,153,144);
  doc.text("Overall skin & coat score  ·  "+weekLabel,m+36,y+19);
  y+=34;

  // Zone bars
  doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(60,92,83); doc.text("RESULTS BY AREA",m,y); y+=7;
  results.forEach(r=>{
    const zone=PHOTO_ZONES.find(z=>z.id===r.zoneId);
    const s2=r.score||0; const bc=s2>=8?[114,170,185]:s2>=6?[60,92,83]:[204,102,51];
    const bw=W-m*2-36;
    doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(74,102,96); doc.text(zone?.shortLabel||"",m,y+4);
    if(s2>0){
      doc.setFillColor(220,228,226); doc.roundedRect(m+20,y-1,bw,6,1,1,"F");
      doc.setFillColor(...bc); doc.roundedRect(m+20,y-1,bw*s2/10,6,1,1,"F");
      doc.setFont("helvetica","bold"); doc.setTextColor(...bc); doc.text(String(s2),W-m,y+4,{align:"right"});
    } else {
      doc.setTextColor(122,153,144); doc.text("Not analyzed",m+20,y+4);
    }
    y+=10;
    if(r.photoNote&&r.photoNote.trim()){doc.setFontSize(7.5);doc.setFont("helvetica","italic");doc.setTextColor(122,153,144);doc.text("i  "+r.photoNote,m+20,y);y+=5;}
  });
  y+=4;

  // Per-zone findings
  doc.setFillColor(60,92,83); doc.rect(m,y,W-m*2,7,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.text("KEY FINDINGS BY AREA",m+4,y+5); y+=12;

  results.forEach(r=>{
    const zone=PHOTO_ZONES.find(z=>z.id===r.zoneId);
    if(y>H-70){doc.addPage();y=m;}
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(60,92,83);
    doc.text(zone?.label||"",m,y); y+=5;
    if(!r.score||r.score===0){
      doc.setFont("helvetica","italic"); doc.setTextColor(122,153,144);
      doc.text("  "+( r.photoNote||"Photo could not be analyzed."),m+2,y); y+=7;
    } else {
      (r.observations||[]).forEach(obs=>{
        doc.setFillColor(114,170,185); doc.circle(m+2,y+1,1.2,"F");
        doc.setFont("helvetica","normal"); doc.setTextColor(74,102,96);
        const lines=doc.splitTextToSize(obs,W-m*2-8); doc.text(lines,m+6,y+2); y+=lines.length*5+2;
        if(y>H-70){doc.addPage();y=m;}
      });
    }
    y+=3;
  });

  // Diet signal
  const ds=results.find(r=>r.dietSignals)?.dietSignals;
  if(ds){
    const dsL=doc.splitTextToSize(ds,W-m*2-14),dsH=dsL.length*5+14;
    if(y+dsH>H-m){doc.addPage();y=m;}
    doc.setFillColor(232,242,246);doc.roundedRect(m,y,W-m*2,dsH,3,3,"F");
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(77,142,160);doc.text("DIET SIGNAL",m+6,y+7);
    doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(30,46,42);doc.text(dsL,m+6,y+13);y+=dsH+6;
  }

  // Recommendations as bullets
  const allRecs = results.map(r=>r.recommendations).filter(Boolean);
  const recBullets = [...new Set(allRecs.flatMap(r=>r.split("|").map(b=>b.trim()).filter(Boolean)))];
  if(recBullets.length){
    if(y+20>H-m){doc.addPage();y=m;}
    doc.setFillColor(60,92,83);
    const startY=y;
    let estimatedH=14+recBullets.length*8;
    doc.roundedRect(m,y,W-m*2,Math.min(estimatedH,60),3,3,"F");
    doc.setFontSize(8);doc.setFont("helvetica","bold");doc.setTextColor(168,205,216);doc.text("RECOMMENDATIONS",m+6,y+7);y+=13;
    recBullets.forEach(bullet=>{
      if(y>H-m){doc.addPage();y=m;doc.setFillColor(60,92,83);}
      doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(241,241,240);
      const lines=doc.splitTextToSize("• "+bullet,W-m*2-14);
      doc.text(lines,m+6,y);y+=lines.length*5+1;
    });
    y+=6;
  }

  const pages=doc.getNumberOfPages();
  for(let p=1;p<=pages;p++){
    doc.setPage(p);
    doc.setFillColor(60,92,83);doc.rect(0,H-14,W,14,"F");
    doc.setTextColor(168,205,216);doc.setFontSize(7);doc.setFont("helvetica","normal");
    doc.text("NOBL Coat & Skin Tracker  ·  AI-assisted screening only. Not a substitute for veterinary advice.",m,H-5);
    doc.setTextColor(255,255,255);doc.text("NOBLFoods.com",W-m,H-5,{align:"right"});
  }
  doc.save(`NOBL-${(dogInfo.name||"Dog").replace(/\s+/g,"-")}-${weekLabel.replace(/\s+/g,"-")}-Report.pdf`);
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page:{minHeight:"100vh",background:C.fog,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:C.text},
  header:{background:C.forest,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:"58px"},
  body:{maxWidth:"480px",margin:"0 auto",padding:"20px 16px 40px"},
  card:{background:C.white,borderRadius:"16px",padding:"20px",marginBottom:"12px",border:"1px solid rgba(60,92,83,0.1)"},
  cardForest:{background:C.forest,borderRadius:"16px",padding:"20px",marginBottom:"12px"},
  lbl:{fontSize:"11px",fontWeight:"600",letterSpacing:"0.1em",textTransform:"uppercase",color:C.textLight,marginBottom:"6px"},
  input:{width:"100%",padding:"11px 14px",borderRadius:"10px",border:"1.5px solid rgba(60,92,83,0.2)",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",color:C.text,background:C.white,outline:"none",boxSizing:"border-box",marginBottom:"10px"},
  btnPrimary:{width:"100%",padding:"14px",borderRadius:"12px",border:"none",background:C.forest,color:C.white,fontSize:"15px",fontWeight:"600",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  btnSky:{width:"100%",padding:"13px",borderRadius:"12px",border:`1.5px solid ${C.sky}`,background:"transparent",color:C.sky,fontSize:"15px",fontWeight:"600",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:"8px"},
  btnOutline:{padding:"10px 16px",borderRadius:"10px",border:`1.5px solid ${C.forest}`,background:"transparent",color:C.forest,fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
};

function Header({dogName,week}){
  return(
    <div style={S.header}>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <img src={LOGO_SRC} alt="NOBL" style={{height:"36px",width:"auto",objectFit:"contain",display:"block"}}/>
        <div style={{width:"1px",height:"30px",background:"rgba(255,255,255,0.2)"}}/>
        <div style={{fontSize:"11px",color:C.skyLight,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:"500"}}>Coat & Skin Tracker</div>
      </div>
      {dogName&&(
        <div style={{textAlign:"right"}}>
          <div style={{color:C.skyLight,fontSize:"10px",letterSpacing:"0.06em"}}>TRACKING</div>
          <div style={{color:C.white,fontSize:"14px",fontWeight:"600"}}>{dogName}</div>
          {week!==undefined&&<div style={{color:C.skyLight,fontSize:"11px"}}>{WEEKS[week]}</div>}
        </div>
      )}
    </div>
  );
}

// ── Photo Capture with AI validation ─────────────────────────────────────────
function PhotoCapture({zones, onComplete}){
  const [idx,setIdx]=useState(0);
  const [photos,setPhotos]=useState({});
  const [previews,setPreviews]=useState({});
  const [warnings,setWarnings]=useState([]);
  const [heicInfo,setHeicInfo]=useState(null);
  const [checking,setChecking]=useState(false);
  const [validating,setValidating]=useState(false);
  const [aiIssue,setAiIssue]=useState(null);
  const [pendingFile,setPendingFile]=useState(null);
  const [pendingBase64,setPendingBase64]=useState(null);
  const fileRef=useRef();

  const zone=zones[idx];
  const isLast=idx===zones.length-1;
  const has=!!photos[zone.id];

  const acceptBase64=(file,base64)=>{
    setPhotos(p=>({...p,[zone.id]:base64}));
    setPreviews(p=>({...p,[zone.id]:URL.createObjectURL(file)}));
    setWarnings([]); setHeicInfo(null); setAiIssue(null); setPendingFile(null); setPendingBase64(null);
  };

  const handleChange=async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value="";
    setChecking(true); setWarnings([]); setHeicInfo(null); setAiIssue(null); setPendingFile(null); setPendingBase64(null);

    // Client-side check first (catches HEIC immediately)
    const {warnings:w, isHeic, heicInstructions}=await softCheck(file);
    if(isHeic){
      setChecking(false);
      setHeicInfo(heicInstructions);
      return;
    }
    if(w.length>0){
      setChecking(false); setWarnings(w); setPendingFile(file); return;
    }

    // Read to base64
    const base64 = await new Promise(res=>{
      const reader=new FileReader();
      reader.onload=()=>res(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });

    setChecking(false);
    setValidating(true);

    // AI validation
    const validation = await validatePhotoWithAI(base64, zone);
    setValidating(false);

    if(!validation.usable){
      setAiIssue(validation);
      setPendingFile(file); setPendingBase64(base64);
    } else {
      acceptBase64(file, base64);
    }
  };

  const forceAccept=()=>{ if(pendingFile&&pendingBase64) acceptBase64(pendingFile,pendingBase64); };
  const retake=()=>{
    setPhotos(p=>{const n={...p};delete n[zone.id];return n;});
    setPreviews(p=>{const n={...p};delete n[zone.id];return n;});
    setWarnings([]); setHeicInfo(null); setAiIssue(null); setPendingFile(null); setPendingBase64(null);
    setTimeout(()=>fileRef.current?.click(),100);
  };
  const next=()=>{
    if(isLast) onComplete(photos);
    else { setIdx(i=>i+1); setWarnings([]); setHeicInfo(null); setAiIssue(null); setPendingFile(null); setPendingBase64(null); }
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
            <div key={z.id} style={{flex:1,height:"5px",borderRadius:"3px",
              background:i<idx?C.forest:i===idx?C.sky:"rgba(60,92,83,0.12)",transition:"background 0.3s"}}/>
          ))}
        </div>
      </div>

      <div style={{background:C.ember,borderRadius:"10px",padding:"10px 14px",display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
        <span style={{fontSize:"16px",flexShrink:0}}>⚡</span>
        <div style={{fontSize:"13px",color:C.white,fontWeight:"600"}}>Enable camera flash before taking this photo</div>
      </div>

      <div style={S.card}>
        <div style={{marginBottom:"14px"}}>{zone.svgGuide}</div>
        <div style={{background:"rgba(114,170,185,0.1)",border:"1px solid rgba(114,170,185,0.25)",borderRadius:"10px",padding:"11px 14px",marginBottom:"12px",fontSize:"13px",color:C.text,lineHeight:"1.55"}}>
          <span style={{fontWeight:"700",color:C.sky}}>How to take this photo — </span>{zone.tip}
        </div>

        {/* Checklist */}
        <div style={{marginBottom:"14px"}}>
          <div style={{fontSize:"11px",fontWeight:"600",color:C.textLight,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"6px"}}>Before uploading, confirm:</div>
          {zone.checks.map((t,i)=>(
            <div key={i} style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"5px"}}>
              <div style={{width:"14px",height:"14px",borderRadius:"3px",background:"rgba(60,92,83,0.15)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:"7px",height:"7px",borderRadius:"1px",background:C.forest}}/>
              </div>
              <div style={{fontSize:"12px",color:C.textMid}}>{t}</div>
            </div>
          ))}
        </div>

        {/* HEIC error — most prominent, no "use anyway" */}
        {heicInfo&&(
          <div style={{background:"rgba(204,102,51,0.08)",border:"2px solid rgba(204,102,51,0.4)",borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
            <div style={{fontWeight:"700",color:C.ember,fontSize:"14px",marginBottom:"8px"}}>⚠ iPhone HEIC format not supported</div>
            <div style={{fontSize:"13px",color:"#9e4e26",lineHeight:"1.6",whiteSpace:"pre-line",marginBottom:"12px"}}>{heicInfo}</div>
            <button onClick={()=>fileRef.current?.click()} style={{...S.btnPrimary,padding:"11px",fontSize:"14px"}}>
              📷 Upload a different photo
            </button>
          </div>
        )}

        {/* General warnings */}
        {warnings.length>0&&!has&&!heicInfo&&(
          <div style={{background:"rgba(204,102,51,0.08)",border:"1px solid rgba(204,102,51,0.35)",borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
            <div style={{fontWeight:"700",color:C.ember,fontSize:"14px",marginBottom:"8px"}}>⚠ Photo issue detected</div>
            {warnings.map((w,i)=>(
              <div key={i} style={{fontSize:"13px",color:"#9e4e26",marginBottom:"5px",lineHeight:"1.5"}}>• {w}</div>
            ))}
            <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
              <button onClick={()=>fileRef.current?.click()} style={{...S.btnPrimary,flex:2,padding:"11px",fontSize:"14px"}}>📷 Retake photo</button>
              <button onClick={forceAccept} style={{...S.btnOutline,flex:1}}>Use anyway</button>
            </div>
          </div>
        )}

        {/* AI validation issue */}
        {aiIssue&&!has&&(
          <div style={{background:"rgba(204,102,51,0.08)",border:"1px solid rgba(204,102,51,0.35)",borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
            <div style={{fontWeight:"700",color:C.ember,fontSize:"14px",marginBottom:"6px"}}>⚠ Photo needs improvement</div>
            <div style={{fontSize:"13px",color:"#9e4e26",marginBottom:"4px",lineHeight:"1.5"}}><strong>Issue:</strong> {aiIssue.issue}</div>
            {aiIssue.suggestion&&<div style={{fontSize:"13px",color:C.text,marginBottom:"10px",lineHeight:"1.5"}}><strong>Fix:</strong> {aiIssue.suggestion}</div>}
            <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
              <button onClick={()=>fileRef.current?.click()} style={{...S.btnPrimary,flex:2,padding:"11px",fontSize:"14px"}}>📷 Retake photo</button>
              <button onClick={forceAccept} style={{...S.btnOutline,flex:1}}>Use anyway</button>
            </div>
          </div>
        )}

        {/* Checking / validating */}
        {(checking||validating)&&(
          <div style={{textAlign:"center",padding:"20px",color:C.sky,fontSize:"14px",fontWeight:"600"}}>
            <div style={{marginBottom:"6px"}}>{validating?"🔍":"⏳"}</div>
            {validating?"Checking photo quality with AI...":"Checking photo..."}
          </div>
        )}

        {/* Preview */}
        {has&&!checking&&!validating&&(
          <div>
            <img src={previews[zone.id]} alt={zone.label}
              style={{width:"100%",borderRadius:"10px",maxHeight:"200px",objectFit:"cover",display:"block",marginBottom:"10px"}}/>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={retake} style={{...S.btnPrimary,background:"transparent",color:C.forest,border:`1.5px solid ${C.forest}`,flex:1}}>Retake</button>
              <button onClick={next} style={{...S.btnPrimary,flex:2}}>{isLast?"Run Analysis →":`Next: ${zones[idx+1]?.shortLabel} →`}</button>
            </div>
          </div>
        )}

        {/* Upload area */}
        {!has&&!checking&&!validating&&!warnings.length&&!heicInfo&&!aiIssue&&(
          <div onClick={()=>fileRef.current?.click()}
            style={{border:"2px dashed rgba(60,92,83,0.25)",borderRadius:"12px",padding:"32px 20px",textAlign:"center",cursor:"pointer",background:"rgba(60,92,83,0.03)"}}>
            <div style={{fontSize:"30px",marginBottom:"8px"}}>📷</div>
            <div style={{fontSize:"15px",fontWeight:"600",color:C.forest,marginBottom:"4px"}}>Tap to upload photo</div>
            <div style={{fontSize:"12px",color:C.textLight}}>JPEG or PNG · Not HEIC</div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
          style={{display:"none"}} onChange={handleChange}/>
      </div>

      {Object.keys(previews).length>0&&(
        <div style={{...S.card,padding:"14px 16px"}}>
          <div style={S.lbl}>Uploaded so far</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {zones.slice(0,idx+1).map(z=>previews[z.id]&&(
              <div key={z.id} style={{position:"relative"}}>
                <img src={previews[z.id]} alt={z.label}
                  style={{width:"56px",height:"56px",borderRadius:"8px",objectFit:"cover",border:`2px solid ${C.sky}`}}/>
                <div style={{position:"absolute",bottom:"2px",left:"2px",right:"2px",
                  background:"rgba(0,0,0,0.55)",borderRadius:"4px",fontSize:"8px",color:"white",textAlign:"center",padding:"1px"}}>{z.shortLabel}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({score,size=84,stroke=7}){
  const r=size/2-stroke,circ=2*Math.PI*r,offset=circ-(score/10)*circ;
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

function AnalysisResults({results,weekLabel,dogInfo,history,currentWeek,onSelectWeek,onNextWeek}){
  const [pdfLoading,setPdfLoading]=useState(false);
  const valid=results.filter(r=>r.score&&r.score>0);
  const avg=valid.length?parseFloat((valid.reduce((a,b)=>a+(b.score||0),0)/valid.length).toFixed(1)):0;
  const lbl=avg>=9?"Excellent":avg>=7.5?"Good":avg>=6?"Fair":"Needs Attention";

  // Collect all unique recommendation bullets across zones
  const allBullets=[...new Set(
    results.flatMap(r=>(r.recommendations||"").split("|").map(b=>b.trim()).filter(Boolean))
  )];

  const handlePDF=async()=>{
    setPdfLoading(true);
    try{await generatePDF(dogInfo,results,weekLabel);}
    catch(e){alert("PDF generation failed. Please try again.");}
    setPdfLoading(false);
  };

  return(
    <div>
      {history.length>1&&(
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {history.sort((a,b)=>a.week-b.week).map(e=>(
            <button key={e.week} onClick={()=>onSelectWeek(e.week)} style={{
              padding:"6px 14px",borderRadius:"20px",
              border:`1.5px solid ${e.week===currentWeek?C.forest:"rgba(60,92,83,0.2)"}`,
              background:e.week===currentWeek?C.forest:"transparent",
              color:e.week===currentWeek?C.white:C.textMid,
              fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{e.weekLabel}</button>
          ))}
        </div>
      )}

      {/* Score hero */}
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
          <div style={{fontSize:"20px",fontFamily:"'DM Serif Display',Georgia,serif",color:C.white,marginBottom:"6px"}}>{lbl}</div>
          <div style={{display:"inline-block",background:"rgba(255,255,255,0.15)",borderRadius:"20px",padding:"3px 12px",fontSize:"12px",color:C.skyLight}}>
            {results[0]?.trend==="improving"?"↑ Improving":results[0]?.trend==="declining"?"↓ Declining":"◆ Baseline"}
          </div>
        </div>
      </div>

      {/* Zone bars */}
      <div style={S.card}>
        <div style={S.lbl}>By area</div>
        {results.map((r,i)=>{
          const zone=PHOTO_ZONES.find(z=>z.id===r.zoneId);
          const bc=r.score>=8?C.sky:r.score>=6?C.forest:C.ember;
          return(
            <div key={i} style={{marginBottom:"10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{fontSize:"12px",color:C.textMid,width:"68px",flexShrink:0}}>{zone?.shortLabel}</div>
                {r.score>0?(
                  <>
                    <div style={{flex:1,height:"6px",borderRadius:"3px",background:"rgba(60,92,83,0.1)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${r.score*10}%`,background:bc,borderRadius:"3px",transition:"width 0.8s ease"}}/>
                    </div>
                    <div style={{fontSize:"13px",fontWeight:"700",color:bc,width:"24px",textAlign:"right"}}>{r.score}</div>
                  </>
                ):(
                  <div style={{fontSize:"12px",color:C.textLight,fontStyle:"italic"}}>Not analyzed</div>
                )}
              </div>
              {r.photoNote&&r.photoNote.trim()&&(
                <div style={{fontSize:"11px",color:C.textLight,marginTop:"3px",paddingLeft:"78px"}}>ℹ {r.photoNote}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Per-zone findings */}
      <div style={S.card}>
        <div style={S.lbl}>Key findings by area</div>
        {results.map((r,i)=>{
          const zone=PHOTO_ZONES.find(z=>z.id===r.zoneId);
          return(
            <div key={i} style={{marginBottom:"14px"}}>
              <div style={{fontSize:"13px",fontWeight:"700",color:C.forest,marginBottom:"6px",paddingBottom:"4px",borderBottom:`1px solid rgba(60,92,83,0.1)`}}>
                {zone?.label}
              </div>
              {(!r.score||r.score===0)?(
                <div style={{fontSize:"13px",color:C.textLight,fontStyle:"italic",paddingLeft:"4px"}}>
                  {r.photoNote||"Photo could not be analyzed. Please retake and try again."}
                </div>
              ):(
                (r.observations||[]).map((obs,j)=>(
                  <div key={j} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"6px"}}>
                    <div style={{width:"6px",height:"6px",borderRadius:"50%",background:C.sky,flexShrink:0,marginTop:"5px"}}/>
                    <div style={{fontSize:"13px",color:C.textMid,lineHeight:"1.5"}}>{obs}</div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* Diet signal */}
      <div style={{...S.card,background:"rgba(114,170,185,0.1)",border:"1px solid rgba(114,170,185,0.25)"}}>
        <div style={{...S.lbl,color:C.skyDark}}>Diet signal</div>
        <div style={{fontSize:"14px",color:C.text,lineHeight:"1.6"}}>{results.find(r=>r.dietSignals)?.dietSignals||"—"}</div>
      </div>

      {/* Recommendations as bullets */}
      {allBullets.length>0&&(
        <div style={S.cardForest}>
          <div style={{...S.lbl,color:C.skyLight}}>Recommendations</div>
          {allBullets.map((bullet,i)=>{
            const isClosing = bullet.toLowerCase().includes("nobLfoods.com") || bullet.toLowerCase().includes("customerservice");
            return(
              <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"8px",
                paddingTop: isClosing?"10px":"0",
                borderTop: isClosing?"1px solid rgba(255,255,255,0.15)":"none"}}>
                <div style={{fontSize:"14px",color:C.fog,flexShrink:0,marginTop:"1px"}}>•</div>
                <div style={{fontSize:"13px",color:isClosing?C.skyLight:C.fog,lineHeight:"1.55",fontStyle:isClosing?"italic":"normal"}}>{bullet}</div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={handlePDF} disabled={pdfLoading}
        style={{...S.btnSky,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
        {pdfLoading?"Generating PDF…":"⬇  Download PDF Report"}
      </button>

      <div style={{fontSize:"12px",color:C.textLight,lineHeight:"1.6",padding:"10px 4px",textAlign:"center"}}>
        ⚕ AI-assisted screening only. Not a substitute for veterinary diagnosis.<br/>
        <a href="https://NOBLFoods.com" style={{color:C.sky,textDecoration:"none"}}>NOBLFoods.com</a>
      </div>

      {currentWeek<6&&(
        <button style={{...S.btnPrimary,marginTop:"4px"}} onClick={onNextWeek}>
          Schedule {WEEKS[Math.min(currentWeek+1,6)]} Check-in →
        </button>
      )}
    </div>
  );
}

export default function NoblDogTracker(){
  const [step,setStep]=useState("onboarding");
  const [dogInfo,setDogInfo]=useState({name:"",breed:"",age:"",email:"",diet:"",dietBrand:"",dietDuration:""});
  const [currentWeek,setCurrentWeek]=useState(0);
  const [analysisPhase,setAnalysisPhase]=useState("");
  const [analysisProgress,setAnalysisProgress]=useState(0);
  const [analysisError,setAnalysisError]=useState("");
  const [weekResults,setWeekResults]=useState({});
  const [history,setHistory]=useState([]);
  const [viewingWeek,setViewingWeek]=useState(0);

  const handlePhotosComplete=useCallback(async(photos)=>{
    setStep("analyzing"); setAnalysisError("");
    const results=[];
    for(let i=0;i<PHOTO_ZONES.length;i++){
      const zone=PHOTO_ZONES[i];
      setAnalysisPhase(`Analyzing ${zone.label}...`);
      setAnalysisProgress(Math.round((i/PHOTO_ZONES.length)*100));
      if(!photos[zone.id]){
        results.push({zoneId:zone.id,score:0,observations:[],dietSignals:"",recommendations:"",photoNote:"Photo was skipped.",trend:"baseline"});
        continue;
      }
      try{
        const result=await callAnalyze(photos[zone.id],zone,dogInfo,WEEKS[currentWeek]);
        results.push({zoneId:zone.id,...result});
      }catch(err){
        results.push({zoneId:zone.id,score:0,observations:[],dietSignals:"",recommendations:"",photoNote:"Analysis failed — please check your connection.",trend:"baseline"});
      }
    }
    setAnalysisProgress(100);
    const allFailed=results.every(r=>!r.score||r.score===0);
    if(allFailed){
      setAnalysisError("The analysis could not connect to the AI service. Please check that your ANTHROPIC_API_KEY is set correctly in Netlify environment variables, then redeploy and try again.");
      setStep("error"); return;
    }
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
              <div style={S.lbl}>Dog's name *</div>
              <input style={S.input} placeholder="e.g. Buddy" value={dogInfo.name} onChange={e=>upd("name",e.target.value)}/>
              <div style={S.lbl}>Breed</div>
              <select style={{...S.input,background:C.white}} value={dogInfo.breed} onChange={e=>upd("breed",e.target.value)}>
                <option value="">Select breed...</option>
                {DOG_BREEDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
              <div style={S.lbl}>Age</div>
              <input style={S.input} placeholder="e.g. 4 years" value={dogInfo.age} onChange={e=>upd("age",e.target.value)}/>
              <div style={S.lbl}>Your email address *</div>
              <input style={S.input} type="email" placeholder="you@example.com" value={dogInfo.email} onChange={e=>upd("email",e.target.value)}/>
              <div style={{fontSize:"11px",color:C.textLight,marginTop:"-6px",marginBottom:"12px"}}>For weekly reminders and your report summary</div>
              <div style={S.lbl}>Current diet type *</div>
              <select style={{...S.input,background:C.white}} value={dogInfo.diet} onChange={e=>upd("diet",e.target.value)}>
                <option value="">Select diet type...</option>
                {DIET_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <div style={S.lbl}>Food brand</div>
              <input style={S.input} placeholder="e.g. Royal Canin, Orijen" value={dogInfo.dietBrand} onChange={e=>upd("dietBrand",e.target.value)}/>
              <div style={S.lbl}>How long on this diet?</div>
              <input style={S.input} placeholder="e.g. 6 weeks" value={dogInfo.dietDuration} onChange={e=>upd("dietDuration",e.target.value)}/>
              <div style={{fontSize:"11px",color:C.textLight,marginBottom:"12px"}}>* Required fields</div>
              <button style={{...S.btnPrimary,opacity:canStart?1:0.4}} disabled={!canStart} onClick={()=>setStep("photos")}>
                Begin Baseline Photos →
              </button>
            </div>
            <div style={S.card}>
              <div style={S.lbl}>5 areas we monitor</div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {PHOTO_ZONES.map(z=>(
                  <div key={z.id} style={{background:"rgba(60,92,83,0.07)",borderRadius:"8px",padding:"6px 12px",fontSize:"13px",color:C.forest,fontWeight:"500"}}>{z.shortLabel}</div>
                ))}
              </div>
            </div>
            <div style={{textAlign:"center",padding:"4px 0 8px",fontSize:"12px"}}>
              <a href="https://NOBLFoods.com" style={{color:C.sky,textDecoration:"none"}}>NOBLFoods.com</a>
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

        {step==="error"&&(
          <div style={{...S.card,marginTop:"4px",textAlign:"center",padding:"36px 24px"}}>
            <div style={{fontSize:"36px",marginBottom:"12px"}}>⚠️</div>
            <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"18px",color:C.forest,marginBottom:"12px"}}>Analysis unavailable</div>
            <div style={{fontSize:"13px",color:C.textMid,lineHeight:"1.65",marginBottom:"20px"}}>{analysisError}</div>
            <button style={S.btnPrimary} onClick={()=>setStep("photos")}>Try again</button>
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
