
/* ══════════ REAL SKY MATH ══════════ */
const SIGNS=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const GLY=['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];
const ELEM=['fire','earth','air','water'];

/* ══════════ EPHEMERIS — real. JPL elements + Meeus lunar theory. ══════════ */
const D2R=Math.PI/180;
const EL={
 mercury:[.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593,.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081],
 venus:[.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255,.00000390,-.00004107,-.00078890,58517.81538729,.00268329,-.27769418],
 earth:[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0,.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0],
 mars:[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891,.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343],
 jupiter:[5.20288700,.04838624,1.30439695,34.39644051,14.72847983,100.47390909,-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106],
 saturn:[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448,-.00125060,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794],
 uranus:[19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503,-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589],
 neptune:[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664],
 pluto:[39.48211675,.24882730,17.14001206,238.92903833,224.06891629,110.30393684,-.00031596,.00005170,.00004818,145.20780515,-.04062942,-.01183482]};
const SYN=29.53058867;  // synodic month
const nm=x=>((x%360)+360)%360;
function jdOf(d){return d.getTime()/86400000+2440587.5;}
const Tof=J=>(J-2451545.0)/36525;
function helio(p,T){
  const e=EL[p];
  const a=e[0]+e[6]*T, ec=e[1]+e[7]*T, I=(e[2]+e[8]*T)*D2R;
  const L=nm(e[3]+e[9]*T), pe=nm(e[4]+e[10]*T), no=nm(e[5]+e[11]*T);
  const w=(pe-no)*D2R; let M=nm(L-pe); if(M>180)M-=360; M*=D2R;
  let E=M;
  for(let i=0;i<60;i++){const dE=(E-ec*Math.sin(E)-M)/(1-ec*Math.cos(E));E-=dE;if(Math.abs(dE)<1e-12)break;}
  const xo=a*(Math.cos(E)-ec), yo=a*Math.sqrt(1-ec*ec)*Math.sin(E), n=no*D2R;
  const cw=Math.cos(w),sw=Math.sin(w),cn=Math.cos(n),sn=Math.sin(n),ci=Math.cos(I),si=Math.sin(I);
  return [ (cw*cn-sw*sn*ci)*xo + (-sw*cn-cw*sn*ci)*yo,
           (cw*sn+sw*cn*ci)*xo + (-sw*sn+cw*cn*ci)*yo,
           (sw*si)*xo + (cw*si)*yo ];
}
function sunLonJ(J){const T=Tof(J),[x,y]=helio('earth',T);return nm(Math.atan2(-y,-x)/D2R);}
function planLonJ(p,J){const T=Tof(J),e=helio('earth',T),q=helio(p,T);
  return nm(Math.atan2(q[1]-e[1],q[0]-e[0])/D2R);}
const MTB=[[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
 [0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],
 [2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],
 [0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],
 [2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
 [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],
 [2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],
 [2,-2,-1,0,2048],[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],
 [3,0,-1,0,-892],[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
 [2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],
 [1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],
 [4,0,-3,0,330],[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
function moonLonJ(J){
  const T=Tof(J);
  const Lp=nm(218.3164477+481267.88123421*T-0.0015786*T*T+T**3/538841-T**4/65194000);
  const Dm=nm(297.8501921+445267.1114034*T-0.0018819*T*T+T**3/545868-T**4/113065000);
  const M =nm(357.5291092+35999.0502909*T-0.0001536*T*T+T**3/24490000);
  const Mp=nm(134.9633964+477198.8675055*T+0.0087414*T*T+T**3/69699-T**4/14712000);
  const F =nm(93.2720950+483202.0175233*T-0.0036539*T*T-T**3/3526000+T**4/863310000);
  const E=1-0.002516*T-0.0000074*T*T;
  const A1=nm(119.75+131.849*T), A2=nm(53.09+479264.290*T);
  let s=0;
  for(const[d,m,mp,f,c]of MTB) s+=c*Math.pow(E,Math.abs(m))*Math.sin((d*Dm+m*M+mp*Mp+f*F)*D2R);
  s+=3958*Math.sin(A1*D2R)+1962*Math.sin((Lp-F)*D2R)+318*Math.sin(A2*D2R);
  return nm(Lp+s/1000000);
}
/* public API — same names the app already uses */
const moonLon=d=>moonLonJ(jdOf(d));
const sunLon =d=>sunLonJ(jdOf(d));
const PL={sun:sunLon,moon:moonLon,
 mercury:d=>planLonJ('mercury',jdOf(d)), venus:d=>planLonJ('venus',jdOf(d)),
 mars:d=>planLonJ('mars',jdOf(d)),       jupiter:d=>planLonJ('jupiter',jdOf(d)),
 saturn:d=>planLonJ('saturn',jdOf(d)),   uranus:d=>planLonJ('uranus',jdOf(d)),
 neptune:d=>planLonJ('neptune',jdOf(d)), pluto:d=>planLonJ('pluto',jdOf(d))};
const PGL={sun:'☉',moon:'☽',mercury:'☿',venus:'♀︎',mars:'♂︎',jupiter:'♃',saturn:'♄',uranus:'♅',neptune:'♆',pluto:'♇'};
/* true illuminated fraction from real sun/moon elongation */
function phase(d){
  const J=jdOf(d), el=nm(moonLonJ(J)-sunLonJ(J));
  return el/360;                       /* 0=new .5=full — real, not synodic-average */
}
/* retrograde: is the planet moving backwards today? */
function isRx(p,d){
  const a=PL[p](new Date(d.getTime()-43200000)), b=PL[p](new Date(d.getTime()+43200000));
  let df=b-a; if(df>180)df-=360; if(df<-180)df+=360;
  return df<0;
}
/* timezone truth: IANA zone + birth moment → the offset that was actually in effect.
   browsers ship the full tz database — this gets nov 1995 louisville right (-5, EST),
   where the old lon/15 guess said -6 and pushed the ascendant a whole sign forward. */
function zoneOff(zone,ms){
  const f=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'longOffset'});
  const p=f.formatToParts(new Date(ms)).find(x=>x.type==='timeZoneName').value; /* "GMT-05:00" */
  const m=p.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  return m?(m[1]==='-'?-1:1)*(+m[2]+(+m[3]||0)/60):0;
}
function tzOffsetAt(zone,dateStr,timeStr){
  if(!zone||!dateStr)return null;
  try{
    const [Y,Mo,Dy]=dateStr.split('-').map(Number);
    const [hh,mm]=(timeStr||'12:00').split(':').map(Number);
    let utc=Date.UTC(Y,Mo-1,Dy,hh,mm||0);
    for(let i=0;i<2;i++)utc=Date.UTC(Y,Mo-1,Dy,hh,mm||0)-zoneOff(zone,utc)*3600000;
    return zoneOff(zone,utc);
  }catch(e){return null;}
}
/* my offset at my birth moment — zone-resolved when we have it, saved value otherwise */
function meTz(){
  if(S.me.tzName){const o=tzOffsetAt(S.me.tzName,S.me.date,S.me.time);if(o!=null)return o;}
  return S.me.tz;
}
/* ASC · MC · Porphyry houses — needs time + lat/lon (+ the chart owner's utc offset) */
function angles(dateStr,timeStr,lat,lon,tzo){
  if(!dateStr)return null;
  const [Y,Mo,Dy]=dateStr.split('-').map(Number);
  const [hh,mm]=(timeStr||'12:00').split(':').map(Number);
  const la=parseFloat(lat), lo=parseFloat(lon);
  if(isNaN(la)||isNaN(lo))return null;
  const tz=(tzo!=null&&!isNaN(tzo))?tzo:Math.round(lo/15);
  const ut=hh+(mm||0)/60-tz;                       /* local → UT */
  /* julian day (Meeus), same as the working reference */
  let y=Y, mo=Mo;
  if(mo<=2){y-=1;mo+=12;}
  const A_=Math.floor(y/100), B=2-A_+Math.floor(A_/4);
  const J=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(mo+1))+Dy+B-1524.5+ut/24;
  const T=(J-2451545.0)/36525;
  const gmst=nm(280.46061837+360.98564736629*(J-2451545.0)+0.000387933*T*T-T**3/38710000);
  const lst=nm(gmst+lo), r=lst*D2R, eps=(23.439291-0.0130042*T)*D2R;
  const mc=nm(Math.atan2(Math.sin(r),Math.cos(r)*Math.cos(eps))/D2R);
  let asc=nm(Math.atan2(Math.cos(r),-(Math.sin(r)*Math.cos(eps)+Math.tan(la*D2R)*Math.sin(eps)))/D2R);
  if(!(nm(asc-mc)>0&&nm(asc-mc)<180))asc=nm(asc+180);
  const ic=nm(mc+180), ds=nm(asc+180);
  const q1=nm(ic-asc)/3,q2=nm(ds-ic)/3,q3=nm(mc-ds)/3,q4=nm(asc-mc)/3;
  const H=[asc,nm(asc+q1),nm(asc+2*q1),ic,nm(ic+q2),nm(ic+2*q2),ds,nm(ds+q3),nm(ds+2*q3),mc,nm(mc+q4),nm(mc+2*q4)];
  return {asc,mc,H};
}
function houseOf(lon,A){
  if(!A)return null;
  for(let i=0;i<12;i++){
    const a=A.H[i], b=A.H[(i+1)%12];
    const span=nm(b-a), off=nm(lon-a);
    if(off<span||span===0)return i+1;
  }
  return 1;
}

const signOf=l=>Math.floor(l/30)%12;
const degIn=l=>l%30;
function phaseName(p){
  if(p<.025||p>.975)return'new moon';if(p<.235)return'waxing crescent';if(p<.265)return'first quarter';
  if(p<.485)return'waxing gibbous';if(p<.515)return'full moon';if(p<.735)return'waning gibbous';
  if(p<.765)return'last quarter';return'waning crescent';}
function moonSVG(p,size){
  const r=size/2-1, cx=size/2, cy=size/2;
  // terminator: ellipse width = |cos(2πp)| * r, lit side flips at full/new
  const k=Math.cos(2*Math.PI*p), rx=Math.abs(k)*r;
  const waxing=p<.5;
  const lit=`<path d="M ${cx} ${cy-r} A ${r} ${r} 0 0 ${waxing?1:0} ${cx} ${cy+r} A ${rx} ${r} 0 0 ${(waxing?(k>0?0:1):(k>0?1:0))} ${cx} ${cy-r} Z" fill="var(--accent)"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--ink2)" stroke="var(--line)"/>
    ${p<.985&&p>.015?lit:(p>=.985||p<=.015?'':'')}
    ${(p>=.985||p<=.015)?'':''}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)"/></svg>`;
}
/* void-of-course approximation: last ~4h before moon changes sign */
function voidWindow(d){
  const lon=moonLon(d), degLeft=30-degIn(lon), hrsLeft=degLeft/13.176396*24;
  return hrsLeft<5 ? {active:true,hrs:hrsLeft.toFixed(1)} : {active:false,hrs:hrsLeft.toFixed(1)};
}
const MOOD={ 'new moon':'plant it. the field is finally clear.','waxing crescent':'the seed cracked. protect it, don\'t announce it.',
 'first quarter':'friction on purpose. push where it resists.','waxing gibbous':'refine, don\'t restart.','full moon':'it\'s all lit up. you can see everything, including what you were avoiding.',
 'waning gibbous':'say the thing. gratitude or grievance, either way — out loud.','last quarter':'cut what you\'ve outgrown.','waning crescent':'release weather. clear the field before you plant again.'};

/* ══════════ BESTIE DAILY READ ══════════ */
const SIGN_READ={
 aries:['fast, loud, zero patience','you want it done yesterday and honestly? swing.'],
 taurus:['slow, sensory, stubborn as hell','if it doesn\'t feel good in your body, it\'s a no. that\'s not laziness, that\'s data.'],
 gemini:['fast talk, faster brain, twelve tabs open','the info is coming in hot. don\'t make a forever call on a group-chat rumor.'],
 cancer:['soft, watery, feelings-first','you\'re not too much, you\'re just uncovered today. armor optional, boundaries required.'],
 leo:['loud, warm, main-character','be seen on purpose. dimming yourself to make someone comfortable is not humility, it\'s a favor they didn\'t earn.'],
 virgo:['precise, useful, secretly anxious','fix the one thing that\'s actually broken. not the six things that are just annoying you.'],
 libra:['charming, indecisive, deeply aware','you already know what you want. you\'re just polling the room hoping someone agrees so it\'s not your fault.'],
 scorpio:['deep, private, all or nothing','you can feel what\'s under the surface. you don\'t have to announce that you know.'],
 sagittarius:['blunt, restless, cosmically optimistic','say the honest thing. just maybe not at the volume you\'re currently drafting it at.'],
 capricorn:['cold, competent, playing the long game','do the boring thing that pays in six months. that IS the magic.'],
 aquarius:['detached, weird, ten steps ahead','you\'re not being cold, you\'re being clear. those look identical from the outside.'],
 pisces:['dreamy, porous, absorbing everything','half of what you\'re feeling isn\'t yours. put it down.']};
const PH_MOVE={'new moon':'name one thing. one. write it down like it\'s already yours.','waxing crescent':'don\'t explain the plan to anyone who\'ll water it down.',
 'first quarter':'do the hard part first. the resistance is the assignment.','waxing gibbous':'edit, don\'t abandon.','full moon':'don\'t send the text at peak volume. draft it, sleep on it, decide sober.',
 'waning gibbous':'tell someone the truth today. start with yourself.','last quarter':'delete something. a draft, a habit, a contact. anything.','waning crescent':'rest is not a reward for finishing. take it now.'};
function dailyRead(d){
  const p=phase(d), pn=phaseName(p), ms=SIGNS[signOf(moonLon(d))], ss=SIGNS[signOf(sunLon(d))];
  const [vibe,read]=SIGN_READ[ms];
  const vd=voidWindow(d);
  const l1=`the moon's in <b>${ms} ${GLY[SIGNS.indexOf(ms)]}</b> and it's ${vibe}. ${MOOD[pn]}`;
  const l2=read;
  const l3=vd.active?`heads up — the moon goes void in about ${vd.hrs}h. anything you launch, send, or swear to in that window tends to just… evaporate. wait it out. ⏳`:
    `sun's still cooking in <b>${ss}</b>, so that's the background hum under all of it.`;
  return {l1,l2,l3,move:PH_MOVE[pn],pn,ms};
}

/* ══════════ LAYERS ══════════ */
const LAYERS=[
 {g:'the almanac',items:[
  {id:'lunation',n:'new & full moons',d:'the lunations, named',c:'var(--accent)',on:1,gl:'◑'},
  {id:'sabbat',n:'sabbats',d:'the eight power days',c:'var(--accent)',on:1,gl:'✧'},
  {id:'retro',n:'retrogrades & stations',d:'the plot twists',c:'var(--accent)',on:1,gl:'℞'},
  {id:'ingress',n:'sun ingresses',d:'season changes, sign by sign',c:'var(--accent)',on:1,gl:'⇢'},
  {id:'lunar',n:'lunar transits',d:'the moon\'s walk through the signs',c:'var(--accent)',on:1,gl:'☽'},
  {id:'void',n:'void of course',d:'the dead zones',c:'#9A9A9F',on:1,gl:'⊘'},
  {id:'venus',n:'venus windows',d:'magnetism, love, the flavor of it',c:'#C77E93',on:0,gl:'♀︎'}]},
 {g:'transit intelligence · just you',items:[
  {id:'natal',n:'transits to natal',d:'direct hits to your chart',c:'var(--accent)',on:1,gl:'✦'},
  {id:'lunret',n:'lunar return',d:'the moon comes home',c:'var(--accent)',on:1,gl:'☾'},
  {id:'prof',n:'annual profections',d:'the house running your year',c:'var(--accent)',on:0,gl:'◈'},
  {id:'firdaria',n:'firdaria · timelords',d:'who holds the keys',c:'#A8842F',on:0,gl:'♄'},
  {id:'zr',n:'zodiacal releasing',d:'chapters & peaks',c:'var(--accent)',on:0,gl:'⟳'},
  {id:'rulers',n:'house rulers on the move',d:'where your ruler walks',c:'var(--accent)',on:0,gl:'⌂'},
  {id:'sixmo',n:'six-month plan',d:'new moons as checkpoints',c:'var(--accent)',on:1,gl:'◐'}]},
 {g:'energetic entanglements',items:[
  {id:'theirs',n:'their transits',d:'when they\'re peaking or unstable',c:'#C77E93',on:1,gl:'☍'},
  {id:'syn',n:'synastry hits',d:'the sky touches you both',c:'var(--accent)',on:0,gl:'♡'},
  {id:'comp',n:'composite transits',d:'the third chart',c:'var(--accent)',on:0,gl:'◍'},
  {id:'inter',n:'interactions',d:'intimacy, contact, conflict — logged',c:'var(--accent)',on:1,gl:'◉'}]},
 {g:'venus vs uterus',items:[
  {id:'cycle',n:'cycle & ovulation',d:'period · fertile · luteal · pms',c:'var(--accent)',on:1,gl:'◉'},
  {id:'body',n:'body-sync days',d:'full moons rule body parts',c:'#C77E93',on:0,gl:'♀︎'},
  {id:'beauty',n:'beauty timing',d:'hair, skin, ink — by moon phase',c:'var(--accent)',on:0,gl:'✧'}]},
 {g:'the grimoire',items:[
  {id:'ritual',n:'rituals & workings',d:'planned & performed',c:'#A8842F',on:1,gl:'✧'},
  {id:'pull',n:'tarot pulls',d:'every card, on its date',c:'var(--accent)',on:1,gl:'✦'},
  {id:'entry',n:'journal entries',d:'notes · photos · signs',c:'var(--accent)',on:1,gl:'❦'}]}];
let LON={}; LAYERS.forEach(g=>g.items.forEach(i=>LON[i.id]=!!i.on));
const layMeta=id=>{for(const g of LAYERS)for(const i of g.items)if(i.id===id)return i;};

/* ══════════ STATE ══════════ */
const S={
  me:{name:'you',date:'',time:'',place:'',lanes:['transits','tarot','rituals','journaling']},
  people:[],
  entries:[],   /* {id,date,type,title,body,photos[],cards[{k,rev}],ritual} */
  cal:[],       /* {id,date,type,title,note} user-added */
  accent:0, cursor:new Date(2026,6,14), sel:'2026-07-14', jcursor:new Date(2026,6,14), jfilter:'all',
  set:{notif:1,voidn:1,lunar:1,ritn:0,cycn:0,lock:0,hide:0}, plus:false, onboarded:false
};
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c);};
const fmt=d=>d.toLocaleDateString('en-us',{month:'short',day:'numeric'}).toLowerCase();
const fmtL=d=>d.toLocaleDateString('en-us',{weekday:'long',month:'long',day:'numeric'}).toLowerCase();

/* ══════════ NAV ══════════ */
const TAB={sky:'sky',cal:'cal',layers:'cal',event:'cal',grim:'grim',lib:'grim',deck:'grim',pat:'grim',journal:'journal',orbit:'orbit',person:'orbit',me:'me',natal:'me'};
function nav(id){
  document.querySelectorAll('.v').forEach(v=>v.classList.remove('on'));
  document.getElementById('v-'+id).classList.add('on');
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.v===TAB[id]));
  window.scrollTo(0,0);
  if(id==='sky')renderSky(); if(id==='cal')renderCal(); if(id==='grim')renderGrim();
  if(id==='journal')renderJournal(); if(id==='pat')renderPat(); if(id==='orbit')renderOrbit();
  if(id==='layers')renderLayers(); if(id==='me')renderMe(); if(id==='natal')renderNatal(); if(id==='deck')renderDeck();
}
let tt;function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2500);}

/* ══════════ THEME ══════════ */
const THEMES=[
 /* ── the six ── name, collection, accent, deep (tone two), halo, bgL, bgD, free ──
    og went two-tone: gold stays ceremonial, the deep slot carries the second color */
 ['gold × plum','core','#C9A961','#4A2B3E','#E8D9A8','#F5F1EE','#0F090D',1],
 ['champagne','core','#D8C08A','#2B2926','#EADFC2','#F4F2EE','#0D0C0B',1],
 ['cakez rust','core','#B4543E','#8A3A2A','#E8A890','#F5EFEC','#100907',1],
 ['rose quartz','core','#C48B9F','#8E5A6E','#EAC4D2','#F5EEF0','#100A0D',1],
 ['midnight lapis','core','#4E6EB8','#2A3E7A','#A8B8E4','#EEF0F6','#08090F',1],
 ['herb garden','core','#6E8B5E','#3F5230','#B4C48B','#EEF2E9','#090C07',1]];
const COLLECTIONS=[
 ['core','','always yours']];


function setAcc(i){
  let t=THEMES[i]; if(!t){i=0;t=THEMES[0];}   /* old saves may point past the five */
  if(!t[7]&&!S.plus){ return openPaletteLock(i); }   /* premium gate */
  S.accent=i; const r=document.documentElement.style;
  const [nm,coll,acc,deep,halo,bgL,bgD,free]=t;
  const mode=document.documentElement.dataset.mode||'light';
  const bg=mode==='dark'?bgD:bgL;
  r.setProperty('--accent',acc);
  r.setProperty('--deep',deep);
  r.setProperty('--soft',acc+'26');
  r.setProperty('--glow',halo+(mode==='dark'?'44':'55'));
  r.setProperty('--grad1',halo+(mode==='dark'?'22':'2E'));
  r.setProperty('--void',bg);                          /* the whole edition changes */
  document.querySelectorAll('.swatch').forEach(s=>s.classList.toggle('on',+s.dataset.i===i));
  document.querySelectorAll('.sw[data-i]').forEach(s=>s.classList.toggle('on',+s.dataset.i===i));
  const tn=document.getElementById('thName'); if(tn)tn.textContent=nm;
  stars();
}
function openPaletteLock(i){
  const t=THEMES[i], coll=COLLECTIONS.find(c=>c[0]===t[1]);
  sheet(`<div class="gb"></div>
    <div class="plock" style="--pa:${t[2]};--ph:${t[4]}">
      <div class="plock-sky"></div>
      <div class="plock-eb">${coll?coll[1]:''}</div>
      <div class="plock-nm sf">${t[0]}</div>
      <div class="plock-prev">
        ${[0,1,2].map(n=>`<div class="pp-card" style="background:${n===1?t[2]:'var(--ink)'};border-color:${t[2]}"></div>`).join('')}
      </div>
      <div class="plock-tag">part of transit intelligence <b>plus</b></div>
      <div class="plock-sub">${THEMES.filter(x=>!x[7]).length} exclusive palettes inspired by planets, seasons, gemstones, and the night sky.</div>
      <button class="btn" onclick="S.plus=true;closeSheet();setAcc(${i});toast('✦ plus unlocked — every edition is yours')">unlock the almanac ✦</button>
      <button class="btn g" onclick="closeSheet()">maybe later</button>
    </div>`);
}
function shade(hex,p){const n=parseInt(hex.slice(1),16);
  let R=n>>16&255,G=n>>8&255,B=n&255;
  R=Math.round(Math.min(255,Math.max(0,R+R*p)));G=Math.round(Math.min(255,Math.max(0,G+G*p)));B=Math.round(Math.min(255,Math.max(0,B+B*p)));
  return '#'+((1<<24)+(R<<16)+(G<<8)+B).toString(16).slice(1);}
const swHTML=()=>`<div class="dotrow">${THEMES.map((t,i)=>
  `<button class="sw${i===S.accent?' on':''}" data-i="${i}" onclick="setAcc(${i})" style="--c1:${t[2]};--c2:${t[3]}">
     <span class="d"></span><span class="n">${t[0].replace(' ','<br>')}</span>
   </button>`).join('')}</div>`;
function setMode(m){document.documentElement.dataset.mode=m;
  document.querySelectorAll('#meMode button,#obMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
  setAcc(S.accent); stars();}
function setMode(m){document.documentElement.dataset.mode=m;document.querySelectorAll('#meMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));stars();}

const TSUB={clean:'all sans, zero ceremony',balanced:'serif titles + quotes only',ceremony:'full book of shadows — stars, glyphs, ✦'};

document.querySelectorAll('#meMode button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));

function stars(){const c=document.getElementById('stars'),x=c.getContext('2d');
  c.width=innerWidth;c.height=innerHeight;x.clearRect(0,0,c.width,c.height);
  if(document.documentElement.dataset.type!=='ceremony')return;
  const dk=document.documentElement.dataset.mode==='dark';
  const n=Math.floor(c.width*c.height/(dk?9000:15000));
  const a=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  for(let i=0;i<n;i++){x.globalAlpha=Math.random()*(dk?.7:.4)+.1;x.fillStyle=Math.random()>.85?a:(dk?'#EDE6D6':'#B9B4A4');
    x.beginPath();x.arc(Math.random()*c.width,Math.random()*c.height,Math.random()*1.1+.25,0,7);x.fill();}
  x.globalAlpha=1;}
addEventListener('resize',stars);

/* ══════════ DECK (all 78 · real 1909 scans) ══════════ */
const MAJ=[['m00','the fool','♅ uranus','the leap. beginnings, trust, the open road.','recklessness in a freedom costume. look before the cliff.','a yes to starting — pack light'],
['m01','the magician','☿ mercury','every tool is already on the table.','manifesting leaking into manipulating. whose spell is this?','skill, will, receipts'],
['m02','the high priestess','☽ moon','the knowing behind the veil. don\'t say it out loud yet.','intuition on mute — you\'re asking everyone but yourself.','sit with it. the answer surfaces'],
['m03','the empress','♀︎ venus','abundance, body, softness as a power move.','over-giving until there\'s nothing left to give from.','feed it and it grows'],
['m04','the emperor','♈︎ aries','structure. the boring thing that holds it all up.','control cosplaying as protection.','build the frame first'],
['m05','the hierophant','♉︎ taurus','tradition, teachers, the way it\'s always been done.','the rulebook is expired. write your own.','ask someone who\'s done it'],
['m06','the lovers','♊︎ gemini','a real choice — and choosing means losing the other.','indecision dressed as options.','choose. then commit.'],
['m07','the chariot','♋︎ cancer','armor on, wheels moving. willpower wins this one.','white-knuckling in the wrong direction.','drive. don\'t drift.'],
['m08','strength','♌︎ leo','soft hands on the lion. power that doesn\'t raise its voice.','forcing it. the lion isn\'t tamed, it\'s exhausted.','patience wins this one'],
['m09','the hermit','♍︎ virgo','the lantern, the distance, the answer only silence gives.','isolation with a spiritual excuse.','go quiet on purpose'],
['m10','wheel of fortune','♃ jupiter','the turn. luck, timing, the thing outside your grip.','stuck on the same loop of the same wheel.','the cycle is turning'],
['m11','justice','♎︎ libra','cause, effect, receipts. the scales don\'t care about your feelings.','avoiding accountability and calling it peace.','tell the truth'],
['m12','the hanged man','♆ neptune','the pause that changes the angle.','stalling and calling it surrender.','stop struggling. look again.'],
['m13','death','♏︎ scorpio','the ending that was already true. clear the field.','clutching the corpse of a chapter. let go.','transformation, not tragedy'],
['m14','temperance','♐︎ sagittarius','the blend. slow alchemy, right proportions.','extremes. all or nothing is a personality, not a plan.','middle path, on purpose'],
['m15','the devil','♑︎ capricorn','the chain you can take off whenever. that\'s the trick.','you\'re already loosening it. keep going.','name the addiction'],
['m16','the tower','♂︎ mars','the lightning does you a favor. false structures fall fast.','the collapse in slow motion — you\'re holding the wall up yourself.','sudden clarity, dramatic exit'],
['m17','the star','♒︎ aquarius','after the tower, the water. hope with evidence.','faith running on fumes. refill before you pour.','healing is on schedule'],
['m18','the moon','♓︎ pisces','the path between the towers. not everything is as lit as it looks.','the fog lifts — the confusion WAS the message.','trust the dog, watch the wolf'],
['m19','the sun','☉ sun','it\'s good. let it be good.','dimming yourself for someone else\'s comfort.','joy, no asterisk'],
['m20','judgement','♇ pluto','the call. you already heard it.','ignoring the call and pretending the phone\'s off.','rise. answer it.'],
['m21','the world','♄ saturn','the full circle. it\'s actually done.','so close. finish the last 5%.','completion, then the next spiral']];
const SUIT={w:['wands','🜂','fire','drive, will, the spark'],c:['cups','🜄','water','feelings, love, the tide'],s:['swords','🜁','air','thought, truth, the blade'],p:['pents','🜃','earth','money, body, the ground']};
const RANK=[['ace','the seed. raw and undiluted.','the seed, unplanted. potential rotting on the counter.'],
['2','the choice, the pair, the balance point.','imbalance. someone\'s carrying more.'],
['3','the first proof it\'s working.','a crack in the collaboration.'],
['4','stability. maybe too much of it.','stagnation. the walls got comfortable.'],
['5','the loss, the conflict, the humbling.','the recovery starts here.'],
['6','the exchange. giving, getting, moving on.','the debt nobody named out loud.'],
['7','the strategy. defend it or reassess it.','delusion or overwhelm — pick one.'],
['8','the movement. speed, skill, or escape.','stuck. or moving without direction.'],
['9','almost there. the last hard stretch.','the fear is louder than the facts.'],
['10','the full weight. completion or collapse.','it\'s over. put it down.'],
['page','the student. curious, awkward, learning.','immature. all vibes, no follow-through.'],
['knight','the pursuit. fast, focused, a little reckless.','reckless without the focus.'],
['queen','mastery held inward. felt fully, never leaked.','absorbing everything. drowning in the tide.'],
['king','mastery held outward. authority, direction, the call.','the throne used as a weapon.']];
const DECK=[];
MAJ.forEach((m,i)=>DECK.push({k:m[0],n:m[1],a:'major · '+m[2],up:m[3],rv:m[4],f:m[5],suit:'major'}));
Object.keys(SUIT).forEach(s=>RANK.forEach((r,i)=>{const[nm,gl,el,th]=SUIT[s];
  DECK.push({k:`${s}${String(i+1).padStart(2,'0')}`,n:`${r[0]} of ${nm}`,a:`${gl} ${el} · ${th}`,
    up:r[1],rv:r[2],f:`${el} energy — ${th.split(',')[0]}`,suit:s});}));
const byKey=k=>DECK.find(c=>c.k===k);


/* ══════════ THE ALMANAC — real 2026 sky ══════════ */
const SABBAT=[
 ['2026-08-01','lammas · lughnasadh','❋','first harvest, gratitude, abundance'],
 ['2026-09-22','mabon · autumn equinox','❧','balance, partnership check'],
 ['2026-10-31','samhain','☾','ancestors, the witches\' new year, divination peak'],
 ['2026-12-21','yule · winter solstice','✻','longest night, rebirth of light']];
const FULLMOON=[
 ['2026-07-29','aquarius','6°30′','buck moon','community, detachment, future focus','ankles · circulation · nervous system'],
 ['2026-08-28','pisces','4°53′','sturgeon moon ✧ lunar eclipse','emotional purge, intuition flood','feet · lymph · dissolution'],
 ['2026-09-26','aries','3°37′','harvest moon','independence, emotional release','head · adrenaline · action'],
 ['2026-10-26','taurus','2°45′','hunter\'s moon','stability, sensual grounding','throat · neck · sensuality'],
 ['2026-11-24','gemini','2°20′','beaver super moon','communication overload','lungs · hands · breath'],
 ['2026-12-23','cancer','2°13′','cold super moon','nostalgia, emotional softness','breasts · stomach · womb']];
const NEWMOON=[
 ['2026-07-14','cancer','21°59′','emotional reset, home, softness','deep clean your comfort spaces. reorganize the bedroom, rebuild the altar.'],
 ['2026-08-12','leo','20°01′','✧ solar eclipse · visibility, creativity, identity','reinvent the routine. glam reset. main-character ritual.'],
 ['2026-09-10','virgo','18°25′','discernment, routines, partnership','audit the relationships. tighten the standards.'],
 ['2026-10-10','libra','17°21′','relationship rebalance','romantic reset. beauty and self-worth ritual.'],
 ['2026-11-09','scorpio','16°53′','transformation, emotional rebirth','cord cutting. shadow work. identity rebirth.'],
 ['2026-12-08','sagittarius','16°56′','expansion, manifestation, movement','manifestation list. vision board. plan the big future.']];
const RETRO=[
 ['2026-07-23','☿','mercury stations direct','forward motion returns. send it after.','2026-07-23'],
 ['2026-07-26','♄','saturn rx in aries','survival systems restructuring','2026-12-10'],
 ['2026-07-26','☊','lunar nodes shift into leo/aquarius','destiny reroute toward visibility','2028-02-04'],
 ['2026-09-10','♅','uranus rx in gemini','nervous system + freedom disruption','2027-02-08'],
 ['2026-10-03','♀︎','venus rx in scorpio → libra','love, attachment, value audit','2026-11-13'],
 ['2026-10-24','☿','mercury rx in scorpio','obsession, truth, psychological review','2026-11-13'],
 ['2026-11-04','♡','venus + mercury cazimi in scorpio','heart of the retrograde portal','2026-11-04']];
const VENUS=[
 ['2026-07-31','venus enters virgo','devotional, intentional affection'],
 ['2026-08-25','venus enters libra','partnership, balance, aesthetics'],
 ['2026-09-19','venus enters scorpio','intensity, magnetism, obsession'],
 ['2026-10-13','venus enters sagittarius','freedom, adventure, flirtation'],
 ['2026-11-06','venus enters capricorn','mature, structured love'],
 ['2026-11-30','venus enters aquarius','detached, unconventional attraction'],
 ['2026-12-24','venus enters pisces','dreamy, romantic, mystical']];
const BEAUTY=[
 ['hair · cut','waxing = growth · waning = thickness · full = volume'],
 ['nails · lashes','new moon = renewal · full moon = peak appearance'],
 ['skin treatments','waning = clearing · new = renewal'],
 ['tattoo · piercing','waning = smoother healing'],
 ['glam shoots','venus transits + full moons']];
/* interactions you can log against anyone in orbit */
const INTER=[
 ['◉','intimacy','sex, hookup, the whole thing'],
 ['♡','affection','closeness without the rest'],
 ['➳','contact','they texted. you texted. someone caved.'],
 ['✕','conflict','the fight, the ick, the silence'],
 ['◐','distance','no contact. by choice or theirs.'],
 ['✦','sync','synchronicity, dream, sign, they appeared'],
 ['◈','milestone','something changed for real']];
const PROTECT=['none','condom','birth control','both','plan b','n/a'];
const FEELS=['loved','wanted','used','numb','confused','safe','powerful','regretful','high','present'];

/* ══════════ CONTENT ══════════ */
const RIT=[
 {n:'cut & clear',s:'banishing · candle',v:'for the one who overstayed',t:['release','protection'],ph:['waning crescent','last quarter','waning gibbous'],
  best:'waning moon · saturday ♄ · after dark',need:['black candle','bay leaf','rosemary','black tourmaline'],pair:'the cage door',
  st:['write what you\'re cutting on the bay leaf — the pattern, not the person','dress the black candle base-to-tip with rosemary','burn the leaf in the flame. name the cut out loud, once','let it finish. tourmaline at the door for three nights'],
  sg:'they cross your mind and nothing moves. the urge to check just… stops.'},
 {n:'road opener',s:'clearing · candle',v:'when everything\'s stuck in traffic',t:['money','clarity'],ph:['new moon','waxing crescent'],
  best:'new moon · sunday ☉ · morning',need:['orange candle','cinnamon','bay leaf','clear quartz'],pair:'the clarity cross',
  st:['write the blocked road on the bay leaf — one road per working','dress the orange candle with cinnamon, tip-to-base (drawing in)','burn the leaf. open an actual door or window as it catches','quartz on the sill until the road moves'],
  sg:'callbacks. green lights. the thing that was "pending" suddenly isn\'t.'},
 {n:'honey jar',s:'sweetening · jar',v:'warm the current, don\'t force the tide',t:['love'],ph:['waxing crescent','waxing gibbous','first quarter'],
  best:'waxing moon · friday ♀︎ · venus hour',need:['honey','rose petals','cinnamon','pink candle','rose quartz'],pair:'should i text back',
  st:['petition: their name ×3 crossed with yours, folded toward you','into the jar — honey, petals, a pinch of cinnamon','taste the honey first: "as this is sweet to me…"','pink candle on the lid every friday. quartz beside it.'],
  sg:'softer replies. they reach first. the tone shifts before the facts do.'},
 {n:'return to sender',s:'protection · mirror',v:'not cursing — forwarding the mail',t:['protection'],ph:['new moon','waning crescent'],
  best:'dark moon · mars hour ♂︎',need:['small mirror','black salt','black candle','clear quartz'],pair:'the shadow dive',
  st:['mirror faces outward — toward the door. never at yourself.','ring it in black salt. candle behind it.','whoever it\'s for is not your business. the mail knows the address.','quartz cleanses the room when the candle\'s done'],
  sg:'the weird energy stops finding you. their chaos gets loud somewhere else.'},
 {n:'glamour before the shift',s:'glamour · self',v:'the room notices before you speak',t:['confidence'],ph:['waxing gibbous','full moon'],
  best:'venus hour · moon in libra ♎︎',need:['rose water','gold candle','citrine','mirror'],pair:'past · present · future',
  st:['rose water on the pulse points. name the version of you clocking in.','gold candle beside the mirror while you get ready','one full look — hold your own eyes for ten seconds','citrine in the bag. it works the room with you.'],
  sg:'compliments from strangers. tips up. the light finds you in photos.'},
 {n:'build the inner home',s:'grounding · water',v:'plant the safety before you plant anything else',t:['clarity','love'],ph:['new moon','waxing crescent'],
  best:'new moon · moon hour ☽',need:['white candle','moon water','jasmine'],pair:'where do i feel safe',
  st:['moon water in a bowl at the center. that\'s the hearth.','white candle behind it. jasmine beside.','name three things that make a place feel like yours','write them down. paper under the bowl overnight.'],
  sg:'home starts feeling like a verb. you stop apologizing for taking up your own space.'},
 {n:'full moon truth pull',s:'divination · light',v:'fully lit — you can see everything now',t:['clarity','release'],ph:['full moon','waning gibbous'],
  best:'full moon · anywhere the light lands',need:['clear quartz','white candle','your deck'],pair:'the clarity cross',
  st:['deck in the moonlight for an hour. quartz on top.','one candle. one question. no follow-ups.','pull until it repeats. the repeat IS the answer.','write it before you interpret it'],
  sg:'the answer annoys you slightly. that\'s how you know it\'s real.'}];


/* ══════════ THE WORKINGS — restored from the prototype ══════════ */
const RIT2=[
 {n:'wildfire release',s:'fire magic',v:'burn what won\'t burn itself',t:['release'],
  ph:['full moon','waning gibbous','last quarter','waning crescent'],
  best:'sag moons · aries activations · reinvention eras · post-breakup freedom',
  need:['paper + pen','fire-safe bowl','lighter','carnelian (optional)','somewhere to MOVE after'],pair:'the cage door',
  st:['write everything trapping you, fast and ugly — speed bypasses the editor in your head',
      'read it once out loud — naming it takes its teeth',
      'burn it in the bowl and watch the whole thing — witnessing the destruction IS the spell',
      'the second it\'s ash, physically move: walk, drive, dance — freed energy needs a direction or it turns back into restlessness'],
  sg:'sudden motivation · emotional honesty · craving change · opportunities appearing'},
 {n:'road opener',s:'fire · candle',v:'unstick the stuck',t:['money','clarity'],
  ph:['new moon','waxing crescent'],
  best:'new moon · sunday ☉ · mercury direct · stalled eras',
  need:['orange candle','cinnamon','paper + pen','fire-safe bowl','carnelian'],pair:'the void stare',
  st:['dress the candle with cinnamon — cinnamon is speed; you\'re telling the road to open FAST',
      'write the specific block, not the vibe — roads open one gate at a time',
      'light the candle and burn the paper from its flame — the obstacle feeds the way forward',
      'carry the carnelian 3 days and say yes to the first new door — the spell completes when YOU move'],
  sg:'invitations · green lights · sudden plans · doors where walls were'},
 {n:'thought detox',s:'cleansing',v:'which thoughts are actually mine?',t:['clarity'],
  ph:['waning gibbous','last quarter','waning crescent'],
  best:'mercury rx · gemini/virgo moons · after doomscrolling',
  need:['paper + pen','cold water','a timer'],pair:'the void stare',
  st:['write every thought for 10 minutes without stopping — the loop can\'t survive being written down',
      'go back and mark each one: mine, theirs, or the algorithm\'s',
      'cross out everything that isn\'t yours — out loud, one line at a time',
      'cold water on the wrists, then read only what\'s left'],
  sg:'the loop quiets · fewer imaginary arguments · you can hear yourself again'},
 {n:'memory water release',s:'water magic',v:'clear the smoke off an old memory',t:['release'],
  ph:['waning gibbous','waning crescent'],
  best:'pisces & cancer moons · neptune transits · anniversary weeks',
  need:['bowl of water','salt','a candle','the memory'],pair:'the repeat offender',
  st:['bowl of water in front of you, candle behind it — light through water is the working',
      'speak the memory into the water. all of it. don\'t sanitize.',
      'salt in, and stir until it dissolves — you\'re not erasing it, you\'re changing its charge',
      'pour it out on the earth, not down the drain — give it somewhere to go'],
  sg:'the memory loses its heat · you can tell the story without flinching'},
 {n:'static detox',s:'cleansing',v:'for when everything is loud and flat',t:['clarity','protection'],
  ph:['waning crescent','new moon','last quarter'],
  best:'uranus transits · aquarius moons · overstimulation eras',
  need:['your phone (to banish)','cold water','sound — a bell, a drone, or one long exhale'],pair:'the void stare',
  st:['phone in another room, off — the spell starts when the leash comes off',
      'cold water over hands and face — grounds the charge out through the body',
      '10 minutes of true silence, or one droning sound — give the static nothing to grab',
      'close with one long exhale and re-enter slowly — YOU choose what plugs back in'],
  sg:'quieter thoughts · less buzzing · deeper sleep · less compulsive checking'},
 {n:'mirror initiation',s:'mirror',v:'an ascension presence spell',t:['confidence'],
  ph:['waxing gibbous','full moon','waxing crescent'],
  best:'venus transits · leo activations · glow-up eras · identity shifts',
  need:['mirror','candle','the outfit or face of the version you\'re becoming'],pair:'the magician\'s reclamation',
  st:['dress as her FIRST — the body believes before the mind does',
      'candle lit, lights low, hold your own eyes in the mirror — the discomfort is the threshold. stay.',
      'speak who you are becoming in present tense — "i am", never "i want"',
      'blow the candle out while still holding your gaze — seal it with your own witness'],
  sg:'confidence shifts · discomfort first · people reacting differently'},
 {n:'glamour work',s:'glamour',v:'be seen on purpose',t:['confidence','love'],
  ph:['waxing gibbous','full moon'],
  best:'leo energy · venus transits · content days · shoots · first impressions',
  need:['mirror','an anointing oil or your favorite scent','one piece you feel powerful in'],pair:'the situationship',
  st:['anoint the pulse points, naming what each one broadcasts — scent is a spell people breathe',
      'get ready slowly, with intention — rushing leaks the charge',
      'one sentence to the mirror about what they\'ll see — you\'re scripting the room',
      'walk out without checking again — doubt unravels glamour faster than anything'],
  sg:'compliments · double-takes · doors opening on charm'},
 {n:'identity shedding',s:'shadow work',v:'collapse the version that no longer fits',t:['release'],
  ph:['waning crescent','new moon','last quarter'],
  best:'eclipses · pluto transits · major pivots · reinvention',
  need:['old photos, or the labels written down','fire or scissors','a mirror for after'],pair:'sun return',
  st:['gather the evidence of who you were told to be — see it all in one place',
      'cut or burn each one, naming what it was — graves need headstones',
      'look in the mirror after and say nothing — meet whoever\'s left',
      'be gentle for 48 hours — shedding is raw before it\'s powerful'],
  sg:'emotional rawness · timeline shifts · clarity arriving later'},
 {n:'obsession cleanse',s:'cleansing · shadow work',v:'reclaim your brain',t:['release','clarity'],
  ph:['waning gibbous','last quarter','waning crescent'],
  best:'scorpio energy · venus retrograde · attachment spirals · limerence',
  need:['bath or shower','black candle','your phone (for the deleting part)'],pair:'the repeat offender',
  st:['black candle lit before the water — black absorbs what you\'re dropping',
      'in the water, name the obsession out loud every time it surfaces — count. the number is information.',
      'delete, mute, or archive the top 3 triggers WHILE still wet — strike while the loop is interrupted',
      'let the water drain completely before you step out — watch it take the charge'],
  sg:'less checking · mental quiet · emotional detachment'},
 {n:'cord cutting',s:'shadow work',v:'separate energy, not love',t:['release','protection'],
  ph:['waning gibbous','last quarter','waning crescent','new moon'],
  best:'scorpio moons · venus rx · relationship endings · energy vampires',
  need:['two candles','string or ribbon','scissors, or the flame itself'],pair:'the cage door',
  st:['one candle is you, one is them — tie the cord between them and SEE the connection',
      'speak what the cord carried, good and bad — honest accounting, or it regrows',
      'cut or burn the cord at the CENTER — the middle, not their end. you\'re freeing both.',
      'let both candles burn down apart — separation needs to complete itself'],
  sg:'lighter chest · they "randomly" reach out (ignore it) · your energy returns'},
 {n:'future-self contract',s:'manifestation',v:'sign the deal with who you\'re becoming',t:['money','confidence'],
  ph:['new moon','waxing crescent'],
  best:'capricorn moons · saturn transits · career pivots · rebuilding discipline',
  need:['good paper','a pen','candle','somewhere to keep a contract'],pair:'sun return',
  st:['write the letter FROM her, dated one year out — she describes the life like it\'s normal',
      'extract the 5 behaviors that built it — prophecy becomes checklist',
      'sign it like it\'s legal — your signature is the binding',
      'read it every new moon — contracts need renewal, not framing'],
  sg:'stronger discipline · less self-sabotage · acting on purpose'},
 {n:'structure reset',s:'grounding · manifestation',v:'rebuild the scaffolding',t:['clarity','money'],
  ph:['new moon','waxing crescent','first quarter'],
  best:'capricorn energy · saturn · virgo moons · after chaos eras',
  need:['paper','pen','one candle','your actual calendar'],pair:'what am i not seeing',
  st:['write the ONE keystone habit — ONE. saturn respects focus, not ambition.',
      'put it in the calendar as a real event — unscheduled is unreal',
      'light the candle over the written habit each night it\'s kept — small fires, kept promises',
      'miss a day? relight without the speech — shame is not a building material'],
  sg:'momentum · self-trust returning · the rest organizing itself around the keystone'},
 {n:'protection working',s:'protection',v:'close the door',t:['protection'],
  ph:['waning crescent','new moon','last quarter'],
  best:'saturn transits · scorpio season · heavy transit windows · before hostile rooms',
  need:['black candle','salt','your name written'],pair:'the full truth',
  st:['salt circle around your written name — the line is the law',
      'black candle inside the circle — it eats what\'s aimed at you',
      'name exactly what you\'re shielding from — vague shields leak',
      'leave the salt 3 days, then sweep it OUT the door — take the residue with it'],
  sg:'drama missing you · messy people finding you "busy" · a quieter field'},
 {n:'veil cleansing',s:'water magic',v:'clear the channel',t:['clarity','protection'],
  ph:['waning gibbous','waning crescent','full moon'],
  best:'pisces moons · neptune transits · after crowds · psychic residue',
  need:['bath or shower','salt','candle','quiet'],pair:'the void stare',
  st:['salt in the water, candle lit — salt strips what isn\'t yours',
      'submerge, or stand under fully — let it run over the crown. that\'s where it collects.',
      'ask "what\'s mine?" and keep only that — everything else drains',
      'wrap in something soft after. no screens for an hour — clean channels stay clean in quiet'],
  sg:'clearer intuition · lighter mood · dreams sharpening'},
 {n:'dream incubation',s:'water magic',v:'ask the question before you sleep',t:['clarity'],
  ph:['waning crescent','new moon','waxing crescent','full moon'],
  best:'pisces moons · eclipses · neptune transits · veil-thin nights',
  need:['glass of water by the bed','journal + pen in reach','one written question'],pair:'what am i not seeing',
  st:['write ONE question — the dream answers what\'s asked, not what\'s vague',
      'water by the bed — it holds the channel open overnight',
      'read the question last thing, lights out immediately — no scroll after. the feed eats the signal.',
      'write ANYTHING on waking, before moving — dreams evaporate at the speed of your first step'],
  sg:'vivid dreams · recurring symbols · waking up with answers'},
 {n:'chaos manifestation',s:'manifestation',v:'let the sigil charge on chaos energy',t:['money','confidence'],
  ph:['first quarter','waxing gibbous','new moon'],
  best:'uranus transits · sag moons · loud moments · reinvention eras',
  need:['loud music','pen + paper','your body','20 minutes'],pair:'the magician\'s reclamation',
  st:['music on, write wants for 5 minutes at full speed — chaos hates deliberation. outrun it.',
      'circle the THREE that scare you — fear is the compass here',
      'do one physical thing toward the scariest within the hour — chaos rewards motion, punishes hesitation',
      'leave the list where you\'ll see it mid-storm — aim survives if it\'s visible'],
  sg:'weird synchronicities · fast opportunities · sudden invitations'},
 {n:'mirror work',s:'shadow work',v:'meet the one who looks like you',t:['confidence','love'],
  ph:['full moon','waxing gibbous','first quarter'],
  best:'libra energy · venus days · self-image repair',
  need:['mirror','candle','one true sentence'],pair:'scorpio shadow dive',
  st:['candle beside the mirror, lights low — soft light lowers the guard',
      'hold your own eyes 60 seconds. no fixing. just witness.',
      'say the one kind claim out loud, from the heart — even if you don\'t believe it yet. the body learns it.',
      'blow out the candle and leave the room — don\'t linger and undo it'],
  sg:'steadier self-image · easier eye contact everywhere else'},
 {n:'floor wash',s:'cleansing · water magic',v:'reset the whole house',t:['protection','clarity'],
  ph:['waning gibbous','last quarter','waning crescent','new moon'],
  best:'virgo moons · new cycles · after guests · after bad news in the house',
  need:['bucket','water','salt or florida water + herbs','a rag or mop'],pair:'where do i feel safe',
  st:['clean normally FIRST — magic doesn\'t stick to clutter',
      'add salt/herbs to fresh water, naming what leaves — the water needs a job description',
      'wash from the BACK of the home toward the front door — you\'re herding it out',
      'pour the dirty water outside, away from the house — it doesn\'t go down your own drain'],
  sg:'the house feels bigger · sleep improves · people are calmer inside it'},
 {n:'fire release',s:'fire magic',v:'when you need it gone yesterday',t:['release'],
  ph:['full moon','waning gibbous','last quarter'],
  best:'aries energy · full moons · endings · closure',
  need:['paper + pen','fire-safe bowl','lighter'],pair:'the cage door',
  st:['write what is OVER in past tense — the tense IS the spell',
      'read it once, flat, like a record — no eulogy. just fact.',
      'burn it fully — partial burns are partial endings',
      'scatter or trash the ash outside — dead things don\'t live indoors'],
  sg:'closure feeling physical · the urge to look back fading'},
 {n:'prosperity bowl',s:'money magic',v:'build money that stays',t:['money'],
  ph:['new moon','waxing crescent','waxing gibbous'],
  best:'taurus moons · new moons · launches · money work',
  need:['a bowl','coins or bills','cinnamon','bay leaf with the goal written','something gold'],pair:'future-self contract',
  st:['write the SPECIFIC amount or outcome on the bay leaf — money answers precise invitations',
      'layer coins, cinnamon, gold in the bowl — you\'re staging abundance so more recognizes the address',
      'feed it weekly — a coin, a fresh leaf. bowls die when ignored. consistency IS the offering.',
      'keep it where you handle money or work — it works where the work happens'],
  sg:'unexpected income · clients appearing · money anxiety quieting'}];
RIT.push(...RIT2);
const RTAG=['all','release','love','protection','confidence','money','clarity'];

const TAGS=['all','release','love','protection','confidence','money','clarity'];
let tagF='all';
const PANTRY=[
 {c:'❧ herbs',i:[
  {n:'bay leaf',e:'❧',w:'the messenger — write it, burn it, send it',u:'wishes · banishing · victory',o:'☉ sun · fire',r:['cut & clear','road opener'],cd:['m01']},
  {n:'rosemary',e:'❧',w:'cleansing + memory. the when-in-doubt herb.',u:'protection · clarity',o:'☉ sun · fire',r:['cut & clear'],cd:['m08']},
  {n:'cinnamon',e:'❧',w:'heat and speed. sweetens and accelerates.',u:'money · speed · sweetening',o:'☉ sun · fire',r:['honey jar','road opener'],cd:['p01']},
  {n:'rose petals',e:'✿',w:'love drawn soft. never forced.',u:'love · self-tenderness',o:'♀︎ venus · water',r:['honey jar'],cd:['c02']},
  {n:'jasmine',e:'✿',w:'moon medicine — dreams, intuition, night blooms',u:'intuition · peace',o:'☽ moon · water',r:['build the inner home'],cd:['m02']}]},
 {c:'◈ crystals',i:[
  {n:'black tourmaline',e:'◈',w:'the bouncer. absorbs what\'s aimed at you.',u:'protection · grounding',o:'♄ saturn · earth',r:['cut & clear'],cd:['m16']},
  {n:'rose quartz',e:'◈',w:'the heart on low heat. self-love first, always.',u:'love · healing',o:'♀︎ venus · water',r:['honey jar'],cd:['c13']},
  {n:'clear quartz',e:'◈',w:'the amplifier. boosts whatever sits beside it.',u:'clarity · amplification',o:'☽ moon',r:['return to sender','road opener','full moon truth pull'],cd:['m02']},
  {n:'citrine',e:'◈',w:'money and magnetism. doesn\'t hold negativity.',u:'money · confidence',o:'☉ sun · fire',r:['glamour before the shift'],cd:['m17']}]},
 {c:'✧ candles & colors',i:[
  {n:'black candle',e:'✧',w:'banish · protect · absorb. the full stop.',u:'release · protection',o:'♄ saturn',r:['cut & clear','return to sender'],cd:['m13']},
  {n:'white candle',e:'✧',w:'the blank one. any intention, moon-coded.',u:'cleansing · beginnings',o:'☽ moon',r:['build the inner home','full moon truth pull'],cd:['m00']},
  {n:'pink candle',e:'✧',w:'soft love. sweetening. self-tenderness.',u:'love',o:'♀︎ venus',r:['honey jar'],cd:['c02']},
  {n:'gold candle',e:'✧',w:'solar success. visibility. the win.',u:'confidence · glamour',o:'☉ sun',r:['glamour before the shift'],cd:['m19']},
  {n:'orange candle',e:'✧',w:'roads open. opportunity moves.',u:'momentum',o:'☿ mercury',r:['road opener'],cd:['m10']}]},
 {c:'☽ waters & oils',i:[
  {n:'moon water',e:'☽',w:'charged under the full moon. the base of everything.',u:'intuition · cleansing',o:'☽ moon · water',r:['build the inner home'],cd:['m02']},
  {n:'rose water',e:'✿',w:'glamour in a bottle. wear it like intent.',u:'glamour · love',o:'♀︎ venus',r:['glamour before the shift'],cd:['m03']},
  {n:'black salt',e:'◈',w:'the line they don\'t cross.',u:'protection · banishing',o:'♄ saturn · earth',r:['return to sender'],cd:['m15']},
  {n:'honey',e:'❧',w:'sweeten the current. slow, sticky, undeniable.',u:'love · sweetening',o:'♀︎ venus',r:['honey jar'],cd:['c02']}]}];
const SPR={yours:[
 {n:'should i text him',sub:'the 3am spiral, answered',lay:'row3',
  best:'mercury retrograde · venus transits · 3am spirals',
  p:['what happens if you send it','what happens if you don\'t','what you\'re actually seeking'],
  pm:['the real consequence, not the fantasy one','the cost of silence — sometimes it\'s zero','the need under the need. it\'s rarely him.']},
 {n:'the cage door',sub:'the door was never locked',lay:'grid4',
  best:'saturn transits · pluto · feeling trapped',
  p:['the cage','the door','the key','the outside'],
  pm:['what\'s actually holding you','what\'s already open and you haven\'t walked through','what you\'re refusing to use','what\'s waiting once you do']},
 {n:'the full truth',sub:'what they say vs what they mean',lay:'cross5',
  best:'scorpio moons · mercury rx · pluto',
  p:['what they say','what they mean','what they hide','what they want','what they\'ll do'],
  pm:['the surface script','the translation','the part they\'d never admit','the actual desire driving it','and here\'s the forecast']},
 {n:'reality check',sub:'for when the fog is doing the talking',lay:'grid4',
  best:'neptune transits · pisces moons · delusion',
  p:['the fantasy','the truth','why you\'re attached','what to do'],
  pm:['the story you built','the receipts','the wound it\'s feeding','one move. not five.']},
 {n:'the situationship',sub:'name it or leave it',lay:'row5',
  best:'venus retrograde · libra & scorpio energy',
  p:['where you stand','where they stand','what\'s unsaid','what\'s coming','the verdict'],
  pm:['your actual position, not your hopes','theirs. brace.','the thing neither of you will say first','the direction it\'s already moving','yes, no, or run']},
 {n:'scorpio shadow dive',sub:'go all the way down',lay:'row5',
  best:'scorpio season · pluto · full moons',
  p:['what you\'re hiding','what you\'re hiding FROM','what it\'s costing','what it protects','if you face it'],
  pm:['the secret, obviously','the thing the secret is a shield for','the interest rate on the avoidance','because it IS protecting something','who you become on the other side']},
 {n:'the magician\'s reclamation',sub:'take it back',lay:'grid4',
  best:'mars transits · leo & aries energy',
  p:['the power you gave away','who has it','how to take it back','what you become'],
  pm:['the exact thing you handed over','sometimes it isn\'t a person','the actual mechanism, not the vibe','the version of you holding it again']},
 {n:'the void stare',sub:'for the void of course moon',lay:'row3',
  best:'void of course moon · mercury rx',
  p:['what\'s actually there','what your brain adds','what to do with it'],
  pm:['the facts. flat.','the fiction layered on top','usually: nothing. wait it out.']},
 {n:'what am i not seeing',sub:'the blind spot spread',lay:'grid4',
  best:'eclipses · uranus · when everyone else knows',
  p:['the blind spot','why you can\'t see it','who benefits','what it reveals'],
  pm:['the thing in plain sight','the reason your eyes slide off it','someone is. it might be you.','what it says about the pattern']},
 {n:'the repeat offender',sub:'the pattern, indicted',lay:'row5',
  best:'saturn · pluto · when it happens AGAIN',
  p:['the pattern','the origin','the payoff','the price','the exit'],
  pm:['what keeps happening','where you learned it','yes, you\'re getting something from it','and here\'s the bill','the actual way out']},
 {n:'sun return',sub:'your real new year',lay:'row5',
  best:'your solar return · birthday week',
  p:['the year that ended','the version of you dying','the new mandate','the obstacle','the gift'],
  pm:['what it actually was','let her go with honors','the assignment for this trip around','what will try to stop it','what you get if you don\'t flinch']},
 {n:'where do i feel safe',sub:'build the inner home',lay:'grid4',
  best:'new moon · cancer & taurus moons',
  p:['the walls','the door','the hearth','the key'],
  pm:['what you built to feel protected','how people get in — and should they','what actually warms you','what you\'re holding but not using']}],
classic:[
 {n:'the clarity cross',sub:'when the brain won\'t shut up',lay:'cross5',
  best:'mercury rx · full moons · overthinking',
  p:['heart of it','crossing','root','crown','next'],
  pm:['the actual situation','what\'s cutting across it','where it grew from','what you know but won\'t say','the next real step']},
 {n:'past · present · future',sub:'the classic for a reason',lay:'row3',
  best:'anytime · start here',
  p:['past','present','future'],
  pm:['what brought you here','where you actually are','where this is headed if nothing changes']},
 {n:'the celtic cross',sub:'the whole situation, no mercy',lay:'celtic',
  best:'big questions · turning points',
  p:['heart','cross','root','past','crown','future','self','environment','hopes/fears','outcome'],
  pm:['the core','what opposes it','the foundation','what\'s leaving','what you aspire to','what\'s arriving','how you\'re showing up','the room around you','what you want AND fear','where it lands']}]};
const TRICKS=[
 ['✦ jumper cards','a card that flies out mid-shuffle is the deck yelling. read it first — loudest message in the room.'],
 ['◌ peek the bottom','flip the deck before laying out. the bottom card is the undercurrent running under the whole reading.'],
 ['✧ the clarifier','card being cryptic? pull one more, lay it on top. you\'re asking the deck to speak slower.'],
 ['❦ the closer card','end with "what do i need to know that i didn\'t ask?" and pull one. the unsolicited truth lives here.'],
 ['◑ stacking & repeats','same number or suit repeating = the deck amplifying. a card back three times already answered you.'],
 ['♞ eye-line reading','where the figures face is where the energy flows. toward the next card = moving in. away = avoidance.'],
 ['✶ numerology shortcut','add the numbers, reduce to one digit, match the major. adds to 16? tower energy over the whole thing.'],
 ['⚹ cut into three','shuffle, cut three piles with your non-dominant hand. past/present/future or mind/body/spirit. restack as pulled.'],
 ['☽ moon-charge the deck','leave it under a full moon to reset — especially after a heavy reading or when it feels muddy.'],
 ['◉ suit majority','mostly one suit = the arena. cups emotional · wands passion · swords mental · pents material.'],
 ['✺ majors vs minors','lots of majors = fate, out of your hands. lots of minors = everyday, within your control.'],
 ['❧ cards that touch','overlapping or leaning cards are in conversation. read them as a pair.'],
 ['⟳ read it like a sentence','narrate the line left to right as one scene, not isolated flashcards.'],
 ['◀ what they walk away from','whatever sits behind a leaving figure is what to release.'],
 ['⌛ timing by suit','wands days/spring · cups weeks/summer · swords fall + sudden · pents months/winter/slow. a court card means a person brings the timing.'],
 ['✿ color flooding','a spread washed in one color is a mood. yellow mental · blue emotional · red passion and action.'],
 ['✕ don\'t ask twice','re-asking because you hated the answer gets you garbage or a harder repeat. ask once, sit with it.'],
 ['✦ tarot × transit','pull a card for a transit hitting your chart. the two systems talk to each other — that\'s the whole app.']];
/* ── court cards: sign math the deck already knows ── */
const COURT_RANK={cardinal:'queen',fixed:'king',mutable:'knight'};
const SIGN_MODE={aries:'cardinal',cancer:'cardinal',libra:'cardinal',capricorn:'cardinal',
 taurus:'fixed',leo:'fixed',scorpio:'fixed',aquarius:'fixed',
 gemini:'mutable',virgo:'mutable',sagittarius:'mutable',pisces:'mutable'};
const SIGN_SUIT={aries:'wands',leo:'wands',sagittarius:'wands',cancer:'cups',scorpio:'cups',pisces:'cups',
 gemini:'swords',libra:'swords',aquarius:'swords',taurus:'pentacles',virgo:'pentacles',capricorn:'pentacles'};
const signCourt=s=>s?`${COURT_RANK[SIGN_MODE[s]]} of ${SIGN_SUIT[s]}`:null;
/* my big three, computed from the chart — never hardcoded */
function meBig3(){
  if(!S.me.date)return null;
  const [yy,mo,dd]=S.me.date.split('-').map(Number);
  const [hh,mi]=(S.me.time||'12:00').split(':').map(Number);
  const d=new Date(yy,mo-1,dd,hh||12,mi||0);
  const A=cloudAngles()||angles(S.me.date,S.me.time,S.me.lat,S.me.lon,meTz());
  return {sun:SIGNS[signOf(sunLon(d))],moon:SIGNS[signOf(moonLon(d))],rising:A?SIGNS[Math.floor(A.asc/30)]:null};
}
function sigHTML(){
  const b3=meBig3();
  if(!b3)return `<div class="card" style="font-size:13px;color:var(--dust)">cast your chart and your significators appear here — the courts that are literally you.</div>`;
  const rows=[['☉','sun',b3.sun],['☽','moon',b3.moon],['↑','rising',b3.rising]].filter(r=>r[2]);
  return `<div class="card">${rows.map(([g,w,s])=>
    `<div class="pinr"><span class="e zg" style="flex:0 0 auto">${g}</span><span class="s">${w} in ${s} = <b>${signCourt(s)}</b><div style="font-weight:400;color:var(--dust);font-size:12px;margin-top:2px">${w==='sun'?'who you are in the spread':w==='moon'?'the engine underneath':'how you enter the room'}</div></span></div>`).join('')}
    <div style="font-size:11.5px;color:var(--faint);margin-top:8px;line-height:1.55">knights = mutable · queens = cardinal · kings = fixed · suit = element. pages carry no sign — they're the raw element, a message, or someone younger wearing it.</div></div>`;
}
const COURT_REF=[['wands · fire','knight = sagittarius · queen = aries · king = leo','passion, drive, sex, ambition'],
 ['cups · water','knight = pisces · queen = cancer · king = scorpio','emotion, love, intuition'],
 ['swords · air','knight = gemini · queen = libra · king = aquarius','mind, communication, conflict, truth'],
 ['pentacles · earth','knight = virgo · queen = capricorn · king = taurus','money, body, stability, the slow build']];
const KNIGHTS=[['wands','fastest, recklessly passionate, burns out quick.'],
 ['swords','full speed, head down, obsessive, doesn\'t think it through.'],
 ['cups','doesn\'t gallop — approaches with the cup out. courtship, a real offer of feeling.'],
 ['pentacles','the only knight whose horse stands still. if he\'s moving toward something, it\'s huge — slow, deliberate, and it stays.']];
const LOCATE=[['the magician','the power surfacing','the source it comes from'],
 ['the lovers','the surface of the connection','the real choice underneath'],
 ['the tower','what\'s visibly cracking','the shaky foundation it was built on'],
 ['the devil','the chain you can see','what\'s actually feeding the attachment'],
 ['the moon','the fear you\'re aware of','what\'s buried driving it'],
 ['three of swords','the fresh cut','the older wound it\'s pressing on'],
 ['the star','the hope you\'re holding','the faith keeping you steady'],
 ['wheel of fortune','the cycle you know is turning','the karmic root spinning it']];

/* ══════════ SKY VIEW ══════════ */
function renderSky(){
  const d=new Date(); const p=phase(d),pn=phaseName(p),ml=moonLon(d),si=signOf(ml),sl=sunLon(d),ssi=signOf(sl);
  const r=dailyRead(d), vd=voidWindow(d), ill=Math.round((1-Math.cos(2*Math.PI*p))/2*100);
  document.getElementById('skyDate').innerHTML=fmtL(d);

  /* moon hero + 7-day phase ring */
  let ring='';
  for(let i=-3;i<=3;i++){const dd=new Date(d.getTime()+i*86400000);
    ring+=`<button class="${i===0?'on':''}" onclick="S.sel='${key(dd)}';S.cursor=new Date(${dd.getFullYear()},${dd.getMonth()},1);nav('cal')">
      ${moonSVG(phase(dd),i===0?30:24)}<div class="dd">${i===0?'today':dd.toLocaleDateString('en-us',{weekday:'short'}).toLowerCase()}</div></button>`;}

  document.getElementById('skyBody').innerHTML=
   `<div class="mhero"><div class="halo"></div>
      ${moonSVG(p,132)}
      <div class="ph">${pn}</div>
      <div class="sg">in ${SIGNS[si]} ${GLY[si]} · ${degIn(ml).toFixed(0)}°</div>
      <div class="il">${ill}% illuminated</div>
      ${vd.active?`<div class="vd">⊘ void · ${vd.hrs}h — don't send it</div>`:''}
      <div class="mring">${ring}</div>
    </div>
    <button class="read" onclick="openRead()" style="width:100%;text-align:left">
      <div class="rl">✦ today's read <span style="margin-left:auto;color:var(--faint);font-weight:400">tap for the full sky ›</span></div>
      <p>${r.l1}</p><p>${r.l2}</p>
      <div class="mv"><b>today's move</b>${r.move}</div>
    </button>
    <div class="lab">the sky, expanded</div>
    <div class="card" id="skyEx"></div>
    ${S.me.date?`<div class="lab">your chart, right now <button class="lk" onclick="nav('natal')">the wheel ›</button></div><div class="pnl" id="skyNatal"></div>`:''}
    <div class="lab">the calendar <button class="lk" onclick="nav('cal')">full view ›</button></div>
    <div class="card" style="padding:12px"><div class="dow"><span>s</span><span>m</span><span>t</span><span>w</span><span>t</span><span>f</span><span>s</span></div>
      <div class="grid" id="homeGrid"></div></div>`;
  renderSkyEx(d,p,pn,si,ssi,ml,sl,vd,ill);
  if(S.me.date)renderSkyNatal(d);
  homeGrid();
  const ups=upcoming(d,4);
  document.getElementById('skyUp').innerHTML=ups.map(e=>evRow(e)).join('')||'<div class="card" style="color:var(--dust);font-size:13px">quiet stretch ✧</div>';
  const today=S.entries.filter(e=>e.date===key(d));
  const rit=RIT.find(x=>x.ph.includes(pn));
  const cs=cycleSpell(d);
  document.getElementById('skyDay').innerHTML=
   `${cs?`<div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">◉</span>
      <span><span class="a">your body · ${cs.phase}</span><div class="b">the cycle and the moon, cross-referenced</div></span><span class="c">›</span></button>
      <div class="exb"><p>you're in <b>${cs.phase}</b> while the moon is <b>${cs.moon}</b>.</p>
        <p>that stacks. the working that fits both right now is <b>${cs.ritual.n}</b> — ${cs.ritual.v}.</p>
        <div class="mini"><button class="btn sm" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${cs.ritual.n}'),90)">open it ✧</button></div></div></div>`:''}
    <div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">❦</span>
      <span><span class="a">journal prompt</span><div class="b">${PROMPTS[pn]}</div></span><span class="c">›</span></button>
      <div class="exb"><p><b>${pn}</b> asks a specific question. a full moon would ask a different one.</p>
        <div class="mini"><button class="btn sm" onclick="openEntry()">write it ❦</button></div></div></div>
    <div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">✧</span>
      <span><span class="a">matched working · ${rit.n}</span><div class="b">${rit.v}</div></span><span class="c">›</span></button>
      <div class="exb"><p><b>why now:</b> it wants ${rit.ph.join(' or ')}. that's where the moon's standing.</p>
        <p><b>you'll need:</b> ${rit.need.join(' · ')}</p>
        <div class="mini"><button class="btn sm" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),90)">open it ✧</button>
        <button class="btn g sm" onclick="logRitual('${rit.n}')">log it</button></div></div></div>
    <div class="ex"><button class="exh" onclick="openEntry()"><span class="g">＋</span>
      <span><span class="a" style="color:var(--deep)">add to today</span><div class="b">${today.length} ${today.length===1?'entry':'entries'}</div></span><span class="c">›</span></button></div>`;
}
function homeGrid(){
  const c=new Date(), first=new Date(c.getFullYear(),c.getMonth(),1), pad=first.getDay(),
        dim=new Date(c.getFullYear(),c.getMonth()+1,0).getDate(), tk=key(c);
  let g='';for(let i=0;i<pad;i++)g+='<div class="cell pad"></div>';
  for(let dd=1;dd<=dim;dd++){
    const d=new Date(c.getFullYear(),c.getMonth(),dd),k=key(d),ev=evForDate(d);
    const cols=[...new Set(ev.map(e=>(layMeta(e.lay)||{}).c))].filter(Boolean).slice(0,3);
    const p=phase(d),sm=p<.02||p>.98||Math.abs(p-.5)<.02;
    g+=`<button class="cell${k===tk?' tod':''}" onclick="S.sel='${k}';nav('cal')">
      ${sm?`<span class="mm">${moonSVG(p,12)}</span>`:''}
      <span class="dn">${dd}</span>
      <span class="pips">${cols.map(x=>`<span class="pip" style="background:${x}"></span>`).join('')}</span></button>`;}
  document.getElementById('homeGrid').innerHTML=g;
}
/* today's read → the full sky, on the calendar */
function openRead(){
  S.sel=key(new Date());
  S.cursor=new Date();
  nav('cal');
  setTimeout(()=>document.getElementById('dSelLab').scrollIntoView({behavior:'smooth',block:'start'}),120);
}

/* the literal sky — dome, horizon, moon in position, sun below/above */
function skyDome(p,si,ssi,d){
  const W=400,H=170, hr=d.getHours()+d.getMinutes()/60;
  const night=hr<6.5||hr>19.5;
  /* moon arcs across the dome by phase-age; sun by hour */
  const mx=40+(p*(W-80)), my=H-42-Math.sin(p*Math.PI)*68;
  const sx=(hr/24)*W, sy=H-30-Math.sin(Math.max(0,(hr-6)/12)*Math.PI)*72;
  let st='';
  for(let i=0;i<44;i++){const x=Math.random()*W,y=Math.random()*(H-34);
    st+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(Math.random()*1.1+.3).toFixed(1)}" fill="#fff" opacity="${(Math.random()*.55+.15).toFixed(2)}"/>`;}
  const r=17,k=Math.cos(2*Math.PI*p),rx=Math.abs(k)*r,wax=p<.5;
  const lit=`<path d="M ${mx} ${my-r} A ${r} ${r} 0 0 ${wax?1:0} ${mx} ${my+r} A ${rx} ${r} 0 0 ${(wax?(k>0?0:1):(k>0?1:0))} ${mx} ${my-r} Z" fill="#F6EFD8"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
    <g opacity="${night?1:.35}">${st}</g>
    ${hr>5.5&&hr<20.5?`<circle cx="${sx}" cy="${sy}" r="13" fill="var(--accent)" opacity=".9"/>
      <circle cx="${sx}" cy="${sy}" r="21" fill="var(--accent)" opacity=".16"/>`:''}
    <circle cx="${mx}" cy="${my}" r="${r}" fill="rgba(255,255,255,.10)"/>
    ${lit}
    <circle cx="${mx}" cy="${my}" r="${r+9}" fill="#F6EFD8" opacity=".10"/>
    <text x="${mx}" y="${my+r+15}" text-anchor="middle" font-size="11" fill="#F6EFD8" opacity=".8" class="zg">${GLY[si]}</text>
    <path d="M0 ${H-26} Q ${W/2} ${H-40} ${W} ${H-26} L ${W} ${H} L 0 ${H} Z" fill="var(--void)" opacity=".55"/>
    <path d="M0 ${H-26} Q ${W/2} ${H-40} ${W} ${H-26}" stroke="var(--line)" fill="none"/>
  </svg>`;
}

function renderSkyEx(d,p,pn,si,ssi,ml,sl,vd,ill){
  const nx=nextPhase(d);
  document.getElementById('skyEx').innerHTML=
   `<div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">☽</span>
      <span><span class="a">the moon · ${degIn(ml).toFixed(1)}° ${SIGNS[si]}</span><div class="b">${pn} · ${ill}% lit</div></span><span class="c">›</span></button>
      <div class="exb"><p><b>${pn}</b> — ${MOOD[pn]}</p>
        <p>the moon's at <b>${degIn(ml).toFixed(1)}°</b> of ${SIGNS[si]}, moving about 13° a day. it leaves this sign in <b>${((30-degIn(ml))/13.176*24).toFixed(1)}h</b>.</p>
        <p>in ${SIGNS[si]} the mood is: ${SIGN_READ[SIGNS[si]][0]}. ${SIGN_READ[SIGNS[si]][1]}</p>
        <p><b>next phase:</b> ${nx.n} on ${fmt(nx.d)}</p></div></div>
    <div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">☉</span>
      <span><span class="a">the sun · ${degIn(sl).toFixed(1)}° ${SIGNS[ssi]}</span><div class="b">the background hum under everything</div></span><span class="c">›</span></button>
      <div class="exb"><p>the sun sets the season. you're in <b>${SIGNS[ssi]} ${GLY[ssi]}</b> — ${SIGN_READ[SIGNS[ssi]][0]}.</p>
        <p>it moves ~1° a day, so this stays the theme for another <b>${Math.round((30-degIn(sl))/0.9856)} days</b>.</p></div></div>
    <div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">⊘</span>
      <span><span class="a">void of course</span><div class="b">${vd.active?'active — '+vd.hrs+'h out':'clear · '+vd.hrs+'h until it shifts'}</div></span><span class="c">›</span></button>
      <div class="exb"><p>the moon goes <b>void</b> after its last major aspect and before it enters the next sign. nothing started in that window really takes root.</p>
        <p>${vd.active?'the moon\'s void now. draft it, don\'t send it. buy nothing you can\'t return.':'you\'re clear. it shifts into '+SIGNS[(si+1)%12]+' in about '+vd.hrs+'h.'}</p></div></div>
    <div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">◑</span>
      <span><span class="a">the lunar cycle</span><div class="b">day ${Math.round(p*29.5)} of 29.5</div></span><span class="c">›</span></button>
      <div class="exb"><p>you're <b>${Math.round(p*100)}%</b> through this lunation. it started at the new moon and it ends at the next one — that's your actual month, not the calendar's.</p>
        <p><b>waxing</b> = build, add, draw in. <b>waning</b> = cut, release, clear. you're <b>${p<.5?'waxing':'waning'}</b>.</p>
        <div class="mini"><button class="btn sm" onclick="nav('cal')">see the whole cycle ✧</button></div></div></div>`;
}
function nextPhase(d){
  const T=[[0,'new moon'],[.25,'first quarter'],[.5,'full moon'],[.75,'last quarter']];
  const p=phase(d);
  for(const[t,n]of T.concat([[1,'new moon']])){
    if(t>p){const days=(t-p)*SYN;const nd=new Date(d.getTime()+days*86400000);return{n,d:nd};}
  }
  return{n:'new moon',d:new Date(d.getTime()+SYN*86400000)};
}
function renderSkyNatal(d){
  const nb=parse(S.me.date), nsun=signOf(sunLon(nb)), nmoon=signOf(moonLon(nb));
  const tsun=signOf(sunLon(d)), tmoon=signOf(moonLon(d));
  const asp=(a,b)=>{const x=Math.abs(a-b)%12;const y=Math.min(x,12-x);
    return y===0?['conjunct','sitting right on it — you cannot look away from this']:y===6?['opposite','maximum tension. something has to give.']:
    y===3?['square','friction. the useful kind, if you actually move.']:y===4?['trine','it flows. take the easy yes.']:y===2?['sextile','a door. you have to open it.']:null;};
  const rows=[];
  const a1=asp(tmoon,nsun), a2=asp(tmoon,nmoon), a3=asp(tsun,nsun);
  if(a1)rows.push(['☽','moon '+a1[0]+' your natal sun',a1[1],`transiting moon in ${SIGNS[tmoon]} vs your sun in ${SIGNS[nsun]}`]);
  if(a2)rows.push(['☾','moon '+a2[0]+' your natal moon',a2[1],`your emotional weather, personally. ${a2[0]==='conjunct'?'this is your lunar return — the monthly reboot.':''}`]);
  if(a3)rows.push(['☉','sun '+a3[0]+' your natal sun',a3[1],`transiting sun in ${SIGNS[tsun]} vs your sun in ${SIGNS[nsun]}. ${a3[0]==='conjunct'?'this is your solar return season — happy birthday.':''}`]);
  document.getElementById('skyNatal').innerHTML= rows.length? rows.map(r=>
   `<div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">${r[0]}</span>
      <span><span class="a">${r[1]}</span><div class="b">${r[2]}</div></span><span class="c">›</span></button>
      <div class="exb"><p>${r[3]}</p>
        <div class="mini"><button class="btn sm" onclick="nav('natal')">see my wheel ☉</button></div></div></div>`).join('')
   : `<div class="ex"><button class="exh" onclick="nav('natal')"><span class="g">☉</span>
       <span><span class="a">no direct hits today</span><div class="b">the sky isn't touching your placements — a quiet one</div></span><span class="c">›</span></button></div>`;
}

const PROMPTS={'new moon':'what are you actually planting — not what sounds good out loud?','waxing crescent':'what would you protect if someone tried to talk you out of it?',
 'first quarter':'where\'s the resistance, and is it a wall or a door?','waxing gibbous':'what needs editing, not abandoning?','full moon':'what can you see now that you couldn\'t two weeks ago?',
 'waning gibbous':'what truth are you circling but not saying?','last quarter':'what have you outgrown but kept out of habit?','waning crescent':'what are you still feeding after it already ended?'};
const prompt=(pn,s)=>PROMPTS[pn];

/* ══════════ EVENTS ENGINE ══════════ */
const GE_LAY={lunation:'lunation',station:'retro',sabbat:'sabbat',eclipse:'lunation',void_moon:'void',ingress:'ingress'};
const GE_GL={new_moon:'●',full_moon:'○',first_quarter:'◐',last_quarter:'◑',moon_void:'◌'};
/* supabase rows join the day — client arrays keep priority, cloud fills the gaps */
function mergeCloud(out,k){
  const ce=(S.cloudEvents||{})[k]; if(!ce)return out;
  ce.forEach(e=>{
    const lay=GE_LAY[e.event_category]||'lunation';
    if(!LON[lay])return;
    const dupe=out.some(o=>o.lay===lay&&(
      (e.event_type_key==='new_moon'&&o.id.startsWith('nm-'))||
      (e.event_type_key==='full_moon'&&o.id.startsWith('fm-'))||
      (e.event_category==='void_moon'&&o.lay==='void')||
      (e.event_category==='station'&&o.lay==='retro')||
      (e.event_category==='sabbat')));
    if(dupe)return;
    out.push({id:'ge-'+e.event_type_key+'-'+k,lay,date:k,
      gl:GE_GL[e.event_type_key]||(e.event_category==='eclipse'?'✧':e.event_category==='ingress'?'⇢':'✦'),
      t:esc((e.title||e.event_type_key.replace(/_/g,' ')).toLowerCase()),
      s:esc((e.description||'').toLowerCase()),
      big:e.event_category==='eclipse'?1:0});
  });
  return out;
}
function evForDate(d){
  const out=[];const k=key(d),p=phase(d),pn=phaseName(p),ml=moonLon(d),si=signOf(ml);
  const pv=phase(new Date(d.getTime()-86400000));
  /* ── the almanac (her real calendar) */
  if(LON.lunation){
    NEWMOON.filter(x=>x[0]===k).forEach(x=>out.push({id:'nm-'+k,lay:'lunation',gl:'●',
      t:`new moon in ${x[1]}`,s:`${x[2]} · ${x[3]}`,date:k,big:x[3].includes('eclipse')?1:0,alm:{kind:'newmoon',d:x}}));
    FULLMOON.filter(x=>x[0]===k).forEach(x=>out.push({id:'fm-'+k,lay:'lunation',gl:'○',
      t:x[3],s:`${x[1]} ${x[2]} · ${x[4]}`,date:k,big:x[3].includes('eclipse')?1:0,alm:{kind:'fullmoon',d:x}}));
  }
  if(LON.sabbat)SABBAT.filter(x=>x[0]===k).forEach(x=>out.push({id:'sb-'+k,lay:'sabbat',gl:x[2],t:x[1],s:x[3],date:k,alm:{kind:'sabbat',d:x}}));
  if(LON.retro)RETRO.filter(x=>x[0]===k).forEach(x=>out.push({id:'rx-'+k+x[1],lay:'retro',gl:x[1],t:x[2],s:x[3],date:k,alm:{kind:'retro',d:x}}));
  if(LON.venus)VENUS.filter(x=>x[0]===k).forEach(x=>out.push({id:'vn-'+k,lay:'venus',gl:'♀︎',t:x[1],s:x[2],date:k,alm:{kind:'venus',d:x}}));
  if(LON.sixmo)NEWMOON.filter(x=>x[0]===k).forEach(x=>out.push({id:'6-'+k,lay:'sixmo',gl:'◐',
    t:'six-month checkpoint',s:x[4],date:k,alm:{kind:'sixmo',d:x}}));
  if(LON.body)FULLMOON.filter(x=>x[0]===k).forEach(x=>out.push({id:'bd-'+k,lay:'body',gl:'♀︎',
    t:'body-sync day',s:x[5],date:k,alm:{kind:'body',d:x}}));
  /* ── computed */
  if(LON.lunar&&signOf(moonLon(new Date(d.getTime()-86400000)))!==si)
    out.push({id:'ms-'+k,lay:'lunar',gl:'☽',t:`moon enters ${SIGNS[si]}`,s:SIGN_READ[SIGNS[si]][0],date:k});
  if(LON.void){const v=voidWindow(d);if(v.active)out.push({id:'v-'+k,lay:'void',gl:'⊘',t:'moon goes void',s:`~${v.hrs}h — don't launch`,date:k});}
  if(LON.natal&&S.me.date){
    const nb=parse(S.me.date), nsun=signOf(sunLon(nb)), nmoon=signOf(moonLon(nb));
    if(si===nsun)out.push({id:'tn-'+k,lay:'natal',gl:'✦',t:'moon conjunct your natal sun',s:'the emotional reset lands on your identity',date:k});
    else if(si===nmoon&&LON.lunret)out.push({id:'lr-'+k,lay:'lunret',gl:'☾',t:'lunar return',s:'the moon came home. your monthly reboot.',date:k});
    if(k.slice(5)===S.me.date.slice(5))out.push({id:'sr-'+k,lay:'natal',gl:'☉',t:'solar return',s:'your real new year. identity reset.',date:k,big:1});
    if(LON.prof&&k.slice(5)===S.me.date.slice(5))out.push({id:'pf-'+k,lay:'prof',gl:'◈',t:'profection year turns',s:'new house activated. new time lord.',date:k});
  }
  /* ── entanglements: their transits */
  if(LON.theirs)S.people.filter(pp=>pp.date).forEach(pp=>{
    if(k.slice(5)===pp.date.slice(5))out.push({id:'ps-'+k+pp.name,lay:'theirs',gl:'☉',
      t:`${pp.name} · solar return`,s:'ego peak. attention-seeking. handle accordingly.',date:k,who:pp.name});
    const pm=signOf(moonLon(parse(pp.date)));
    if(si===pm)out.push({id:'pl-'+k+pp.name,lay:'theirs',gl:'☾',
      t:`${pp.name} · lunar return`,s:'they\'re raw and resetting. won\'t admit it.',date:k,who:pp.name});
  });
  /* ── cycle: predicted from logs */
  if(LON.cycle)cyclePredict(d).forEach(c=>out.push({...c,date:k}));
  /* ── rituals matched to sky */
  if(LON.ritual&&(pn==='new moon'||pn==='full moon')){
    const r=RIT.find(x=>x.ph.includes(pn));
    if(r)out.push({id:'r-'+k,lay:'ritual',gl:'✧',t:`matched working · ${r.n}`,s:r.v,date:k});
  }
  S.cal.filter(c=>c.date===k).forEach(c=>{if(LON[c.lay||'ritual'])out.push({...c,gl:c.gl||'✧',lay:c.lay||'ritual'});});
  S.entries.filter(e=>e.date===k).forEach(e=>{
    const lay=e.type==='pull'?'pull':e.type==='ritual'?'ritual':e.type==='cycle'?'cycle':e.type==='inter'?'inter':'entry';
    if(LON[lay])out.push({id:'e-'+e.id,lay,gl:EG[e.type]||'❦',
      t:e.title||(e.type==='pull'?'tarot pull':'entry'),
      s:e.ai?e.ai.split(/\n/)[0].slice(0,66)+'…':((e.body||'').slice(0,58)||'logged'),date:k,entry:1,eid:e.id});
  });
  return mergeCloud(out,k);
}

/* ══════════ CYCLE ENGINE — one log populates the whole month ══════════ */
function cyclePredict(d){
  const logs=S.entries.filter(e=>e.type==='cycle'&&e.cycle&&e.cycle.start).sort((a,b)=>a.date<b.date?1:-1);
  if(!logs.length)return[];
  const last=logs[0], len=last.cycle.len||28, dur=last.cycle.dur||5;
  const st=parse(last.cycle.start);
  const diff=Math.round((parse(key(d))-st)/86400000);
  if(diff<0)return[];
  const day=((diff%len)+len)%len;
  const out=[];
  const ov=len-14;
  if(day<dur)out.push({id:'cy-p',lay:'cycle',gl:'◉',t:`period · day ${day+1}`,s:'rest. the body is releasing too.'});
  else if(day>=ov-2&&day<=ov+1)out.push({id:'cy-o',lay:'cycle',gl:'◉',t:day===ov?'ovulation':'fertile window',s:'peak energy + magnetism. glamour lands hardest here.'});
  else if(day>ov+1&&day<len-3)out.push({id:'cy-l',lay:'cycle',gl:'◐',t:'luteal',s:'wind down. cut, clear, release — this is banishing weather in the body.'});
  else if(day>=len-3)out.push({id:'cy-m',lay:'cycle',gl:'◑',t:'pms window',s:'intuition is loudest and patience is lowest. pull cards, don\'t send texts.'});
  return out;
}
function cycleSpell(d){
  const c=cyclePredict(d)[0]; if(!c)return null;
  const p=phase(d),pn=phaseName(p);
  const map={'period · day 1':'release','ovulation':'glamour','fertile window':'love','luteal':'release','pms window':'protection'};
  const want=map[c.t]||(Object.keys(map).find(k=>c.t.startsWith('period'))?'release':'clarity');
  const r=RIT.find(x=>x.t.includes(want))||RIT[0];
  return {phase:c.t,moon:pn,ritual:r};
}
function upcoming(from,n){
  const out=[];const d=new Date(from);
  for(let i=0;i<70&&out.length<n;i++){
    const ev=evForDate(d).filter(e=>!e.entry&&e.lay!=='void');
    ev.forEach(e=>{if(out.length<n)out.push({...e,when:i===0?'today':i===1?'tomorrow':fmt(d)});});
    d.setDate(d.getDate()+1);
  }
  return out;
}
function evRow(e){
  return `<button class="evrow" onclick="openEv('${e.date}','${e.id}')"><span class="g" style="background:var(--soft);color:var(--accent)">${e.gl}</span>
    <div><div class="e1">${e.t}</div><div class="e2">${e.s}</div></div><span class="w">${e.when||fmt(parse(e.date))}</span></button>`;}

/* ══════════ CALENDAR VIEW ══════════ */
function renderCal(){
  const c=S.cursor;
  document.getElementById('mTitle').textContent=c.toLocaleDateString('en-us',{month:'long',year:'numeric'}).toLowerCase();
  const first=new Date(c.getFullYear(),c.getMonth(),1), pad=first.getDay(), dim=new Date(c.getFullYear(),c.getMonth()+1,0).getDate();
  const tk=key(new Date());
  let h='';
  for(let i=0;i<pad;i++)h+='<div class="cell pad"></div>';
  for(let dd=1;dd<=dim;dd++){
    const d=new Date(c.getFullYear(),c.getMonth(),dd), k=key(d), ev=evForDate(d);
    const cols=[...new Set(ev.map(e=>(layMeta(e.lay)||{}).c))].filter(Boolean).slice(0,4);
    const p=phase(d), showMoon=p<.02||p>.98||Math.abs(p-.5)<.02;
    h+=`<button class="cell${k===tk?' tod':''}${k===S.sel?' sel':''}" onclick="openDayPage('${k}')">
      ${showMoon?`<span class="mm">${moonSVG(p,13)}</span>`:''}
      <span class="dn">${dd}</span>
      <span class="pips">${cols.map(x=>`<span class="pip" style="background:${x}"></span>`).join('')}</span></button>`;
  }
  document.getElementById('mGrid').innerHTML=h;
  const sd=parse(S.sel), ev=evForDate(sd), p=phase(sd), si=signOf(moonLon(sd));
  document.getElementById('dSelLab').innerHTML=`${fmtL(sd)} <span class="lk" style="pointer-events:none">${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}</span>`;
  document.getElementById('dSel').innerHTML=ev.length?ev.map(e=>evRow(e)).join('')
    :`<div class="card" style="font-size:13px;color:var(--dust)">nothing on the books. the sky's quiet — ${MOOD[phaseName(p)].toLowerCase()}</div>`;
  document.getElementById('quickLay').innerHTML=LAYERS.flatMap(g=>g.items).slice(0,7).map(i=>
    `<button class="chip${LON[i.id]?' on':''}" onclick="LON['${i.id}']=!LON['${i.id}'];renderCal()">${i.gl} ${i.n}</button>`).join('');
  document.getElementById('sixPlan').innerHTML=NEWMOON.filter(x=>x[0]>=key(new Date())).slice(0,6).map(x=>
    `<button class="six" style="width:100%;text-align:left" onclick="S.sel='${x[0]}';S.cursor=parse('${x[0]}');renderCal();openEv('${x[0]}','6-${x[0]}')">
      <div class="sh"><span class="sd">${fmt(parse(x[0]))}</span><span class="sn">new moon in ${x[1]}</span></div>
      <div class="st">${x[3]}</div>
      <div class="sk"><b>◐ the assignment</b>${x[4]}</div></button>`).join('');
}
function mShift(n){S.cursor=new Date(S.cursor.getFullYear(),S.cursor.getMonth()+n,1);renderCal();}
function pickDay(k){S.sel=k;renderCal();}
/* every layer, LON toggles ignored — the day page shows the whole sky */
function allEvForDate(d){
  const saved={...LON};
  Object.keys(LON).forEach(k=>LON[k]=true);
  const out=evForDate(d);
  Object.assign(LON,saved);
  return out;
}
function openDayPage(k){
  S.sel=k;renderCal();
  const d=parse(k), p=phase(d), pn=phaseName(p), si=signOf(moonLon(d));
  const ill=Math.round((1-Math.cos(2*Math.PI*p))/2*100);
  const ev=allEvForDate(d), voc=ev.filter(e=>e.lay==='voc'), rest=ev.filter(e=>e.lay!=='voc');
  const RX=['mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].filter(x=>isRx(x,d));
  const dr=dailyRead(d), cs=cycleSpell(d), rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
  const seed=[...NEWMOON].reverse().find(x=>x[0]<=k);
  let arc='';
  if(seed){
    const dayN=Math.round((d-parse(seed[0]))/86400000)+1;
    const chk=FULLMOON.find(f=>f[0]>=k);
    const cul=FULLMOON.find(f=>f[1]===seed[1]&&f[0]>seed[0]);
    arc=`<div class="lab">the lunar arc</div>
     <div class="card"><div style="font-size:13.5px;line-height:1.65">
       <b>day ${dayN}</b> of the cycle seeded by the <b>${seed[1]} new moon</b> (${fmt(parse(seed[0]))}).<br>
       theme: ${seed[3]}.<br>
       ${chk?`next checkpoint: <b>full moon ${fmt(parse(chk[0]))}</b>.`:''}
       ${cul?` six-month culmination: <b>${seed[1]} full moon, ${fmt(parse(cul[0]))}</b>.`:''}
     </div></div>`;
  }
  const jn=(S.entries||[]).filter(e=>e.date===k||(e.ts&&key(new Date(e.ts))===k));
  document.getElementById('dpTop').textContent=d.toLocaleDateString('en-us',{month:'long',year:'numeric'}).toLowerCase();
  document.getElementById('dpBody').innerHTML=`
    <div class="eb"><span class="cer">❦ · </span>${d.toLocaleDateString('en-us',{weekday:'long'}).toLowerCase()}<span class="cer"> · ❦</span></div>
    <div class="h1 sf">${fmtL(d)}<span class="k">✦</span></div>
    <div class="dp-moon">${moonSVG(p,62)}<div class="mtx"><b>${pn} in ${SIGNS[si]} ${GLY[si]}</b>
      <div>${ill}% lit · ${MOOD[pn].toLowerCase()}</div></div></div>
    ${voc.length?`<div class="card" style="margin-top:12px;border:1px dashed var(--line)"><div style="font-size:12.5px;color:var(--dust)"><b style="color:var(--deep)">◌ void of course</b> — ${voc.map(v=>v.s||v.t).join(' · ')}. sign nothing, launch nothing, let it drift.</div></div>`:''}
    <div class="pnl" style="margin-top:14px"><div class="cap" style="font-size:9px;color:var(--deep);font-weight:600">✦ the read</div>
      <div style="font-size:14px;margin-top:8px;line-height:1.65">${dr.l1}<br><br>${dr.l2}</div></div>
    ${RX.length?`<div class="lab">retrograde right now</div><div class="dp-rx">${RX.map(x=>`<span class="zg">${PGL[x]} ${x} ℞</span>`).join('')}</div>`:''}
    <div class="lab">on the books</div>
    ${rest.length?rest.map(e=>evRow(e)).join(''):'<div class="card" style="font-size:13px;color:var(--dust)">a quiet slate — the sky is between sentences.</div>'}
    ${arc}
    ${cs?`<div class="lab">your body</div><div class="card"><div style="font-size:13.5px"><b>${cs.phase}</b> — the cycle and the sky stack here. ${cs.ritual.n} fits both.</div></div>`:''}
    <div class="lab">work with this sky</div>
    <div class="card"><div class="cap" style="font-size:9px;color:var(--deep)">✧ working</div>
      <div style="font-size:15.5px;font-weight:700;margin-top:4px">${rit.n}</div>
      <div style="font-size:12.5px;color:var(--dust);margin-top:5px;line-height:1.6">${rit.d||''}</div></div>
    <div class="lab">the record</div>
    ${jn.length?jn.map(e=>entHTML(e)).join(''):`<div class="card" style="font-size:13px;color:var(--dust)">nothing written for this day yet.</div>`}
    <button class="btn ghost" style="margin-top:12px;width:100%" onclick="closeDayPage();nav('journal')">record this day ✎</button>`;
  document.getElementById('dayPage').classList.add('on');
  document.getElementById('dpBody').scrollTop=0;
}
function closeDayPage(){document.getElementById('dayPage').classList.remove('on');}
function renderLayers(){
  document.getElementById('layerGroups').innerHTML=LAYERS.map(g=>
   `<div class="lab">${g.g}</div><div class="card">${g.items.map(i=>
     `<button class="lay" onclick="LON['${i.id}']=!LON['${i.id}'];renderLayers();toast('${i.n} ${LON[i.id]?'off':'on'}')">
        <span class="lg" style="color:${i.c}">${i.gl}</span>
        <span class="ln">${i.n}<div class="ld">${i.d}</div></span>
        <span class="tog${LON[i.id]?' on':''}"></span></button>`).join('')}</div>`).join('');
}
function openEv(dk,id){
  const d=parse(dk), ev=evForDate(d).find(e=>e.id===id)||{t:'the sky',s:'',lay:'lunar',gl:'☽'};
  if(ev.eid){const en=S.entries.find(x=>x.id===ev.eid);
    if(en&&en.cards&&en.cards.length)return rereadEntry(ev.eid);
    if(en)return sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">❦ · ${fmt(d)} · ❦</div>${entHTML(en)}`);}
  const p=phase(d),pn=phaseName(p),si=signOf(moonLon(d));
  const A=ev.alm;
  let astro='';
  if(A&&A.kind==='newmoon')astro=`<p><b>new moon in ${A.d[1]} · ${A.d[2]}</b></p><p>${A.d[3]}</p><p>blank slate. this is where you plant — in whatever house ${A.d[1]} rules for you.</p>`;
  else if(A&&A.kind==='fullmoon')astro=`<p><b>${A.d[3]}</b> · ${A.d[1]} ${A.d[2]}</p><p>${A.d[4]}</p><p>peak of the cycle. whatever's been building hits climax. this is release energy, not start energy.</p><p><b>body-sync:</b> ${A.d[5]}</p>`;
  else if(A&&A.kind==='sabbat')astro=`<p><b>${A.d[1]}</b></p><p>${A.d[3]}</p><p>one of the eight power days. an anchor point tied to the sun — a spiritual checkpoint, not a suggestion.</p>`;
  else if(A&&A.kind==='retro')astro=`<p><b>${A.d[2]}</b></p><p>${A.d[3]}</p><p>${A.d[4]!==A.d[0]?`runs through <b>${fmt(parse(A.d[4]))}</b>.`:'exact today.'} when a planet turns backward, that area of life slows, scrambles, or transforms. it doesn't stop — it reviews.</p>`;
  else if(A&&A.kind==='venus')astro=`<p><b>${A.d[1]}</b></p><p>${A.d[2]}</p><p>venus rules love, beauty, value, magnetism. every sign shift changes the <i>flavor</i> of attraction. this is the flavor now.</p>`;
  else if(A&&A.kind==='sixmo')astro=`<p><b>checkpoint · new moon in ${A.d[1]}</b></p><p>every new moon is a planning gate. what shipped since the last one? what stalled?</p><p>this one's assignment: ${A.d[4]}</p>`;
  else if(A&&A.kind==='body')astro=`<p><b>full moon body-sync</b></p><p>each sign rules a body part. full moon in <b>${A.d[1]}</b> = peak release in <b>${A.d[5]}</b> — physically and emotionally.</p>`;
  else astro=`<p>${dailyRead(d).l1}</p><p>${dailyRead(d).l2}</p>`;

  const rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
  const cs=cycleSpell(d);
  document.getElementById('evBody').innerHTML=
   `<div class="eb"><span class="cer">✧ · </span>${(layMeta(ev.lay)||{n:'the sky'}).n}<span class="cer"> · ✧</span></div>
    <div class="h1 sf">${ev.t}<span class="k">✦</span></div>
    <div class="h1s">${fmtL(d)} · ${pn} in <b>${SIGNS[si]} ${GLY[si]}</b></div>
    <div class="pnl"><div class="cap" style="font-size:9px;color:var(--deep);font-weight:600">✦ the astrology first</div>
      <div style="font-size:14px;margin-top:9px;line-height:1.6">${astro}</div></div>
    ${A&&A.kind==='sixmo'?`<div class="lab">the assignment</div><div class="six"><div class="sk"><b>◐ do this</b>${A.d[4]}</div></div>`:''}
    ${cs?`<div class="lab">your body that day</div>
      <div class="card"><div style="font-size:14px"><b>${cs.phase}</b> — the cycle and the sky stack here. ${cs.ritual.n} fits both.</div></div>`:''}
    <div class="lab">work with this sky</div>
    <div class="card"><div class="cap" style="font-size:9px;color:var(--deep)">✧ working</div>
      <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.n}</div>
      <div style="font-size:12.5px;color:var(--dust)">${rit.v}</div>
      <button class="btn g" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),80)">open the working ›</button></div>
    <div class="card"><div class="cap" style="font-size:9px;color:var(--deep)">✦ spread</div>
      <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.pair}</div>
      <button class="btn g" onclick="openSpread('${rit.pair}')">lay it out ›</button></div>
    <div class="card"><div class="cap" style="font-size:9px;color:var(--deep)">❧ ingredients</div>
      <div class="ich" style="margin-top:8px">${rit.need.map(n=>`<button class="ic2" onclick="nav('lib');setShelf('ing');setTimeout(()=>jumpIng('${n}'),80)">${n}</button>`).join('')}</div></div>
    <div class="card"><div class="cap" style="font-size:9px;color:var(--deep)">❦ journal prompt</div>
      <div class="sf" style="font-size:15px;margin-top:6px;color:var(--dust)">&ldquo;${PROMPTS[pn]}&rdquo;</div>
      <button class="btn g" onclick="openEntry('${dk}')">write it ›</button></div>
    <button class="btn" onclick="addCal('${dk}','${rit.n}')">＋ add the working to my calendar</button>`;
  nav('event');
}
function addCal(dk,t){S.cal.push({id:'c'+Date.now(),date:dk,lay:'ritual',gl:'✧',t,s:'planned working'});toast('✧ on the calendar — the sky will remind you');renderCal();}


/* ══════════ MINI NATAL WHEEL (anyone) ══════════ */
function miniWheel(dateStr,size){
  if(!dateStr)return '';
  const d=parse(dateStr), R=size/2-6, C=size/2;
  const pos={};Object.keys(PL).forEach(k=>pos[k]=PL[k](d));
  let w=`<svg class="minwheel" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="var(--line)"/>
    <circle cx="${C}" cy="${C}" r="${R-14}" fill="none" stroke="var(--line)"/>
    <circle cx="${C}" cy="${C}" r="${R*0.42}" fill="none" stroke="var(--line)" opacity=".6"/>`;
  for(let i=0;i<12;i++){const a=(i*30-90)*Math.PI/180,am=((i*30+15)-90)*Math.PI/180;
    w+=`<line x1="${C+Math.cos(a)*(R-14)}" y1="${C+Math.sin(a)*(R-14)}" x2="${C+Math.cos(a)*R}" y2="${C+Math.sin(a)*R}" stroke="var(--line)"/>`;
    w+=`<text x="${C+Math.cos(am)*(R-7)}" y="${C+Math.sin(am)*(R-7)+3}" text-anchor="middle" font-size="${size>150?9:7}" fill="var(--faint)" class="zg">${GLY[i]}</text>`;}
  const ks=Object.keys(pos),used=[];
  ks.forEach(k=>{const lon=pos[k];let ring=R-24;
    while(used.some(u=>Math.abs(u.l-lon)<10&&Math.abs(u.r-ring)<11))ring-=13;
    used.push({l:lon,r:ring});
    const a=(lon-90)*Math.PI/180;
    w+=`<text x="${C+Math.cos(a)*ring}" y="${C+Math.sin(a)*ring+4}" text-anchor="middle" font-size="${size>150?12:10}" fill="var(--accent)" class="zg">${PGL[k]}</text>`;});
  ks.forEach((a,i)=>ks.slice(i+1).forEach(b=>{
    let df=Math.abs(pos[a]-pos[b])%360;if(df>180)df=360-df;
    let c=null;
    let dsh=null;
    if(Math.abs(df-120)<6)c='var(--accent)';
    else if(Math.abs(df-90)<6)c='var(--deep)';
    else if(Math.abs(df-180)<6){c='var(--deep)';dsh='4 3';}
    else if(Math.abs(df-60)<4){c='var(--accent)';dsh='3 3';}
    if(c){const a1=(pos[a]-90)*Math.PI/180,a2=(pos[b]-90)*Math.PI/180,rr=R*0.42;
      w+=`<line x1="${C+Math.cos(a1)*rr}" y1="${C+Math.sin(a1)*rr}" x2="${C+Math.cos(a2)*rr}" y2="${C+Math.sin(a2)*rr}" stroke="${c}" stroke-width=".7" opacity=".5"${dsh?` stroke-dasharray="${dsh}"`:''}/>`;}}));
  return w+`<circle cx="${C}" cy="${C}" r="2" fill="var(--accent)"/></svg>`;
}

/* ══════════ ORBIT ══════════ */


function theirSky(p){
  const d=new Date(), si=signOf(moonLon(d)), nb=parse(p.date);
  const nsun=signOf(sunLon(nb)), nmoon=signOf(moonLon(nb));
  const hit=si===nsun?'the moon is sitting on their sun today — they\'re feeling extremely themselves. handle accordingly.'
    :si===nmoon?'lunar return for them. they\'re raw, resetting, and probably won\'t admit it.'
    :`moon in ${SIGNS[si]} for them too — ${SIGN_READ[SIGNS[si]][1]}`;
  const rx=['mercury','venus','mars'].filter(pl=>isRx(pl,d));
  return `<div class="tr"><span class="g">☽</span><div><div class="a">moon in ${SIGNS[si]} ${GLY[si]}</div><div class="b">${hit}</div></div></div>
    ${rx.length?`<div class="tr"><span class="g">℞</span><div><div class="a">${rx.map(x=>PGL[x]).join(' ')} retrograde</div><div class="b">affects everyone — them included. review, don't launch.</div></div></div>`:''}`;
}

function big3(p){
  if(!p.date)return '';
  const d=parse(p.date), ss=signOf(sunLon(d)), ms=signOf(moonLon(d));
  const _ptz=p.tzName?tzOffsetAt(p.tzName,p.date,p.time):null;
  const A=(p.time&&p.lat&&p.lon)?angles(p.date,p.time,p.lat,p.lon,_ptz!=null?_ptz:undefined):null;
  return `<div class="b3">
    <div><div class="g">☉</div><div class="k">sun</div><div class="v">${SIGNS[ss]}</div></div>
    <div><div class="g">☽</div><div class="k">moon</div><div class="v">${SIGNS[ms]}</div></div>
    <div><div class="g">↑</div><div class="k">rising</div><div class="v">${A?SIGNS[signOf(A.asc)]:'—'}</div></div></div>`;
}

function renderOrbit(){
  const m=S.me;
  document.getElementById('orbitMe').innerHTML= m.date?
   `<div style="display:flex;gap:14px;align-items:center"><div class="disc">${esc((m.name||'y')[0])}</div>
      <div><div style="font-size:18px;font-weight:700">${esc(m.name||'you')}</div><div style="font-size:12px;color:var(--dust)">${esc(m.place||'—')} · ${m.date}</div></div></div>
    ${miniWheel(m.date,190)}
    ${big3(m)}<button class="btn g" onclick="nav('natal')">open my full chart ›</button>`
   :`<div class="empty"><div class="eg">☉</div><div class="et">no chart yet</div>
      <div class="ed">the cosmos, made personal ✦</div>
      <button class="btn" onclick="obReplay()">cast my chart</button></div>`;
  document.getElementById('orbitList').innerHTML= S.people.length? S.people.map((p,i)=>{
    const n=S.entries.filter(e=>e.who===p.name).length;
    return `<button class="row" onclick="openPerson(${i})">
      <span class="disc" style="flex:0 0 40px;height:40px;font-size:16px">${esc((p.name||'?')[0])}</span>
      <span><span class="t">${esc(p.name)}</span><div class="s">${esc(p.rel||'orbit')}${p.date?` · ☉ ${SIGNS[signOf(sunLon(parse(p.date)))]} · ☽ ${SIGNS[signOf(moonLon(parse(p.date)))]}`:' · no chart'}${n?` · ${n} logged`:''}</div></span>
      <span class="c">›</span></button>`;}).join('')
   :`<div class="card"><div class="empty" style="padding:20px 8px"><div class="eg">☍</div><div class="et">orbit's empty</div>
      <div class="ed">astrology, organized around you ☍</div></div></div>`;
}
function openPerson(i){
  if(i===undefined){
    sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">☍ · into the orbit · ☍</div>
     <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">someone new</div>
     <div class="ob-f" style="margin-top:14px">
       <input id="pN" placeholder="name"><input id="pD" type="date"><input id="pT" type="time">
       <div class="cw"><input id="pP" placeholder="birth place" autocomplete="off" oninput="cityType(this,'pDD')" onfocus="cityType(this,'pDD')"><div class="cdd" id="pDD"></div></div>
       <select id="pR" style="appearance:none"><option>partner</option><option>ex</option><option>situationship</option><option>roster</option><option>friend</option><option>family</option><option>enemy</option><option>client</option></select>
     </div>
     <button class="btn" onclick="savePerson()">cast their chart ✦</button>`);
    return;
  }
  const p=S.people[i];
  const es=S.entries.filter(e=>e.who===p.name);
  document.getElementById('pBody').innerHTML=
   `<div class="eb"><span class="cer">☍ · </span>${esc(p.rel||'orbit')}<span class="cer"> · ☍</span></div>
    <div class="h1 sf">${esc(p.name)}<span class="k">✦</span></div>
    <div class="h1s">${esc(p.place||'—')} ${p.date?'· '+p.date:''}</div>
    ${p.date?`<div class="pnl">${miniWheel(p.date,190)}${big3(p)}</div>`:'<div class="card"><div class="empty"><div class="eg">☉</div><div class="et">no chart</div><div class="ed">add their birth date ✧</div></div></div>'}
    <div class="lab">their sky today</div>
    <div class="card">${p.date?theirSky(p):'<div style="font-size:13px;color:var(--dust)">add their birth date ✧</div>'}</div>
    ${p.date&&S.me.date?`<div class="lab">entanglement</div>
      <button class="row" onclick="openSyn(${i})"><span class="ic">♡</span><span><span class="t">synastry</span><div class="s">how your charts touch</div></span><span class="c">›</span></button>
      <button class="row" onclick="openComp(${i})"><span class="ic">◍</span><span><span class="t">composite</span><div class="s">the third chart</div></span><span class="c">›</span></button>`:''}
    <div class="lab">log an interaction</div>
    <div class="card"><div class="ilog">${INTER.map(t=>
      `<button onclick="openInter('${esc(jsq(p.name))}','${t[1]}')"><div class="g">${t[0]}</div><div class="n">${t[1]}</div></button>`).join('')}</div></div>
    <div class="lab">the record · ${esc(p.name)} · ${es.length}</div>
    ${es.length?es.map(entHTML).join(''):'<div class="card" style="font-size:13px;color:var(--dust)">nothing logged. every interaction, pull, and pattern about them lands here — cross-referenced with the sky it happened under.</div>'}`;
  nav('person');
}
function openSyn(i){
  const p=S.people[i], a=parse(S.me.date), b=parse(p.date);
  const pa={},pb={};Object.keys(PL).forEach(k=>{pa[k]=PL[k](a);pb[k]=PL[k](b);});
  const hits=[];
  Object.keys(PL).forEach(x=>Object.keys(PL).forEach(y=>{
    let df=Math.abs(pa[x]-pb[y])%360;if(df>180)df=360-df;
    const A=[[0,'conjunct','fused. this is the glue or the problem.'],[60,'sextile','an easy door, if someone opens it.'],
      [90,'square','friction. hot, but it grinds.'],[120,'trine','it just flows. dangerously easy.'],[180,'opposite','magnetic and exhausting. you complete and combust.']];
    A.forEach(([ang,nm,mn])=>{if(Math.abs(df-ang)<5&&['sun','moon','venus','mars'].includes(x)&&['sun','moon','venus','mars'].includes(y))
      hits.push([`your ${x} ${nm} their ${y}`,mn,Math.abs(df-ang)]);});}));
  hits.sort((x,y)=>x[2]-y[2]);
  sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">♡ · synastry · ♡</div>
    <div class="sf" style="font-size:23px;text-align:center;margin-top:3px">you & ${esc(p.name)}</div>
    <div style="font-size:11.5px;color:var(--dust);text-align:center;margin-top:3px">${hits.length} contacts between the personal planets</div>
    <div class="card">${hits.length?hits.slice(0,8).map(x=>
      `<div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')"><span class="g">♡</span>
        <span><span class="a">${x[0]}</span><div class="b">orb ${x[2].toFixed(1)}°</div></span><span class="c">›</span></button>
        <div class="exb"><p>${x[1]}</p></div></div>`).join('')
      :'<div style="font-size:13px;color:var(--dust)">no tight contacts between the personal planets. that\'s its own kind of answer.</div>'}</div>`);
}
function openComp(i){
  const p=S.people[i], a=parse(S.me.date), b=parse(p.date);
  const mid={};Object.keys(PL).forEach(k=>{let x=PL[k](a),y=PL[k](b);let m=(x+y)/2;
    if(Math.abs(x-y)>180)m=(m+180)%360;mid[k]=m;});
  sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">◍ · composite · ◍</div>
    <div class="sf" style="font-size:23px;text-align:center;margin-top:3px">the third chart</div>
    <div style="font-size:11.5px;color:var(--dust);text-align:center;margin-top:3px">you + ${esc(p.name)} as its own being</div>
    <div class="pnl"><div class="card" style="margin:0;border:none;box-shadow:none;padding:0">
      ${Object.keys(mid).slice(0,7).map(k=>{const si=signOf(mid[k]);
        return `<div class="nr"><span class="g">${PGL[k]}</span><span class="n">${k}</span><span class="w2">${SIGNS[si]} ${GLY[si]} · ${degIn(mid[k]).toFixed(0)}°</span></div>`;}).join('')}
    </div></div>
    <div class="card"><div class="cap" style="font-size:9px;color:var(--deep)">◍ what it is</div>
      <p style="font-size:13.5px;margin-top:7px;line-height:1.55">the composite isn't you and it isn't them — it's the <b>relationship</b> as a third entity with its own chart. composite sun in <b>${SIGNS[signOf(mid.sun)]}</b> means the thing you two build together is fundamentally ${SIGN_READ[SIGNS[signOf(mid.sun)]][0]}.</p>
      <p style="font-size:13.5px;margin-top:7px;line-height:1.55">composite moon in <b>${SIGNS[signOf(mid.moon)]}</b> — that's what the relationship <i>needs</i> to feel safe. ${SIGN_READ[SIGNS[signOf(mid.moon)]][1]}</p></div>`);
}
function savePerson(){
  const n=document.getElementById('pN').value.trim();if(!n)return toast('name them first ☍');
  const _pp=document.getElementById('pP');S.people.push({name:n,date:document.getElementById('pD').value,time:document.getElementById('pT').value,place:_pp.value,lat:_pp.dataset.lat||null,lon:_pp.dataset.lon||null,tzName:_pp.dataset.tz||null,rel:document.getElementById('pR').value});
  closeSheet();renderOrbit();toast('✦ chart cast — they\'re in orbit now');
}

/* ══════════ GRIMOIRE ══════════ */
function renderGrim(){
  const d=new Date(),p=phase(d),pn=phaseName(p),si=signOf(moonLon(d));
  const rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
  document.getElementById('gCount').textContent=`${S.entries.length} ${S.entries.length===1?'entry':'entries'}`;
  document.getElementById('gSky').innerHTML=
   `<div style="display:flex;gap:13px;align-items:center;position:relative">
      <div class="mn">${moonSVG(p,46)}</div>
      <div><div class="t1">${pn} in ${SIGNS[si]} ${GLY[si]}</div><div class="t2">${MOOD[pn]}</div></div></div>`;
  document.getElementById('gMatch').innerHTML=
   `<button class="mch" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),80)"><div class="k">✧ working</div><div class="v">${rit.n}</div></button>
    <button class="mch" onclick="nav('lib');setShelf('tarot')"><div class="k">✦ spread</div><div class="v">${rit.pair}</div></button>
    <button class="mch" onclick="nav('lib');setShelf('ing')"><div class="k">❧ needs</div><div class="v">${rit.need.slice(0,2).join(' · ')}</div></button>`;
  /* stats */
  const pulls=S.entries.filter(e=>e.type==='pull');
  const allc=pulls.flatMap(e=>e.cards||[]);
  const cnt={};allc.forEach(c=>cnt[c.k]=(cnt[c.k]||0)+1);
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
  const suits={w:0,c:0,s:0,p:0};allc.forEach(c=>{const s=byKey(c.k);if(s&&suits[s.suit]!==undefined)suits[s.suit]++;});
  const tops=Object.entries(suits).sort((a,b)=>b[1]-a[1])[0];
  const revs=allc.filter(c=>c.rev).length;
  document.getElementById('gStats').innerHTML=
   `<div class="st"><div class="v">${streak()}</div><div class="k">day streak</div></div>
    <div class="st"><div class="v">${pulls.length}</div><div class="k">pulls</div></div>
    <div class="st"><div class="v">${allc.length?SUIT[tops[0]][1]:'—'}</div><div class="k">your suit</div></div>
    <div class="st"><div class="v">${allc.length?Math.round(revs/allc.length*100)+'%':'—'}</div><div class="k">reversed</div></div>`;
  document.getElementById('gRec').innerHTML= top.length? top.slice(0,8).map(([k,n])=>{
    const c=byKey(k);return `<button class="recc" onclick="openCard('${k}')"><img src="${IMG[k]||''}" alt="${c.n}"><div class="n">${c.n}</div><div class="x">×${n}</div></button>`;}).join('')
    :'<div class="card" style="flex:1;font-size:12.5px;color:var(--dust)">the repeats surface here ✦</div>';
  const planned=S.cal.length, done=S.entries.filter(e=>e.type==='ritual').length;
  document.getElementById('gPractice').innerHTML=
   `<button class="chip" onclick="nav('cal')">planned · ${planned}</button>
    <button class="chip" onclick="nav('journal')">performed · ${done}</button>
    <button class="chip" onclick="nav('journal')">pulls · ${pulls.length}</button>
    <button class="chip" onclick="nav('journal')">notes · ${S.entries.filter(e=>e.type==='note').length}</button>`;
}
function streak(){
  if(!S.entries.length)return 0;
  const ds=new Set(S.entries.map(e=>e.date));let n=0,d=new Date();
  while(ds.has(key(d))){n++;d.setDate(d.getDate()-1);}
  return n;
}
function renderPat(){
  const pulls=S.entries.filter(e=>e.type==='pull'), allc=pulls.flatMap(e=>e.cards||[]);
  if(!allc.length){document.getElementById('patBody').innerHTML=
    `<div class="card"><div class="empty"><div class="eg">✦</div><div class="et">no patterns yet</div>
     <div class="ed">every season has a signal ✦</div>
     <button class="btn" onclick="openPull()">log a pull</button></div></div>`;return;}
  const cnt={};allc.forEach(c=>cnt[c.k]=(cnt[c.k]||0)+1);
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
  const suits={w:0,c:0,s:0,p:0},maj=allc.filter(c=>byKey(c.k).suit==='major').length;
  allc.forEach(c=>{const s=byKey(c.k).suit;if(suits[s]!==undefined)suits[s]++;});
  const ts=Object.entries(suits).sort((a,b)=>b[1]-a[1])[0];
  const revs=allc.filter(c=>c.rev).length, tc=byKey(top[0][0]);
  document.getElementById('patBody').innerHTML=
   `<div class="stats"><div class="st"><div class="v">${streak()}</div><div class="k">streak</div></div>
     <div class="st"><div class="v">${pulls.length}</div><div class="k">pulls</div></div>
     <div class="st"><div class="v">${SUIT[ts[0]][1]}</div><div class="k">your suit</div></div>
     <div class="st"><div class="v">${Math.round(revs/allc.length*100)}%</div><div class="k">reversed</div></div></div>
    <div class="pnl"><div class="lab" style="margin:0 0 6px">most drawn · ×${top[0][1]}</div>
      <div style="display:flex;gap:14px;align-items:center">
        <img src="${IMG[tc.k]}" style="width:86px;border-radius:8px;border:1px solid var(--line)">
        <div><div style="font-size:18px;font-weight:700">${tc.n}</div>
          <div style="font-size:12.5px;color:var(--dust);margin-top:3px">${tc.up}</div>
          <button class="btn g sm" style="margin-top:9px" onclick="openCard('${tc.k}')">open ›</button></div></div></div>
    <div class="lab">the whole rotation</div><div class="rec">${top.map(([k,n])=>{const c=byKey(k);
      return `<button class="recc" onclick="openCard('${k}')"><img src="${IMG[k]}"><div class="n">${c.n}</div><div class="x">×${n}</div></button>`;}).join('')}</div>
    <div class="lab">the read</div>
    <div class="read"><div class="rl">✦ what the record's clocking</div>
      <p>${SUIT[ts[0]][0]} is running your deck — that's <b>${SUIT[ts[0]][2]}</b>. ${SUIT[ts[0]][3]}. it's not random, it's the department your life is currently filed under.</p>
      <p>${maj>allc.length/3?'and the majors keep crashing in. that means this isn\'t a "what should i text back" season — it\'s a fate season. the big machinery is moving whether you booked the appointment or not.':'mostly minors, which is actually good news — this is day-to-day terrain, not destiny. you have way more control here than the spiral is telling you.'}</p>
      ${revs/allc.length>.4?'<p>and the reversals are stacking. that\'s usually the deck saying the block is internal, not external. sit with that one.</p>':''}
      <div class="mv"><b>the move</b>${tc.f}</div></div>`;
}

/* ══════════ LIBRARY ══════════ */
let shelf='tarot';
function setShelf(s){shelf=s;document.querySelectorAll('#shelf button').forEach(b=>b.classList.toggle('on',b.dataset.s===s));renderShelf();}
document.querySelectorAll('#shelf button').forEach(b=>b.onclick=()=>setShelf(b.dataset.s));
function renderShelf(){
  const h=document.getElementById('shelfBody');
  if(shelf==='tarot'){
    h.innerHTML=`<div class="lab">✦ your significators</div>
      ${sigHTML()}
      <div class="lab">✧ tricks & tips</div>
      <div class="card">${TRICKS.map(t=>`<div class="pinr"><span class="e" style="flex:0 0 auto">${t[0].split(' ')[0]}</span><span class="s">${t[0].split(' ').slice(1).join(' ')}<div style="font-weight:400;color:var(--dust);font-size:12px;margin-top:2px">${t[1]}</div></span></div>`).join('')}</div>
      <div class="lab">♞ the court, decoded</div>
      <div class="card">${COURT_REF.map(c=>`<div class="pinr"><span class="s"><b>${c[0]}</b> — ${c[2]}<div style="font-weight:400;color:var(--dust);font-size:12px;margin-top:2px">${c[1]}</div></span></div>`).join('')}
        <div style="font-size:11.5px;color:var(--faint);margin-top:6px;line-height:1.55">a court can be a person, an energy someone's wearing, or a maturity stage — page early, king fully grown. read by context.</div></div>
      <div class="lab">♞ knight directions</div>
      <div class="card"><div style="font-size:12.5px;color:var(--dust);line-height:1.6;margin-bottom:8px">knights are the movement cards. facing toward a card = charging at it. facing away = riding off.</div>
        ${KNIGHTS.map(k=>`<div class="pinr"><span class="s"><b>knight of ${k[0]}</b><div style="font-weight:400;color:var(--dust);font-size:12px;margin-top:2px">${k[1]}</div></span></div>`).join('')}</div>
      <div class="lab">◌ locate-in-deck · top & bottom</div>
      <div class="card"><div style="font-size:12.5px;color:var(--dust);line-height:1.6;margin-bottom:8px">shuffle, flip through, find your card. read the card on top of it and the one right under. top = what's surfacing. bottom = the root it rests on.</div>
        ${LOCATE.map(l=>`<div class="pinr"><span class="s"><b>${l[0]}</b><div style="font-weight:400;color:var(--dust);font-size:12px;margin-top:2px">top: ${l[1]} · bottom: ${l[2]}</div></span></div>`).join('')}</div>
      <div class="lab">the spreads</div>
      ${SPREADS.map(g=>
      `<div class="spcat">${g.c}</div>
       ${g.s.map(sp=>`<div class="spc" data-sp="${sp.n}">
         <button class="spch" onclick="this.parentElement.classList.toggle('open')">
           <span><span class="nm">${sp.n}</span><div class="vv">${sp.v}</div></span><span class="cv">›</span></button>
         <div class="spcb">
           ${sprLay(sp)}
           <ol class="spos">${sp.p.map(p=>`<li>${p}</li>`).join('')}</ol>
           <div class="splog">
             <input type="date" value="${key(new Date())}">
             <input class="ci3" placeholder="cards + read" readonly onclick="openPull(0,'${jsq(sp.n)}')">
             <button class="lg" onclick="openPull(0,'${jsq(sp.n)}')">log</button>
           </div>
         </div></div>`).join('')}`).join('')}
      <div class="lab">the deck</div>
      <button class="row" onclick="nav('deck')"><span class="ic">✦</span><span><span class="t">all 78 cards</span><div class="s">majors · wands · cups · swords · pents</div></span><span class="c">›</span></button>
`;
    wire(h);
  } else if(shelf==='work'){
    const L=RIT.filter(r=>tagF==='all'||r.t.includes(tagF));
    h.innerHTML=`<div class="lab">by intention</div>
      <div class="chips">${TAGS.map(t=>`<button class="chip${t===tagF?' on':''}" onclick="tagF='${t}';renderShelf()">${t}</button>`).join('')}</div>
      <div class="lab">the workings</div>
      ${L.map(r=>`<div class="wk" data-n="${r.n}"><button class="wkh"><span><span class="nm">${r.n}</span><div class="mt">${r.s} · &ldquo;${r.v}&rdquo;</div></span><span class="wkc">›</span></button>
        <div class="wkb">
          <div class="wr"><b>⏳ next due</b>${r.best}<br><span style="color:var(--deep);font-weight:700">next window: ${nextWin(r)}</span>
            <button class="btn g sm" style="margin-top:8px" onclick="addCal('${nextWinK(r)}','${r.n}')">＋ add to calendar</button></div>
          <div class="wr"><b>🜂 you need</b><div class="ich">${r.need.map(n=>`<button class="ic2" onclick="setShelf('ing');setTimeout(()=>jumpIng('${n}'),60)">${n}</button>`).join('')}</div></div>
          <div class="wr"><b>◈ the steps</b><ol>${r.st.map(s=>`<li>${s}</li>`).join('')}</ol></div>
          <div class="wr"><b>✦ it's working when</b>${r.sg}</div>
          <div class="wr"><b>✧ pair it with</b><button class="ic2" onclick="openSpread('${r.pair}')">${r.pair}</button></div>
          <button class="btn" onclick="logRitual('${r.n}')">✧ log this working</button>
        </div></div>`).join('')}`;
    wire(h);
  } else {
    h.innerHTML=`<div class="lab">the pantry ❧</div>
      ${PANTRY.map(g=>`<div class="lab">${g.c}</div>${g.i.map(it=>
        `<div class="pan" data-i="${it.n}"><div class="t"><span style="font-size:17px;color:var(--deep)">${it.e}</span>
          <div><div class="n">${it.n}</div><div class="w">${it.w}</div></div></div>
          <div class="m"><b>uses</b> ${it.u} · <b>corr</b> ${it.o}</div>
          <div class="uses"><span class="k">in →</span>${it.r.map(r=>`<button class="ic2" onclick="setShelf('work');setTimeout(()=>jumpRit('${r}'),60)">${r}</button>`).join('')}</div>
          <div class="uses"><span class="k">cards →</span>${it.cd.map(k=>`<button class="ic2" onclick="openCard('${k}')">${byKey(k).n}</button>`).join('')}</div></div>`).join('')}`).join('')}`;
  }
}
const sprHTML=s=>`<button class="row" onclick="openSpread('${s.n}')"><span class="ic">✦</span>
  <span><span class="t">${s.n}</span><div class="s">${s.sub} · ${s.p.length} cards</div></span><span class="c">›</span></button>`;
function wire(h){h.querySelectorAll('.wkh').forEach(b=>b.onclick=()=>b.parentElement.classList.toggle('open'));}
function nextWin(r){const d=new Date();for(let i=0;i<45;i++){if(r.ph.includes(phaseName(phase(d))))return i===0?'tonight ☽':fmt(d);d.setDate(d.getDate()+1);}return'—';}
function nextWinK(r){const d=new Date();for(let i=0;i<45;i++){if(r.ph.includes(phaseName(phase(d))))return key(d);d.setDate(d.getDate()+1);}return key(new Date());}
function jumpIng(n){const e=document.querySelector(`.pan[data-i="${n}"]`);if(e){e.scrollIntoView({behavior:'smooth',block:'center'});e.classList.add('fl');setTimeout(()=>e.classList.remove('fl'),1300);}}
function jumpRit(n){const e=document.querySelector(`.wk[data-n="${n}"]`);if(e){e.classList.add('open');e.scrollIntoView({behavior:'smooth',block:'center'});}}
function logRitual(n){
  S.entries.unshift({id:Date.now(),date:key(new Date()),type:'ritual',title:n,body:'performed under '+phaseName(phase(new Date()))+' in '+SIGNS[signOf(moonLon(new Date()))],photos:[],cards:[]});
  toast('✧ logged in the record — stamped with tonight\'s sky');
}



/* ══════════ DECK VIEW ══════════ */
let suitF='major';
const SUITNAME={major:'the majors',w:'wands · fire',c:'cups · water',s:'swords · air',p:'pents · earth'};
function renderDeck(){
  document.querySelectorAll('#suitSeg button').forEach(b=>b.classList.toggle('on',b.dataset.s===suitF));
  const L=DECK.filter(c=>c.suit===suitF);
  document.getElementById('deckBody').innerHTML=
   `<div class="lab">${SUITNAME[suitF]} · ${L.length}</div>
    <div class="deck">${L.map(c=>`<button class="tc" onclick="openCard('${c.k}')"><img src="${IMG[c.k]||''}" loading="lazy" alt="${c.n}"></button>`).join('')}</div>
    <div class="hint">tap to open ✦</div>`;
}
document.querySelectorAll('#suitSeg button').forEach(b=>b.onclick=()=>{suitF=b.dataset.s;renderDeck();});


/* ══════════ AI READING (claude) ══════════ */
async function getReading(cards,ctx){
  const list=cards.map((c,i)=>{
    const cd=byKey(c.k);
    const pos=ctx.spread&&ctx.positions?ctx.positions[i]:null;
    return `${pos?pos+': ':''}${cd.n}${c.rev?' (reversed)':''} — upright: ${cd.up} / reversed: ${cd.rv}`;
  }).join('\n');
  /* voice + prompts live server-side now (app/api/reading) — key never touches the browser */
  const r=await fetch('/api/reading',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({list,ctx:{spread:ctx.spread||null,q:ctx.q||null,date:ctx.date,sky:ctx.sky,moonSign:ctx.moonSign||null,past:!!ctx.past,note:ctx.note||null}})});
  if(!r.ok)throw new Error('reading '+r.status);
  const d=await r.json();
  return (d.text||'').trim();
}
/* escape external text before it joins innerHTML — model output, geocoder rows, cloud rows */
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
/* escape a string embedded inside a single-quoted inline handler — backslashes first */
const jsq=s=>String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
function aiHTML(t){
  t=esc(t);
  const move=t.match(/the move:([\s\S]*)$/i);
  const body=move?t.slice(0,t.toLowerCase().lastIndexOf('the move:')):t;
  return body.trim().split(/\n\n+/).map(p=>`<p>${p.trim()}</p>`).join('')+
    (move?`<div class="mv" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--accent)"><b class="cap" style="font-size:9px;color:var(--deep);display:block;margin-bottom:3px">the move</b>${move[1].trim()}</div>`:'');
}


/* ══════════ THE SPREADS — from the prototype, verbatim ══════════ */
const SPREADS=[
 {c:'love & connection',s:[
  {n:'obsession or destiny?',v:'because girl',lay:[[1],[2,3],[4],[5,6],[7]],
   p:['why i\'m drawn in','what feels magnetic','what feels dangerous','lesson','fantasy','reality','fate of connection']},
  {n:'the trust issues spread',v:'before you let anybody in',lay:[[1,2],[3,4],[5]],
   p:['what my gut already said','what the evidence says','what i want to believe','what betrayal taught me','what trusting safely looks like']},
  {n:'red flag, soulmate, or both?',v:'◈',lay:[[1],[2,3],[4,5],[6]],
   p:['the pull','the red flag','the real soul contract','how they change me','how i change them','verdict']},
  {n:'the attachment audit',v:'for when you need your brain back',lay:[[1,2],[3,4],[5]],
   p:['what i\'m actually attached to','what it feeds in me','what detaching would free','what detaching would cost','healthiest version of this bond']}]},
 {c:'emotional & healing',s:[
  {n:'the damage report',v:'for emotional chaos',lay:[[1],[2,3,4],[5],[6,7,8]],
   p:['what triggered me','what pissed me off','what hurt me','what scared me','what i need','what action helps','what action hurts','where my power actually is']},
  {n:'why am i like this?',v:'asked with love, and exhaustion.',lay:[[1],[2,3],[4,5]],
   p:['the pattern','where it started','what it protects me from','what it costs me now','who i am without it']},
  {n:'the come to jesus meeting',v:'self-accountability, with love',lay:[[1],[2,3],[4,5]],
   p:['what i already know','the excuse i keep using','the receipts against the excuse','the honest next move','what self-respect does here']}]},
 {c:'clarity & confusion',s:[
  {n:'the "what the fuck is really going on?" spread',v:'when everyone is talking and none of it makes sense',lay:[[1],[2,3],[4],[5,6],[7]],
   p:['surface story','what they\'re saying','what they\'re hiding','the actual truth','what i know already','what i refuse to see','what happens if i stop chasing answers']},
  {n:'the vibes are off',v:'because sometimes that\'s the whole reading',lay:[[1,2],[3,4]],
   p:['what\'s actually off','whose energy it is','what it wants from me','how to clear it']},
  {n:'who invited this energy?',v:'for sudden shifts and uninvited moods',lay:[[1,2],[3,4],[5]],
   p:['the energy that walked in','where it came from','what it\'s here to stir up','how to show it the door','what protection to leave on']}]},
 {c:'direction & decisions',s:[
  {n:'the road opener',v:'when life feels stuck',lay:[[1,2,3],[4,5,6],[7]],
   p:['current cage','who built it','why i\'m still inside','exit door','resource appearing','opportunity approaching','first leap']},
  {n:'is it time to go yet?',v:'girl.',lay:[[1,2],[3],[4,5]],
   p:['what i\'ve outgrown','what\'s actually keeping me','the cost of staying','the cost of leaving','what freedom does with me next']},
  {n:'emergency contact with destiny',v:'for big decisions on a clock',lay:[[1],[2,3],[4,5],[6]],
   p:['the call being placed','what destiny is offering','what it\'s asking in exchange','what fear wants me to do','what fate wants me to do','the message to call back with']},
  {n:'the plot twist',v:'when the story just turned',lay:[[1,2],[3],[4,5]],
   p:['what i thought was happening','what was actually happening','the twist itself','who i become because of it','next chapter\'s opening line']}]},
 {c:'growth & lessons',s:[
  {n:'what is this trying to teach me?',v:'for difficult people',lay:[[1],[2],[3],[4],[5]],
   p:['why this person appeared','what contract is being activated','what lesson is repeating','what balance looks like','how i graduate from this cycle']},
  {n:'the exit exam',v:'proving you learned it so you never repeat it',lay:[[1],[2,3],[4],[5]],
   p:['the lesson this cycle held','how i used to respond','how i respond now','what grade the universe gives me','what unlocks after graduation']},
  {n:'the lore update',v:'for life-chapter readings',lay:[[1],[2,3,4],[5]],
   p:['the chapter that just closed','main quest now','side quest worth taking','side quest that\'s a trap','how this chapter gets titled']}]},
 {c:'power & self',s:[
  {n:'the empress of chaos',v:'llcs, passwords, custody, three notebooks, seventeen tabs — and somehow all of it matters',lay:[[1],[2,3],[4,5,6],[7,8],[9]],
   p:['main storyline','what needs attention now','what feels urgent but isn\'t','resource','centerpiece issue','hidden support','next move','biggest distraction','outcome if i trust myself']},
  {n:'the hellraiser',v:'for reinvention eras — phoenix in a burning office chair',lay:[[1],[2,3],[4,5,6],[7,8],[9]],
   p:['what is dying','what is leaving','what is arriving','power i forgot','true identity','future self message','next chapter','what opens the gate','what i\'m becoming']},
  {n:'the audacity spread',v:'tell me jupiter in sag doesn\'t deserve this',lay:[[1],[2,3],[4,5]],
   p:['what i\'m too humble about','the audacity being asked of me','who clutches pearls when i do it','what expands when i do it anyway','the crown at the end']},
  {n:'main character energy assessment',v:'jupiter on the midheaven says be seen',lay:[[1],[2,3],[4],[5]],
   p:['current storyline','where i\'m playing an extra','where i\'m already the lead','plot armor i forgot i have','next scene to claim']}]},
 {c:'intuition & signs',s:[
  {n:'psychic weather report',v:'for vibes, not events. vibes.',lay:[[1],[2,3],[4,5,6],[7]],
   p:['what energy is entering','what i\'m absorbing','what isn\'t mine','what wants release','what spirit is highlighting','what wants attention','theme of the next month']},
  {n:'the universe keeps leaving voicemails',v:'for the sign you keep ignoring',lay:[[1],[2,3],[4],[5]],
   p:['the message i keep missing','how it\'s been arriving','why i keep declining the call','what happens when i finally answer','the callback number (first step)']}]}];
const ALLSPR=SPREADS.flatMap(g=>g.s);
const findSpr=n=>ALLSPR.find(s=>s.n===n);

/* draw the layout exactly as laid — rows of numbered slots */
function sprLay(sp,cards){
  return `<div class="sgrid">${sp.lay.map(row=>
    `<div class="srow">${row.map(i=>{
      const c=cards&&cards[i-1];
      return `<div class="sbox${c?' filled':''}">${c?`<img src="${IMG[c.k]}" class="${c.rev?'rv':''}">`:i}</div>`;
    }).join('')}</div>`).join('')}</div>`;
}

/* ══════════ SPREAD LAYOUTS (real card positions) ══════════ */
function openSpread(name){
  const sp=findSpr(name);
  const past=S.entries.filter(e=>e.type==='pull'&&e.title===name&&e.cards&&e.cards.length);
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✦ · the spread · ✦</div>
    <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">${sp.n}</div>
    <div style="font-size:12px;color:var(--dust);text-align:center;margin-top:3px;font-style:italic">${sp.v}</div>
    ${sprLay(sp,past[0]?past[0].cards:null)}
    <ol class="spos">${sp.p.map(p=>`<li>${p}</li>`).join('')}</ol>
    ${past.length?`<div class="lab">you've pulled this ${past.length}×</div>${past.slice(0,2).map(entHTML).join('')}`:''}
    <button class="btn" onclick="closeSheet();openPull(0,'${jsq(name)}')">✦ lay it down</button>`);
}

/* ══════════ CARD SHEET ══════════ */
function openCard(k,rev){
  const c=byKey(k);
  sheet(`<div class="gb"></div>
    <img class="ci${rev?' rev':''}" id="ci" src="${IMG[k]||''}" alt="${c.n}">
    <div class="cn sf">${c.n}${rev?' ⟲':''}</div>
    <div class="ca cap">${c.a}</div>
    <div class="kw"><div><div class="k">upright</div><p>${c.up}</p></div><div><div class="k r">reversed</div><p>${c.rv}</p></div></div>
    <div class="fort sf">&ldquo;${c.f}&rdquo;</div>
    <button class="btn" onclick="document.getElementById('ci').classList.toggle('rev')">⟲ flip it</button>
    <button class="btn g" onclick="closeSheet();openPull(0,null,'${k}')">＋ log this card</button>`);
}

/* ══════════ LOG A PULL ══════════ */
let pullSel=[],pullPhotos=[];
function openPull(past,spread,pre){
  pullSel=pre?[{k:pre,rev:false}]:[];pullPhotos=[];
  const today=key(new Date());
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✦ · ${past?'restore the record':'log a pull'} · ✦</div>
    <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">${past?'a past night':'what came up'}</div>
    <div style="font-size:12px;color:var(--dust);text-align:center;margin-top:4px">${spread?'spread · '+esc(spread):'photo it, or pick it ✦'}</div>
    <div class="ob-f" style="margin-top:14px">
      <input id="puD" type="date" value="${today}">
      <input id="puT" placeholder="what was the question?">
    </div>
    <div class="lab" style="margin:16px 0 6px">◉ snap it</div>
    <label class="up"><input type="file" id="puF" accept="image/*" multiple hidden>
      <div class="g">◉</div><div class="t">snap the spread</div><div class="s">as you laid it ✦</div></label>
    <div class="prev" id="puP"></div>
    <div class="lab" style="margin:16px 0 6px">✦ or pick the cards</div>
    <input id="puS" placeholder="search the deck…" oninput="renderPick()">
    <div class="selr" id="puSel"></div>
    <div class="pick" id="puPick"></div>
    <div class="hint">tap to add · again to reverse ⟲</div>
    <div class="lab" style="margin:14px 0 6px">❦ the read</div>
    <textarea id="puN" rows="3" placeholder="what did it say?"></textarea>
    <button class="btn" onclick="savePull('${spread||''}')">✦ into the book</button>`);
  document.getElementById('puF').onchange=e=>{
    [...e.target.files].forEach(f=>{const r=new FileReader();r.onload=x=>{pullPhotos.push(x.target.result);
      document.getElementById('puP').innerHTML=pullPhotos.map(p=>`<img src="${p}">`).join('');};r.readAsDataURL(f);});};
  renderPick();
}
function renderPick(){
  const q=(document.getElementById('puS')?.value||'').toLowerCase();
  const L=DECK.filter(c=>!q||c.n.includes(q));
  document.getElementById('puPick').innerHTML=L.map(c=>{
    const s=pullSel.find(x=>x.k===c.k);
    return `<button class="tc${s?' sel':''}${s&&s.rev?' rev':''}" onclick="tapCard('${c.k}')"><img src="${IMG[c.k]||''}" loading="lazy"><span class="rb">⟲</span></button>`;}).join('');
  document.getElementById('puSel').innerHTML=pullSel.map((s,i)=>
    `<span class="sc"><img src="${IMG[s.k]}" class="${s.rev?'rv':''}"><span class="x" onclick="pullSel.splice(${i},1);renderPick()">×</span></span>`).join('');
}
function tapCard(k){
  const i=pullSel.findIndex(x=>x.k===k);
  if(i<0)pullSel.push({k,rev:false});
  else if(!pullSel[i].rev)pullSel[i].rev=true;
  else pullSel.splice(i,1);
  renderPick();
}
async function savePull(spread){
  const d=document.getElementById('puD').value||key(new Date());
  if(!pullSel.length&&!pullPhotos.length)return toast('pick a card or snap the spread ✦');
  const dt=parse(d),p=phase(dt),si=signOf(moonLon(dt));
  const skyStr=`${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}`;
  const isPast=d<key(new Date());
  const sp=findSpr(spread);
  const e={id:Date.now(),date:d,type:'pull',
    title:document.getElementById('puT').value||(spread||'a pull'),
    body:document.getElementById('puN').value,
    photos:[...pullPhotos],cards:[...pullSel],spread:spread||null,sky:skyStr,ai:null};
  S.entries.unshift(e);

  /* show the sheet in "reading" state immediately */
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✦ · ${isPast?'restored to the record':'into the book'} · ✦</div>
    <div class="sf" style="font-size:23px;text-align:center;margin-top:3px">${e.title}</div>
    <div style="font-size:11.5px;color:var(--dust);text-align:center;margin-top:3px">${fmt(dt)} · ${skyStr}</div>
    ${sp&&pullSel.length?sprLay(sp,pullSel)+`<ol class="spos">${sp.p.map((p,i)=>`<li>${p}${pullSel[i]?' — <b>'+byKey(pullSel[i].k).n+(pullSel[i].rev?' ⟲':'')+'</b>':''}</li>`).join('')}</ol>`:`<div class="selr" style="justify-content:center;margin-top:14px">${pullSel.map(c=>`<span class="sc"><img src="${IMG[c.k]}" class="${c.rev?'rv':''}" style="width:56px"></span>`).join('')}</div>`}
    ${pullPhotos.length?`<div class="prev" style="justify-content:center">${pullPhotos.map(p=>`<img src="${p}">`).join('')}</div>`:''}
    <div class="airead" id="aiBox">
      <div class="al">✦ the read</div>
      <div class="load"><span class="sp"></span>reading the cards against that night's sky…</div>
    </div>
    <button class="btn g" onclick="closeSheet()">done ✦</button>`);
  renderGrim();renderJournal();renderCal();

  if(!pullSel.length){
    document.getElementById('aiBox').innerHTML=`<div class="al">✦ the read</div><p>photo's in the book. add the cards and i'll read it for you.</p>`;
    return;
  }
  try{
    const txt=await getReading(pullSel,{spread,positions:sp?sp.p:null,q:e.title,date:fmtL(dt),
      sky:skyStr,moonSign:SIGNS[si],past:isPast,note:e.body});
    e.ai=txt;
    const box=document.getElementById('aiBox');
    if(box)box.innerHTML=`<div class="al">✦ the read</div>${aiHTML(txt)}`;
    renderJournal();renderCal();
    toast('✦ read, logged, and on the calendar');
  }catch(err){
    const box=document.getElementById('aiBox');
    if(box)box.innerHTML=`<div class="al">✦ the read</div><p>couldn't reach the read right now — the cards are still saved. tap the entry later to try again.</p>`;
  }
}
function rereadEntry(id){
  const e=S.entries.find(x=>x.id===id);
  if(!e||!e.cards||!e.cards.length)return toast('no cards on that one ✦');
  const dt=parse(e.date),si=signOf(moonLon(dt));
  const sp=findSpr(e.spread);
  sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✦ · the read · ✦</div>
    <div class="sf" style="font-size:23px;text-align:center;margin-top:3px">${esc(e.title)}</div>
    <div style="font-size:11.5px;color:var(--dust);text-align:center;margin-top:3px">${fmt(dt)} · ${e.sky||''}</div>
    ${sp?sprLay(sp,e.cards)+`<ol class="spos">${sp.p.map((p,i)=>`<li>${p}${e.cards[i]?' — <b>'+byKey(e.cards[i].k).n+(e.cards[i].rev?' ⟲':'')+'</b>':''}</li>`).join('')}</ol>`:`<div class="selr" style="justify-content:center;margin-top:14px">${e.cards.map(c=>`<span class="sc"><img src="${IMG[c.k]}" class="${c.rev?'rv':''}" style="width:56px"></span>`).join('')}</div>`}
    <div class="airead" id="aiBox"><div class="al">✦ the read</div>
      ${e.ai?aiHTML(e.ai):'<div class="load"><span class="sp"></span>reading it now…</div>'}</div>
    ${e.ai?'':''}<button class="btn g" onclick="closeSheet()">done ✦</button>`);
  if(e.ai)return;
  getReading(e.cards,{spread:e.spread,positions:sp?sp.p:null,q:e.title,date:fmtL(dt),
    sky:e.sky,moonSign:SIGNS[si],past:e.date<key(new Date()),note:e.body})
    .then(txt=>{e.ai=txt;const b=document.getElementById('aiBox');
      if(b)b.innerHTML=`<div class="al">✦ the read</div>${aiHTML(txt)}`;renderJournal();})
    .catch(()=>{const b=document.getElementById('aiBox');if(b)b.innerHTML=`<div class="al">✦ the read</div><p>couldn't reach it. try again in a sec ✧</p>`;});
}

/* ══════════ ENTRIES ══════════ */
let entPhotos=[], interSel=null, interWho=null;

/* ── log an interaction with someone in orbit (intimacy, contact, conflict…) */
function openInter(who,kind){
  interWho=who||null; interSel=kind||'intimacy'; entPhotos=[];
  const d=new Date(),p=phase(d),si=signOf(moonLon(d));
  const cs=cycleSpell(d);
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">◉ · entanglement · ◉</div>
    <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">${who?'with '+esc(who):'log an interaction'}</div>
    <div style="font-size:11.5px;color:var(--dust);text-align:center;margin-top:3px">${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}${cs?' · '+cs.phase:''}</div>
    ${!who?`<div class="lab">who</div><div class="pchip" id="iWho">${S.people.map(pp=>
      `<button onclick="interWho='${esc(jsq(pp.name))}';document.querySelectorAll('#iWho button').forEach(b=>b.classList.remove('on'));this.classList.add('on')">
        <span class="av">${esc(pp.name[0])}</span>${esc(pp.name)}</button>`).join('')||'<div style="font-size:12.5px;color:var(--dust)">add someone to orbit first ☍</div>'}</div>`:''}
    <div class="lab">what happened</div>
    <div class="ilog" id="iKind">${INTER.map(t=>
      `<button class="${t[1]===interSel?'on':''}" onclick="interSel='${t[1]}';document.querySelectorAll('#iKind button').forEach(b=>b.classList.remove('on'));this.classList.add('on');document.getElementById('iX').innerHTML=interExtra()">
        <div class="g">${t[0]}</div><div class="n">${t[1]}</div></button>`).join('')}</div>
    <div id="iX">${interExtra()}</div>
    <div class="ob-f" style="margin-top:12px">
      <input id="iD" type="date" value="${key(new Date())}">
      <textarea id="iB" rows="3" placeholder="what actually happened…"></textarea>
    </div>
    <label class="up"><input type="file" id="iF" accept="image/*" multiple hidden>
      <div class="g">◉</div><div class="t">add photos</div><div class="s">screenshots · receipts · signs</div></label>
    <div class="prev" id="iP"></div>
    <button class="btn" onclick="saveInter()">◉ into the record</button>`);
  const f=document.getElementById('iF');
  if(f)f.onchange=e=>{[...e.target.files].forEach(x=>{const r=new FileReader();r.onload=v=>{entPhotos.push(v.target.result);
    document.getElementById('iP').innerHTML=entPhotos.map(q=>`<img src="${q}">`).join('');};r.readAsDataURL(x);});};
}
function interExtra(){
  if(interSel==='intimacy')return `<div class="lab">the details</div>
    <div class="card"><div style="font-size:11px;font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);font-weight:600">protection</div>
      <div class="chips" id="iProt">${PROTECT.map((x,i)=>`<button class="chip${i===0?'':''}" onclick="document.querySelectorAll('#iProt button').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${x}</button>`).join('')}</div>
      <div style="font-size:11px;font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);font-weight:600;margin-top:13px">how you felt after</div>
      <div class="chips" id="iFeel">${FEELS.map(x=>`<button class="chip" onclick="this.classList.toggle('on')">${x}</button>`).join('')}</div></div>`;
  if(interSel==='conflict'||interSel==='distance')return `<div class="lab">how it landed</div>
    <div class="card"><div class="chips" id="iFeel">${FEELS.map(x=>`<button class="chip" onclick="this.classList.toggle('on')">${x}</button>`).join('')}</div></div>`;
  return '';
}
function saveInter(){
  if(!interWho)return toast('pick who it was ☍');
  const d=document.getElementById('iD').value||key(new Date());
  const dt=parse(d),p=phase(dt),si=signOf(moonLon(dt));
  const prot=document.querySelector('#iProt button.on');
  const feels=[...document.querySelectorAll('#iFeel button.on')].map(b=>b.textContent);
  const cs=cycleSpell(dt);
  S.entries.unshift({id:Date.now(),date:d,type:'inter',who:interWho,kind:interSel,
    title:`${interSel} · ${interWho}`,body:document.getElementById('iB').value,
    photos:[...entPhotos],cards:[],
    meta:{prot:prot?prot.textContent:null,feels,cycle:cs?cs.phase:null},
    sky:`${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}`});
  closeSheet();toast(`◉ logged · ${phaseName(p)} in ${SIGNS[si]}${cs?' · '+cs.phase:''}`);
  renderJournal();renderCal();renderOrbit();
}

/* ── cycle log: one entry populates the whole month */
function openCycle(){
  const last=S.entries.filter(e=>e.type==='cycle'&&e.cycle).sort((a,b)=>a.date<b.date?1:-1)[0];
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">◉ · venus vs uterus · ◉</div>
    <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">log your cycle</div>
    <div style="font-size:11.5px;color:var(--dust);text-align:center;margin-top:3px">one log fills the whole month ✧</div>
    <div class="ob-f" style="margin-top:14px">
      <div><div style="font-size:11px;font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);font-weight:600;margin-bottom:5px">period started</div>
        <input id="cyS" type="date" value="${last?last.cycle.start:key(new Date())}"></div>
      <div><div style="font-size:11px;font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);font-weight:600;margin-bottom:5px">cycle length · days</div>
        <input id="cyL" type="number" value="${last?last.cycle.len:28}"></div>
      <div><div style="font-size:11px;font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;color:var(--faint);font-weight:600;margin-bottom:5px">period length · days</div>
        <input id="cyD" type="number" value="${last?last.cycle.dur:5}"></div>
    </div>
    <div class="lab">flow</div>
    <div class="chips" id="cyF">${['light','medium','heavy'].map(x=>`<button class="chip" onclick="document.querySelectorAll('#cyF button').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${x}</button>`).join('')}</div>
    <div class="lab">symptoms</div>
    <div class="chips" id="cyY">${['cramps','headache','fatigue','mood','bloating','acne','cravings','insomnia'].map(x=>`<button class="chip" onclick="this.classList.toggle('on')">${x}</button>`).join('')}</div>
    <button class="btn" onclick="saveCycle()">◉ populate my month</button>`);
}
function saveCycle(){
  const st=document.getElementById('cyS').value;
  if(!st)return toast('when did it start? ◉');
  const len=+document.getElementById('cyL').value||28, dur=+document.getElementById('cyD').value||5;
  const flow=document.querySelector('#cyF button.on');
  const sym=[...document.querySelectorAll('#cyY button.on')].map(b=>b.textContent);
  const dt=parse(st),p=phase(dt),si=signOf(moonLon(dt));
  S.entries.unshift({id:Date.now(),date:st,type:'cycle',title:'period started',
    body:`${flow?flow.textContent+' flow':''}${sym.length?' · '+sym.join(', '):''}`,
    photos:[],cards:[],cycle:{start:st,len,dur,flow:flow?flow.textContent:null,sym},
    sky:`${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}`});
  LON.cycle=true;
  closeSheet();
  const ov=len-14, ovd=new Date(dt.getTime()+ov*86400000);
  toast(`◉ month populated · ovulation ~${fmt(ovd)}`);
  renderCal();renderJournal();renderSky();
}

/* ── new entry (note / working) */
function openEntry(dk,who){
  entPhotos=[];
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">❦ · the record · ❦</div>
    <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">new entry</div>
    <div class="seg" id="etype" style="margin-top:14px">
      <button data-t="note" class="on">❦ note</button><button data-t="ritual">✧ working</button>
      <button data-t="inter">◉ someone</button><button data-t="cycle">◉ cycle</button></div>
    <div id="etBody"></div>`);
  document.querySelectorAll('#etype button').forEach(b=>b.onclick=()=>{
    if(b.dataset.t==='inter')return openInter(null,'intimacy');
    if(b.dataset.t==='cycle')return openCycle();
    document.querySelectorAll('#etype button').forEach(x=>x.classList.toggle('on',x===b));
    etBody(dk,who);});
  etBody(dk,who);
}
function etBody(dk,who){
  const t=document.querySelector('#etype button.on').dataset.t;
  document.getElementById('etBody').innerHTML=
   `<div class="ob-f" style="margin-top:12px">
      <input id="enD" type="date" value="${dk||key(new Date())}">
      <input id="enT" placeholder="${t==='ritual'?'which working?':'title'}" value="${who?'about '+who:''}">
      <textarea id="enB" rows="4" placeholder="${who?'what happened with '+who+'?':'what happened…'}"></textarea>
    </div>
    ${S.people.length?`<div class="lab">tag someone</div><div class="pchip" id="enW">${S.people.map(p=>
      `<button class="${who===p.name?'on':''}" onclick="document.querySelectorAll('#enW button').forEach(b=>b.classList.remove('on'));this.classList.add('on')">
        <span class="av">${p.name[0]}</span>${p.name}</button>`).join('')}</div>`:''}
    <label class="up"><input type="file" id="enF" accept="image/*" multiple hidden>
      <div class="g">◉</div><div class="t">add photos</div><div class="s">spreads · altars · signs</div></label>
    <div class="prev" id="enP"></div>
    <button class="btn" onclick="saveEntry()">❦ into the book</button>`;
  document.getElementById('enF').onchange=e=>{
    [...e.target.files].forEach(f=>{const r=new FileReader();r.onload=x=>{entPhotos.push(x.target.result);
      document.getElementById('enP').innerHTML=entPhotos.map(p=>`<img src="${p}">`).join('');};r.readAsDataURL(f);});};
}
function saveEntry(){
  const t=document.querySelector('#etype button.on').dataset.t;
  const d=document.getElementById('enD').value||key(new Date());
  const b=document.getElementById('enB').value.trim();
  if(!b&&!entPhotos.length)return toast('write something or add a photo ❦');
  const dt=parse(d),p=phase(dt),si=signOf(moonLon(dt));
  const w=document.querySelector('#enW button.on');
  S.entries.unshift({id:Date.now(),date:d,type:t,title:document.getElementById('enT').value||t,body:b,
    photos:[...entPhotos],cards:[],who:w?w.textContent.trim():null,
    sky:`${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}`});
  closeSheet();toast('❦ logged — stamped with that night\'s sky');
  renderJournal();renderGrim();renderOrbit();renderCal();
}

const EG={note:'❦',pull:'✦',ritual:'✧',cycle:'◉',inter:'◉',sex:'◉'};
function entHTML(e){
  return `<div class="ent"><div class="eh"><span class="g">${EG[e.type]||'❦'}</span>
      <div><div class="d">${fmt(parse(e.date))} · ${e.type}</div></div>
      <span class="sky">${e.sky||''}</span></div>
    ${e.title?`<div class="tt">${esc(e.title)}</div>`:''}
    ${e.body?`<div class="bd">${esc(e.body)}</div>`:''}
    ${e.cards&&e.cards.length?`<div class="cds">${e.cards.map(c=>`<img src="${IMG[c.k]}" class="${c.rev?'rv':''}" title="${byKey(c.k).n}">`).join('')}</div>`:''}
    ${e.photos&&e.photos.length?`<div class="ph">${e.photos.map(p=>`<img src="${p}">`).join('')}</div>`:''}
    ${e.meta&&(e.meta.prot||(e.meta.feels&&e.meta.feels.length))?`<div class="chips" style="margin-top:8px">
      ${e.meta.prot?`<span class="tag">${e.meta.prot}</span>`:''}
      ${(e.meta.feels||[]).map(f=>`<span class="tag">${f}</span>`).join('')}
      ${e.meta.cycle?`<span class="tag">◉ ${e.meta.cycle}</span>`:''}</div>`:''}
    ${e.who?`<div style="font-size:10px;color:var(--faint);margin-top:7px;font-family:var(--caps);letter-spacing:.16em;text-transform:uppercase;font-weight:600">☍ ${esc(e.who)}</div>`:''}
    ${e.ai?`<div class="ai"><div class="al">✦ the read</div>${esc(e.ai.split(/\n\n+/)[0])}</div>`:''}
    ${e.cards&&e.cards.length?`<button class="btn g sm" style="margin-top:9px" onclick="rereadEntry(${e.id})">${e.ai?'✦ the full read':'✦ read these cards'}</button>`:''}</div>`;
}
function renderJournal(){
  const c=S.jcursor;
  document.getElementById('jTitle').textContent=c.toLocaleDateString('en-us',{month:'long',year:'numeric'}).toLowerCase();
  const first=new Date(c.getFullYear(),c.getMonth(),1),pad=first.getDay(),dim=new Date(c.getFullYear(),c.getMonth()+1,0).getDate();
  let h='';for(let i=0;i<pad;i++)h+='<div class="cell pad"></div>';
  const tk=key(new Date());
  for(let dd=1;dd<=dim;dd++){
    const d=new Date(c.getFullYear(),c.getMonth(),dd),k=key(d);
    const es=S.entries.filter(e=>e.date===k);
    const pulls=es.filter(e=>e.type==='pull'&&e.cards&&e.cards.length);
    h+=`<button class="cell${k===tk?' tod':''}" onclick="jPick('${k}')">
      ${pulls.length?`<img src="${IMG[pulls[0].cards[0].k]}" style="position:absolute;inset:2px;width:calc(100% - 4px);height:calc(100% - 4px);object-fit:cover;border-radius:9px;opacity:.42">`:''}
      <span class="dn" style="position:relative">${dd}</span>
      <span class="pips" style="position:relative">${[...new Set(es.map(e=>e.type))].slice(0,4).map(t=>`<span class="pip" style="background:var(--accent)"></span>`).join('')}</span></button>`;
  }
  document.getElementById('jGrid').innerHTML=h;
  const F=['all','note','pull','ritual','inter','cycle'];
  document.getElementById('jFilter').innerHTML=F.map(f=>`<button class="chip${S.jfilter===f?' on':''}" onclick="S.jfilter='${f}';renderJournal()">${f==='all'?'all':(EG[f]+' '+f)}</button>`).join('');
  const list=S.entries.filter(e=>S.jfilter==='all'||e.type===S.jfilter);
  document.getElementById('jLab').textContent=`${list.length} ${list.length===1?'entry':'entries'}`;
  document.getElementById('jList').innerHTML=list.length?list.map(entHTML).join('')
    :`<div class="card"><div class="empty"><div class="eg">❦</div><div class="et">the book is empty</div>
       <div class="ed">meet the moment you were meant for ❦</div>
       <button class="btn" onclick="openEntry()">write the first one</button></div></div>`;
}
function jShift(n){S.jcursor=new Date(S.jcursor.getFullYear(),S.jcursor.getMonth()+n,1);renderJournal();}
function jPick(k){const es=S.entries.filter(e=>e.date===k);if(!es.length)return openEntry(k);
  sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">❦ · ${fmt(parse(k))} · ❦</div>
    <div class="sf" style="font-size:22px;text-align:center;margin-top:3px">${es.length} ${es.length===1?'entry':'entries'}</div>
    ${es.map(entHTML).join('')}<button class="btn g" onclick="closeSheet();openEntry('${k}')">＋ add another</button>`);}

/* ══════════ NATAL ══════════ */
const PMEAN={sun:['identity','the thing you\'re built to become. the center of the wheel.'],
 moon:['needs','what you actually need to feel safe. not what you say you need.'],
 mercury:['the mouth & the brain','how you think, text, argue, and process.'],
 venus:['love & money','what you\'re drawn to, and what you think you\'re worth.'],
 mars:['drive & anger','how you go after it. and how you fight when you don\'t get it.'],
 jupiter:['luck & excess','where it comes easy — and where you overdo it.'],
 saturn:['the lesson','the hard one. it hurts here first, then it becomes your spine.'],
 uranus:['the break','where you refuse to be normal.'],
 neptune:['the fog','where you dream, and where you delude.'],
 pluto:['the deep','what dies and rebuilds. repeatedly.']};

function renderNatal(){
  if(!S.me.date){document.getElementById('natalSub').textContent='meet the moment you were meant for';
    document.getElementById('wheelWrap').innerHTML='<div class="empty"><div class="eg">☉</div><div class="et">cast your chart first</div><div class="ed">decode the sky. direct your life. ✧</div><button class="btn" onclick="obReplay()">cast it</button></div>';
    document.getElementById('natalRows').innerHTML='';document.getElementById('natalPromise').textContent='';return;}
  const [yy,mo,dd]=S.me.date.split('-').map(Number);
  const [hh,mi]=(S.me.time||'12:00').split(':').map(Number);
  const d=new Date(yy,mo-1,dd,hh||12,mi||0);
  const pos={};Object.keys(PL).forEach(k=>pos[k]=PL[k](d));
  const A=cloudAngles()||angles(S.me.date,S.me.time,S.me.lat,S.me.lon,meTz());
  document.getElementById('natalSub').innerHTML=`${S.me.date} · ${S.me.time||'—'} · ${S.me.place||'—'}`;

  /* ── professional wheel: zodiac band · tick ring · planet zone · house band · aspect web ──
     every stroke and fill is a theme token, so the wheel re-tints with the ribbon. */
  const C=155,S1=146,Zi=124,Ho=62,Hi=46;
  const rot=A?A.asc:0;                         /* ASC pinned left (9 o'clock) */
  const ang=lon=>(180-(lon-rot))*Math.PI/180;
  const dm=x=>{const dg=Math.floor(degIn(x)),mi=Math.round((degIn(x)%1)*60);return `${dg}°${String(mi).padStart(2,'0')}′`;};
  let w=`<svg class="wheel" width="310" height="310" viewBox="0 0 310 310">
    <circle cx="${C}" cy="${C}" r="${S1}" fill="none" stroke="var(--line)"/>
    <circle cx="${C}" cy="${C}" r="${Zi}" fill="none" stroke="var(--line)"/>
    <circle cx="${C}" cy="${C}" r="${Ho}" fill="none" stroke="var(--line)"/>
    <circle cx="${C}" cy="${C}" r="${Hi}" fill="none" stroke="var(--line)"/>`;
  /* zodiac band: boundaries + sign glyphs */
  for(let i=0;i<12;i++){
    const a=ang(i*30), am=ang(i*30+15);
    w+=`<line x1="${C+Math.cos(a)*Zi}" y1="${C-Math.sin(a)*Zi}" x2="${C+Math.cos(a)*S1}" y2="${C-Math.sin(a)*S1}" stroke="var(--line)"/>`;
    w+=`<text x="${C+Math.cos(am)*((S1+Zi)/2)}" y="${C-Math.sin(am)*((S1+Zi)/2)+4.5}" text-anchor="middle" font-size="13" fill="var(--dust)" opacity=".9" class="zg">${GLY[i]}</text>`;
  }
  /* degree ticks on the zodiac band's inner edge: 5° minor, 10° major */
  for(let dg=0;dg<360;dg+=5){
    const a=ang(dg), len=dg%10===0?5:3;
    w+=`<line x1="${C+Math.cos(a)*Zi}" y1="${C-Math.sin(a)*Zi}" x2="${C+Math.cos(a)*(Zi+len)}" y2="${C-Math.sin(a)*(Zi+len)}" stroke="var(--line)" stroke-width=".5" opacity=".8"/>`;
  }
  if(A){
    /* house cusps through the planet zone, angular cusps carry the accent */
    A.H.forEach((cusp,i)=>{const a=ang(cusp), major=(i%3===0);
      w+=`<line x1="${C+Math.cos(a)*Hi}" y1="${C-Math.sin(a)*Hi}" x2="${C+Math.cos(a)*Zi}" y2="${C-Math.sin(a)*Zi}" stroke="var(--${major?'accent':'line'})" stroke-width="${major?1.4:.6}" opacity="${major?.85:.6}"/>`;
      /* cusp degree°minute just inside the zodiac band */
      const lx=C+Math.cos(a)*(Zi-11), ly=C-Math.sin(a)*(Zi-11);
      w+=`<text x="${lx}" y="${ly+2.5}" text-anchor="middle" font-size="6" fill="var(--faint)">${dm(cusp)}</text>`;
      /* house number in its own band, at the house midpoint */
      const amid=ang(cusp+nm(A.H[(i+1)%12]-cusp)/2);
      w+=`<text x="${C+Math.cos(amid)*((Ho+Hi)/2)}" y="${C-Math.sin(amid)*((Ho+Hi)/2)+3}" text-anchor="middle" font-size="8.5" fill="var(--dust)">${i+1}</text>`;});
    /* the four angles, named */
    [[0,'AS'],[9,'MC'],[6,'DS'],[3,'IC']].forEach(([i,lb])=>{const a=ang(A.H[i]);
      w+=`<text x="${C+Math.cos(a)*(S1+6)}" y="${C-Math.sin(a)*(S1+6)+3}" text-anchor="middle" font-size="8" font-weight="700" fill="var(--deep)">${lb}</text>`;});
    /* ASC arrow */
    const aa=ang(A.H[0]);
    w+=`<text x="${C+Math.cos(aa)*(Zi+9)}" y="${C-Math.sin(aa)*(Zi+9)+3.5}" text-anchor="middle" font-size="9" fill="var(--deep)">◀</text>`;
  }
  /* planets: exact-degree tick + glyph + degree label + retrograde mark */
  const keys=Object.keys(pos).sort((a,b)=>pos[a]-pos[b]), used=[];
  keys.forEach(k=>{const lon=pos[k];let ring=Zi-22;
    while(used.some(u=>Math.abs(nm(u.l-lon))<10&&Math.abs(u.r-ring)<15))ring-=19;
    used.push({l:lon,r:ring});
    const a=ang(lon), x=C+Math.cos(a)*ring, y=C-Math.sin(a)*ring;
    w+=`<line x1="${C+Math.cos(a)*Zi}" y1="${C-Math.sin(a)*Zi}" x2="${C+Math.cos(a)*(Zi-5)}" y2="${C-Math.sin(a)*(Zi-5)}" stroke="var(--accent)" stroke-width="1.4"/>`;
    w+=`<text x="${x}" y="${y+4.5}" text-anchor="middle" font-size="13.5" fill="var(--accent)" class="zg">${PGL[k]}</text>`;
    w+=`<text x="${x}" y="${y+13.5}" text-anchor="middle" font-size="5.8" fill="var(--faint)">${dm(lon)}${isRx(k,d)?' ℞':''}</text>`;});
  /* aspect web, tonal: accent = flow, deep = friction, dash = sextile/opposition */
  keys.forEach((a,i)=>keys.slice(i+1).forEach(b=>{
    let df=Math.abs(pos[a]-pos[b])%360; if(df>180)df=360-df;
    let col=null,dash=null;
    if(Math.abs(df-120)<6)col='var(--accent)';
    else if(Math.abs(df-90)<6)col='var(--deep)';
    else if(Math.abs(df-180)<6){col='var(--deep)';dash='4 3';}
    else if(Math.abs(df-60)<4){col='var(--accent)';dash='3 3';}
    if(col){const a1=ang(pos[a]),a2=ang(pos[b]);
      w+=`<line x1="${C+Math.cos(a1)*Hi}" y1="${C-Math.sin(a1)*Hi}" x2="${C+Math.cos(a2)*Hi}" y2="${C-Math.sin(a2)*Hi}" stroke="${col}" stroke-width=".8" opacity=".55"${dash?` stroke-dasharray="${dash}"`:''}/>`;}}));
  w+=`<circle cx="${C}" cy="${C}" r="2.5" fill="var(--accent)"/></svg>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:8px;font-size:9.5px;color:var(--faint);font-family:var(--caps);letter-spacing:.12em;text-transform:uppercase">
      <span style="color:var(--accent)">— trine</span><span style="color:var(--accent)">┄ sextile</span><span style="color:var(--deep)">— square</span><span style="color:var(--deep)">┄ opposition</span></div>`;
  document.getElementById('wheelWrap').innerHTML=w;

  const rows=[];
  if(A){rows.push(['↑','ascendant',`${SIGNS[signOf(A.asc)]} ${GLY[signOf(A.asc)]} · ${degIn(A.asc).toFixed(1)}°`,'the mask, the body, the first impression. sets every house.']);
        rows.push(['MC','midheaven',`${SIGNS[signOf(A.mc)]} ${GLY[signOf(A.mc)]} · ${degIn(A.mc).toFixed(1)}°`,'the career, the reputation, what you\'re known for.']);}
  Object.keys(PL).forEach(k=>{const lon=pos[k],si=signOf(lon),hs=A?houseOf(lon,A):null,rx=isRx(k,d);
    rows.push([PGL[k],k+(rx?' ℞':''),`${SIGNS[si]} ${GLY[si]} · ${degIn(lon).toFixed(1)}°${hs?' · '+hs+'th house':''}`,
      `${PMEAN[k][1]} yours sits in ${SIGNS[si]} — ${SIGN_READ[SIGNS[si]][1]}${hs?' playing out in the '+hs+'th house.':''}${rx?' retrograde at birth — it works inward first.':''}`]);});
  document.getElementById('natalRows').innerHTML=rows.map(r=>
   `<div class="ex"><button class="exh" onclick="this.parentElement.classList.toggle('open')">
      <span class="g" style="font-size:${r[0].length>1?'11':'15'}px">${r[0]}</span>
      <span><span class="a">${r[1]}</span><div class="b">${r[2]}</div></span><span class="c">›</span></button>
      <div class="exb"><p>${r[3]}</p></div></div>`).join('');

  const ss=signOf(pos.sun), ms=signOf(pos.moon);
  document.getElementById('natalPromise').innerHTML=
   `your sun's in <b>${SIGNS[ss]}</b>, your moon's in <b>${SIGNS[ms]}</b>${A?`, rising <b>${SIGNS[signOf(A.asc)]}</b>`:''} — ${ss===ms?'the same department. rare.':'running on different frequencies. that\'s the tension the whole chart is asking you to metabolize.'} ${SIGN_READ[SIGNS[ms]][1]}`;
}

/* ══════════ ME ══════════ */
function renderMe(){
  document.getElementById('meSw').innerHTML=swHTML();
  const tn=document.getElementById('thName');if(tn)tn.textContent='· '+THEMES[S.accent][0];
  document.getElementById('meName').innerHTML=esc(S.me.name||'you')+'<span class="k">✦</span>';
  document.getElementById('meSub').textContent=S.me.date?`${S.me.date} · ${S.me.time||'—'} · ${S.me.place||'—'}`:'the cosmos, made personal';
  const bd=document.getElementById('bdVal');if(bd)bd.textContent=(S.me.date||'add it')+' ›';
  const lv=document.getElementById('layVal');if(lv)lv.textContent=Object.values(LON).filter(Boolean).length+' on ›';
  if(S.me.date){const d=parse(S.me.date);
    document.getElementById('meBig3').textContent=`☉ ${SIGNS[signOf(sunLon(d))]} · ☽ ${SIGNS[signOf(moonLon(d))]}`;}
  Object.keys(S.set).forEach(k=>{const e=document.getElementById('t-'+k);if(e)e.checked=!!S.set[k];});
}
function exportBook(){
  const blob=new Blob([JSON.stringify({me:S.me,people:S.people,entries:S.entries,cal:S.cal},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='the-book.json';a.click();
  toast('↓ exported. it\'s yours forever.');
}

/* ══════════ SHEET ══════════ */
function sheet(h){document.getElementById('sht').innerHTML=h;document.getElementById('scr').classList.add('on');document.getElementById('sht').classList.add('on');}
function closeSheet(){document.getElementById('scr').classList.remove('on');document.getElementById('sht').classList.remove('on');}


/* ══════════ CITY AUTOCOMPLETE ══════════ */
/* offline seed (instant, works with no network) + live geocoder (worldwide) */
const CITY_SEED=[
['new york','ny · united states',40.71,-74.01,'America/New_York'],['los angeles','ca · united states',34.05,-118.24,'America/Los_Angeles'],
['chicago','il · united states',41.88,-87.63,'America/Chicago'],['houston','tx · united states',29.76,-95.37,'America/Chicago'],
['phoenix','az · united states',33.45,-112.07,'America/Phoenix'],['philadelphia','pa · united states',39.95,-75.17,'America/New_York'],
['san antonio','tx · united states',29.42,-98.49,'America/Chicago'],['san diego','ca · united states',32.72,-117.16,'America/Los_Angeles'],
['dallas','tx · united states',32.78,-96.80,'America/Chicago'],['austin','tx · united states',30.27,-97.74,'America/Chicago'],
['san francisco','ca · united states',37.77,-122.42,'America/Los_Angeles'],['seattle','wa · united states',47.61,-122.33,'America/Los_Angeles'],
['denver','co · united states',39.74,-104.99,'America/Denver'],['boston','ma · united states',42.36,-71.06,'America/New_York'],
['atlanta','ga · united states',33.75,-84.39,'America/New_York'],['miami','fl · united states',25.76,-80.19,'America/New_York'],
['detroit','mi · united states',42.33,-83.05,'America/Detroit'],['nashville','tn · united states',36.16,-86.78,'America/Chicago'],
['portland','or · united states',45.52,-122.68,'America/Los_Angeles'],['las vegas','nv · united states',36.17,-115.14,'America/Los_Angeles'],
['louisville','ky · united states',38.25,-85.76,'America/Kentucky/Louisville'],['jeffersonville','in · united states',38.28,-85.74,'America/Indiana/Indianapolis'],['new albany','in · united states',38.29,-85.82,'America/Indiana/Indianapolis'],['clarksville','in · united states',38.30,-85.76,'America/Indiana/Indianapolis'],['bloomington','in · united states',39.17,-86.53,'America/Indiana/Indianapolis'],['fort wayne','in · united states',41.08,-85.14,'America/Indiana/Indianapolis'],['evansville','in · united states',37.97,-87.57,'America/Chicago'],['south bend','in · united states',41.68,-86.25,'America/Indiana/Indianapolis'],['lexington','ky · united states',38.04,-84.50,'America/New_York'],
['cincinnati','oh · united states',39.10,-84.51,'America/New_York'],['indianapolis','in · united states',39.77,-86.16,'America/Indiana/Indianapolis'],
['columbus','oh · united states',39.96,-83.00,'America/New_York'],['cleveland','oh · united states',41.50,-81.69,'America/New_York'],
['st. louis','mo · united states',38.63,-90.20,'America/Chicago'],['kansas city','mo · united states',39.10,-94.58,'America/Chicago'],
['minneapolis','mn · united states',44.98,-93.27,'America/Chicago'],['milwaukee','wi · united states',43.04,-87.91,'America/Chicago'],
['new orleans','la · united states',29.95,-90.07,'America/Chicago'],['memphis','tn · united states',35.15,-90.05,'America/Chicago'],
['charlotte','nc · united states',35.23,-80.84,'America/New_York'],['raleigh','nc · united states',35.78,-78.64,'America/New_York'],
['baltimore','md · united states',39.29,-76.61,'America/New_York'],['washington','dc · united states',38.91,-77.04,'America/New_York'],
['pittsburgh','pa · united states',40.44,-79.996,'America/New_York'],['tampa','fl · united states',27.95,-82.46,'America/New_York'],
['orlando','fl · united states',28.54,-81.38,'America/New_York'],['jacksonville','fl · united states',30.33,-81.66,'America/New_York'],
['salt lake city','ut · united states',40.76,-111.89,'America/Denver'],['sacramento','ca · united states',38.58,-121.49,'America/Los_Angeles'],
['oakland','ca · united states',37.80,-122.27,'America/Los_Angeles'],['san jose','ca · united states',37.34,-121.89,'America/Los_Angeles'],
['tucson','az · united states',32.22,-110.97,'America/Phoenix'],['albuquerque','nm · united states',35.08,-106.65,'America/Denver'],
['oklahoma city','ok · united states',35.47,-97.52,'America/Chicago'],['tulsa','ok · united states',36.15,-95.99,'America/Chicago'],
['omaha','ne · united states',41.26,-95.93,'America/Chicago'],['des moines','ia · united states',41.59,-93.62,'America/Chicago'],
['little rock','ar · united states',34.75,-92.29,'America/Chicago'],['birmingham','al · united states',33.52,-86.80,'America/Chicago'],
['richmond','va · united states',37.54,-77.44,'America/New_York'],['buffalo','ny · united states',42.89,-78.88,'America/New_York'],
['toronto','on · canada',43.65,-79.38,'America/Toronto'],['vancouver','bc · canada',49.28,-123.12,'America/Vancouver'],
['montreal','qc · canada',45.50,-73.57,'America/Toronto'],['calgary','ab · canada',51.05,-114.07,'America/Edmonton'],
['mexico city','mexico',19.43,-99.13,'America/Mexico_City'],['guadalajara','mexico',20.66,-103.35,'America/Mexico_City'],
['london','united kingdom',51.51,-0.13,'Europe/London'],['manchester','united kingdom',53.48,-2.24,'Europe/London'],
['dublin','ireland',53.35,-6.26,'Europe/Dublin'],['paris','france',48.86,2.35,'Europe/Paris'],['berlin','germany',52.52,13.40,'Europe/Berlin'],
['madrid','spain',40.42,-3.70,'Europe/Madrid'],['barcelona','spain',41.39,2.17,'Europe/Madrid'],['rome','italy',41.90,12.50,'Europe/Rome'],
['amsterdam','netherlands',52.37,4.90,'Europe/Amsterdam'],['lisbon','portugal',38.72,-9.14,'Europe/Lisbon'],
['stockholm','sweden',59.33,18.07,'Europe/Stockholm'],['copenhagen','denmark',55.68,12.57,'Europe/Copenhagen'],
['sydney','australia',-33.87,151.21,'Australia/Sydney'],['melbourne','australia',-37.81,144.96,'Australia/Melbourne'],
['auckland','new zealand',-36.85,174.76,'Pacific/Auckland'],['tokyo','japan',35.68,139.65,'Asia/Tokyo'],['seoul','south korea',37.57,126.98,'Asia/Seoul'],
['bangkok','thailand',13.76,100.50,'Asia/Bangkok'],['singapore','singapore',1.35,103.82,'Asia/Singapore'],['mumbai','india',19.08,72.88,'Asia/Kolkata'],
['delhi','india',28.61,77.21,'Asia/Kolkata'],['dubai','uae',25.20,55.27,'Asia/Dubai'],['cairo','egypt',30.04,31.24,'Africa/Cairo'],
['lagos','nigeria',6.52,3.38,'Africa/Lagos'],['johannesburg','south africa',-26.20,28.05,'Africa/Johannesburg'],['nairobi','kenya',-1.29,36.82,'Africa/Nairobi'],
['são paulo','brazil',-23.55,-46.63,'America/Sao_Paulo'],['rio de janeiro','brazil',-22.91,-43.17,'America/Sao_Paulo'],
['buenos aires','argentina',-34.60,-58.38,'America/Argentina/Buenos_Aires'],['bogotá','colombia',4.71,-74.07,'America/Bogota'],['lima','peru',-12.05,-77.04,'America/Lima'],
['santiago','chile',-33.45,-70.67,'America/Santiago'],['san juan','pr · united states',18.47,-66.11,'America/Puerto_Rico'],
['honolulu','hi · united states',21.31,-157.86,'Pacific/Honolulu'],['anchorage','ak · united states',61.22,-149.90,'America/Anchorage']];

let cityT=null, cityHi=-1, cityRes=[];
function cityType(inp,ddId){
  const q=inp.value.trim().toLowerCase(), dd=document.getElementById(ddId);
  if(q.length<1){dd.classList.remove('on');dd.innerHTML='';return;}
  /* instant: seed matches first */
  cityRes=CITY_SEED.filter(c=>c[0].startsWith(q)).concat(CITY_SEED.filter(c=>!c[0].startsWith(q)&&(c[0].includes(q)||c[1].includes(q)))).slice(0,7)
    .map(c=>({n:c[0],r:c[1],lat:c[2],lon:c[3],tz:c[4]}));
  cityDraw(inp,dd);
  /* live: worldwide geocoder, debounced */
  clearTimeout(cityT);
  cityT=setTimeout(async()=>{
    try{
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`);
      const j=await r.json();
      if(!j.results)return;
      const live=j.results.map(x=>({n:(x.name||'').toLowerCase(),
        r:[x.admin1,x.country].filter(Boolean).join(' · ').toLowerCase(),lat:x.latitude,lon:x.longitude,tz:x.timezone||null}));
      const seen=new Set(cityRes.map(c=>c.n+c.r));
      cityRes=cityRes.concat(live.filter(c=>!seen.has(c.n+c.r))).slice(0,8);
      cityDraw(inp,dd);
    }catch(e){/* offline — seed list already showing */}
  },160);
}
function cityDraw(inp,dd){
  if(!cityRes.length){dd.classList.remove('on');return;}
  cityHi=-1;
  dd.innerHTML=cityRes.map((c,i)=>
    `<button class="ci2" data-i="${i}" onclick="cityPick('${inp.id}','${dd.id}',${i})">
       <span class="cg">◎</span><span class="cn">${esc(c.n)}</span><span class="cr">${esc(c.r)}</span></button>`).join('');
  dd.classList.add('on');
}
function cityPick(inpId,ddId,i){
  const c=cityRes[i], inp=document.getElementById(inpId);
  inp.value=`${c.n}, ${c.r.split(' · ')[0]}`;
  inp.dataset.lat=c.lat; inp.dataset.lon=c.lon; inp.dataset.tz=c.tz||'';
  document.getElementById(ddId).classList.remove('on');
}
/* close on outside tap */
document.addEventListener('click',e=>{
  if(!e.target.closest('.cw'))document.querySelectorAll('.cdd').forEach(d=>d.classList.remove('on'));
});
/* arrow keys + enter */
document.addEventListener('keydown',e=>{
  const dd=document.querySelector('.cdd.on'); if(!dd)return;
  const items=dd.querySelectorAll('.ci2'); if(!items.length)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    cityHi=e.key==='ArrowDown'?Math.min(items.length-1,cityHi+1):Math.max(0,cityHi-1);
    items.forEach((x,i)=>x.classList.toggle('hi',i===cityHi));
  } else if(e.key==='Enter'&&cityHi>=0){e.preventDefault();items[cityHi].click();}
  else if(e.key==='Escape')dd.classList.remove('on');
});

/* ══════════ ONBOARDING ══════════ */
const LANES=[['transits','☽︎'],['tarot','✦'],['rituals','❦'],
 ['synastry','♡'],['journaling','✎'],['moon tracking','☾']];
let obS=0;
function obR(){
  document.querySelectorAll('.ob-s').forEach(s=>s.classList.toggle('on',+s.dataset.s===obS));
  const sk=document.getElementById('obSkip'); if(sk)sk.style.display=obS>=2?'block':'none';
}
document.getElementById('ob0').onclick=()=>{obS=1;obR();};
document.getElementById('ob1').onclick=()=>{
  const _p=document.getElementById('obPlace');
  S.me.name=document.getElementById('obName').value.trim()||'you';
  S.me.date=document.getElementById('obDate').value;
  S.me.time=document.getElementById('obTime').value;
  S.me.place=_p.value.trim();
  S.me.lat=_p.dataset.lat||null; S.me.lon=_p.dataset.lon||null;
  S.me.tzName=_p.dataset.tz||null;
  const _o=S.me.tzName?tzOffsetAt(S.me.tzName,S.me.date,S.me.time):null;
  S.me.tz=_o!=null?_o:(S.me.lon!=null?Math.round(parseFloat(S.me.lon)/15):null);
  runLoader();
};
document.getElementById('ob2').onclick=()=>{obS=3;obR();};
document.getElementById('ob3').onclick=()=>obDone();

/* screen 5: the chart being BORN — planets orbit in, wheel draws, houses appear */
function runLoader(){
  const ob=document.getElementById('ob'), L=document.getElementById('load');
  /* loader (z290) covers onboarding (z280) BEFORE anything fades — no home-screen peek */
  L.classList.remove('off');L.classList.add('on');animateChart();
  setTimeout(()=>{ob.classList.remove('on');},350);
  setTimeout(()=>{
    /* bring onboarding back UNDER the loader first, then fade the loader off it */
    obS=2;obR();ob.classList.add('on');
    L.classList.add('off');
    setTimeout(()=>{L.classList.remove('on');L.classList.remove('off');},1000);
  },4400);
}
function animateChart(){
  const cv=document.getElementById('loadCanvas'); if(!cv)return;
  const ctx=cv.getContext('2d'), W=300, C=150, R=118;
  const acc=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#C9A961';
  const line=getComputedStyle(document.documentElement).getPropertyValue('--line').trim()||'rgba(0,0,0,.1)';
  const dust=getComputedStyle(document.documentElement).getPropertyValue('--dust').trim()||'#888';
  const bodies=[[0.9,'☉',38],[1.5,'☽',58],[2.3,'☿',80],[0.4,'♀︎',96],[3.6,'♂︎',70],[5.1,'♃',110]];
  const t0=performance.now(), DUR=4000;
  const steps=['casting the wheel','placing the planets','drawing the aspects','reading the sky'];
  function frame(now){
    const p=Math.min(1,(now-t0)/DUR);
    ctx.clearRect(0,0,W,W);
    /* outer wheel draws itself */
    ctx.strokeStyle=line; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(C,C,R,-Math.PI/2,-Math.PI/2+p*Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(C,C,R-16,-Math.PI/2,-Math.PI/2+p*Math.PI*2); ctx.stroke();
    /* houses appear one at a time */
    const hn=Math.floor(p*12);
    for(let k=0;k<hn;k++){const a=(k*30-90)*Math.PI/180;
      ctx.strokeStyle=k%3===0?acc:line; ctx.lineWidth=k%3===0?1.3:.6; ctx.globalAlpha=k%3===0?.8:.5;
      ctx.beginPath(); ctx.moveTo(C+Math.cos(a)*(R*0.42),C+Math.sin(a)*(R*0.42));
      ctx.lineTo(C+Math.cos(a)*(R-16),C+Math.sin(a)*(R-16)); ctx.stroke(); ctx.globalAlpha=1;}
    /* planets orbit inward to their seats */
    bodies.forEach((b,idx)=>{
      const app=Math.max(0,Math.min(1,(p-idx*0.08)/0.4));
      if(app<=0)return;
      const seat=b[2], orbit=R-16 - app*(R-16-seat);
      const ang=b[0]+ (1-app)*Math.PI*2*1.5 - Math.PI/2;
      const x=C+Math.cos(ang)*orbit, y=C+Math.sin(ang)*orbit;
      ctx.globalAlpha=app;
      ctx.fillStyle=acc; ctx.font="15px 'Apple Symbols','Noto Sans Symbols 2',serif"; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(b[1],x,y);
      ctx.globalAlpha=1;
    });
    /* aspect lines in the last third */
    if(p>0.62){const ap=(p-0.62)/0.38;
      ctx.strokeStyle=acc; ctx.globalAlpha=ap*0.4; ctx.lineWidth=.7;
      for(let k=0;k<3;k++){const a1=bodies[k][0]-Math.PI/2,a2=bodies[k+2][0]-Math.PI/2;
        ctx.beginPath(); ctx.moveTo(C+Math.cos(a1)*bodies[k][2],C+Math.sin(a1)*bodies[k][2]);
        ctx.lineTo(C+Math.cos(a2)*bodies[k+2][2],C+Math.sin(a2)*bodies[k+2][2]); ctx.stroke();}
      ctx.globalAlpha=1;}
    /* center */
    ctx.fillStyle=acc; ctx.beginPath(); ctx.arc(C,C,2.5,0,Math.PI*2); ctx.fill();
    const st=document.getElementById('loadS');
    if(st)st.textContent=steps[Math.min(steps.length-1,Math.floor(p*steps.length))];
    if(p<1)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function obDone(){
  const ob=document.getElementById('ob');ob.classList.add('off');
  setTimeout(()=>ob.classList.remove('on'),920);
  S.onboarded=true;
  if(window.tiCloud){window.tiCloud.saveProfile(S.me).catch(()=>{});tiFlush();}
  renderSky();renderCal();renderGrim();renderJournal();renderOrbit();renderMe();
  if(S.me.date){const d=parse(S.me.date);
    setTimeout(()=>toast(`✦ ☉ ${SIGNS[signOf(sunLon(d))]} · ☽ ${SIGNS[signOf(moonLon(d))]} — welcome in, ${S.me.name}`),1000);}
}
function obReplay(){obS=0;obR();const ob=document.getElementById('ob');ob.classList.remove('off');ob.classList.add('on');}

document.getElementById('obLanes').innerHTML=LANES.map(([l,g])=>
  `<button class="ob-chip${S.me.lanes&&S.me.lanes.includes(l)?' on':''}" onclick="this.classList.toggle('on')">
    ${l}<span class="cg">${g}</span></button>`).join('');
document.getElementById('obSw').innerHTML=swHTML();
document.querySelectorAll('#obMode button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));

/* ══════════ BOOT ══════════ */
/* ── backend connectors · supabase ── */
const TI_BACKEND={
  url:(window.__TI&&window.__TI.url)||'https://lfukxvbcfetdzbauigxe.supabase.co',
  key:(window.__TI&&window.__TI.key)||'sb_publishable_4I0wLd6h647YEmvGwqNzwg_2KtNevsK'
};
if(window.__TI&&window.__TI.token)S.backendToken=window.__TI.token;
/* the react shell calls this when the supabase session refreshes */
window.__tiSetToken=t=>{S.backendToken=t||null;};
async function sb(path){
  const r=await fetch(TI_BACKEND.url+path,{headers:{apikey:TI_BACKEND.key,Authorization:'Bearer '+(S.backendToken||TI_BACKEND.key)}});
  if(!r.ok)throw new Error('sb '+r.status);
  return r.json();
}
/* natal truth from natal_positions (RLS-locked: flows once a session token exists).
   celestine-computed, porphyry, validated — always wins over client math. */
function cloudAngles(){
  if(!S.cloudNatal)return null;
  const g=k=>S.cloudNatal.find(r=>r.kind==='angle'&&r.body_key===k);
  const asc=g('asc'),mc=g('mc'); if(!asc||!mc)return null;
  const H=[];
  for(let i=1;i<=12;i++){const c=S.cloudNatal.find(r=>r.kind==='house_cusp'&&r.body_key==='cusp_'+i);if(!c)return null;H.push(+c.absolute_longitude);}
  return {asc:+asc.absolute_longitude,mc:+mc.absolute_longitude,H};
}
async function syncBackend(){
  try{
    await sb('/rest/v1/tarot_cards?select=card_key&limit=1');  /* anon-readable — proves the pipe */
    S.backendLive=true;
    try{
      const rows=await sb('/rest/v1/natal_positions?select=kind,body_key,house,sign,degree_in_sign,absolute_longitude');
      if(rows.length){S.cloudNatal=rows;renderNatal();}
    }catch(e){/* not signed in — zone-corrected client math carries it */}
    try{
      /* the real 2026 calendar: 251 rows from global_events, keyed by date */
      const ge=await sb('/rest/v1/global_events?select=event_category,event_type_key,title,description,exact_at,starts_at,ends_at,body_key,sign&order=exact_at&limit=400');
      if(ge.length){
        S.cloudEvents={};
        ge.forEach(e=>{const k=(e.exact_at||e.starts_at).slice(0,10);(S.cloudEvents[k]=S.cloudEvents[k]||[]).push(e);});
        renderCal();
      }
    }catch(e){/* reference read failed — inline arrays carry it */}
  }catch(e){S.backendLive=false;}
}
/* self-heal charts saved before zones existed: re-resolve the birth place once */
async function healTz(){
  if(!S.onboarded||S.me.tzName||!S.me.place)return;
  try{
    const q=S.me.place.split(',')[0].trim();
    const seed=CITY_SEED.find(c=>c[0]===q.toLowerCase());
    let zone=seed?seed[4]:null;
    if(!zone){
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`);
      const j=await r.json(); zone=j.results&&j.results[0]&&j.results[0].timezone;
    }
    if(!zone)return;
    S.me.tzName=zone;
    const o=tzOffsetAt(zone,S.me.date,S.me.time);
    if(o!=null&&o!==S.me.tz){
      S.me.tz=o;
      renderNatal();renderSky();renderOrbit();
      toast('✦ chart recast — birth timezone corrected');
    }
  }catch(e){/* offline — next launch */}
}
/* ── cloud state · supabase app_state ──
   the S object is still the single source of truth at runtime; the cloud is its shadow.
   loads before first render so a returning bestie lands in her own app, not a blank one. */
const TI_PERSIST_KEYS=['me','people','entries','cal','accent','cursor','sel','jcursor','jfilter','set','plus','onboarded'];
function tiSnapshot(){
  const out={};
  TI_PERSIST_KEYS.forEach(k=>{
    const v=S[k];
    out[k]=(v instanceof Date)?{__date:v.toISOString()}:v;
  });
  const de=document.documentElement;
  out.__ui={mode:de.dataset.mode,type:de.dataset.type,grad:de.dataset.grad};
  return out;
}
function tiRestore(state){
  if(!state)return;
  TI_PERSIST_KEYS.forEach(k=>{
    if(!(k in state))return;
    const v=state[k];
    S[k]=(v&&typeof v==='object'&&v.__date)?new Date(v.__date):v;
  });
  if(state.__ui){
    const de=document.documentElement;
    if(state.__ui.mode)de.dataset.mode=state.__ui.mode;
    if(state.__ui.type)de.dataset.type=state.__ui.type;
    if(state.__ui.grad)de.dataset.grad=state.__ui.grad;
  }
  if(typeof S.accent==='number'&&S.accent>0)setAcc(S.accent);
}
let tiLastSaved='',tiSaveT=null;
async function tiFlush(){
  if(!window.tiCloud)return;
  const snap=tiSnapshot(), j=JSON.stringify(snap);
  if(j===tiLastSaved)return;
  try{await window.tiCloud.saveState(snap);tiLastSaved=j;}
  catch(e){/* offline — the next flush carries it */}
}
function tiSave(){clearTimeout(tiSaveT);tiSaveT=setTimeout(tiFlush,1200);}
/* every path that mutates S funnels through one of these — wrap them so saves are automatic */
['savePull','saveEntry','savePerson','saveInter','saveCycle','saveEvent','delEntry','delPerson','delEvent','obDone','setAcc','setMode','setSet','togglePlus','nav'].forEach(fn=>{
  const orig=window[fn]||((typeof globalThis!=='undefined')&&globalThis[fn]);
  if(typeof orig==='function'){
    const wrapped=function(){const r=orig.apply(this,arguments);tiSave();return r;};
    window[fn]=wrapped;
  }
});
setInterval(tiFlush,20000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')tiFlush();});
addEventListener('beforeunload',tiFlush);

async function tiBoot(){
  if(window.tiCloud){
    try{const cloud=await window.tiCloud.loadState();tiRestore(cloud);tiLastSaved=JSON.stringify(tiSnapshot());}
    catch(e){/* first launch or offline — fresh S carries it */}
  }
  stars();obR();renderSky();renderCal();renderShelf();renderJournal();renderGrim();renderOrbit();renderMe();
  healTz();syncBackend();
  tiSplash();
}
/* the greeting reads the actual sky before it opens its mouth */
function greetLine(){
  const now=new Date(), hr=now.getHours(), k=key(now);
  const nm=S.me.name&&S.me.name!=='you'?', '+S.me.name:'';
  const hi=(hr<5?'good evening':hr<12?'good morning':hr<18?'good afternoon':'good evening')+nm+'.';
  const nmRow=NEWMOON.find(x=>x[0]===k), fmRow=FULLMOON.find(x=>x[0]===k);
  if(fmRow&&/eclipse/i.test(fmRow[3]+fmRow[4]))return [hi,'today\'s sky asks for your attention.'];
  if(nmRow&&/eclipse/i.test(nmRow[3]))return [hi,'today\'s sky asks for your attention.'];
  if(fmRow)return [hi,'the full moon is waiting.'];
  if(nmRow)return [hi,'it\'s time to plant something new.'];
  if(isRx('mercury',now))return [hi,'mercury has something to say today.'];
  if(hr>=22||hr<5)return [hi,'one last look at the sky?'];
  if(hr<12)return [hi,'your almanac is ready.'];
  if(hr<18)return [hi,'let\'s see what\'s changed.'];
  return [hi,'tonight\'s sky is waiting.'];
}
/* the week's moons, monday to sunday — today carries the light */
function moonWeek(){
  const now=new Date(), dow=(now.getDay()+6)%7, DN=['mon','tue','wed','thu','fri','sat','sun'];
  let h='';
  for(let i=0;i<7;i++){
    const d=new Date(now); d.setDate(now.getDate()-dow+i);
    const on=i===dow;
    h+=`<div class="mwd${on?' on':''}">${moonSVG(phase(d),on?42:27)}<span>${on?'today':DN[i]}</span></div>`;
  }
  return h;
}
/* splash fx: rising sparkles, ambient zodiac glyphs, the occasional shooting star */
function splashFx(id='spFx'){
  const fx=document.getElementById(id); if(!fx)return;
  const SPK=['✦','✧','⋆','✶','·','✦','✧','⋆'];
  for(let i=0;i<22;i++){
    const s=document.createElement('span'); s.className='fx-spk';
    s.textContent=SPK[i%SPK.length];
    s.style.left=Math.random()*100+'%';
    s.style.fontSize=(7+Math.random()*10)+'px';
    s.style.setProperty('--o',(.3+Math.random()*.55).toFixed(2));
    s.style.animationDuration=(7+Math.random()*9)+'s';
    s.style.animationDelay=(-Math.random()*14)+'s';
    fx.appendChild(s);
  }
  const BIG=['✺','❋','✧','✶','✦'];
  for(let i=0;i<7;i++){
    const g=document.createElement('span'); g.className='fx-gly';
    g.textContent=BIG[Math.floor(Math.random()*BIG.length)];
    g.style.left=(4+Math.random()*88)+'%';
    g.style.top=(6+Math.random()*82)+'%';
    g.style.fontSize=(16+Math.random()*22)+'px';
    g.style.setProperty('--o',(.05+Math.random()*.09).toFixed(2));
    g.style.animationDuration=(9+Math.random()*8)+'s';
    g.style.animationDelay=(-Math.random()*12)+'s';
    fx.appendChild(g);
  }
  const shoot=()=>{
    if(id==='spFx'&&document.getElementById('splash').classList.contains('off'))return;
    if(id==='obFx'&&!document.getElementById('ob').classList.contains('on'))return;
    const st=document.createElement('span'); st.className='fx-shoot';
    st.style.top=(2+Math.random()*26)+'%';
    st.style.left=(-8+Math.random()*22)+'%';
    fx.appendChild(st);
    setTimeout(()=>st.remove(),1300);
    setTimeout(shoot,2600+Math.random()*3200);
  };
  setTimeout(shoot,1100);
}
/* next injects these scripts after the page 'load' event has already fired,
   so the splash runs by explicit call from tiBoot, not a load listener */
function tiSplash(){
  splashFx();splashFx('obFx');
  const sps=document.querySelectorAll('.sp-s');
  const returning=S.onboarded;
  if(returning){
    /* brand splash → sky-aware greeting → straight into the app */
    const g=greetLine();
    setTimeout(()=>{
      sps.forEach(s=>s.classList.remove('on'));
      document.getElementById('grHi').textContent=g[0];
      document.getElementById('grSub').textContent=g[1];
      document.getElementById('grMoon').innerHTML=moonWeek();
      document.querySelector('[data-sp="greet"]').classList.add('on');
    },850);
    setTimeout(()=>{document.getElementById('splash').classList.add('off');},2500);
  } else {
    setTimeout(()=>{document.getElementById('ob').classList.add('on');},2900);
    setTimeout(()=>{document.getElementById('splash').classList.add('off');},3400);
  }
}
