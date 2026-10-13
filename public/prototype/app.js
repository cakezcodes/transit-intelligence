/* IMG (all 78 rws 1909 scans) is declared by /prototype/img.js, loaded first.
   never redeclare it here — a duplicate const kills this whole script at parse time. */

/* ══════════ REAL SKY MATH ══════════ */
const SYN=29.53058867, J2000=Date.UTC(2000,0,1,12);
const SIGNS=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const GLY=['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];
const ELEM=['fire','earth','air','water'];
const days=d=>(d.getTime()-J2000)/86400000;
function phase(d){const k=(days(d)-5.597)/SYN;return ((k%1)+1)%1;}           /* 0=new .5=full */
function moonLon(d){return ((218.316+13.176396*days(d))%360+360)%360;}
function sunLon(d){return ((280.459+0.98564736*days(d))%360+360)%360;}
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
  const l1=`the moon's in <button class="lk il" onclick="explainSign(${SIGNS.indexOf(ms)})"><b>${ms} ${GLY[SIGNS.indexOf(ms)]}</b></button> and she's ${vibe}. ${MOOD[pn]}`;
  const l2=read;
  const l3=vd.active?`heads up — she goes void in about ${vd.hrs}h. anything you launch, send, or swear to in that window tends to just… evaporate. <button class="lk il" onclick="explain('void')">wait it out ◇</button>`:
    `sun's still cooking in <button class="lk il" onclick="explainSign(${SIGNS.indexOf(ss)})"><b>${ss}</b></button>, so that's the background hum under all of it.`;
  return {l1,l2,l3,move:PH_MOVE[pn],pn,ms};
}

/* ══════════ LAYERS ══════════ */
const LAYERS=[
 {g:'cosmic moon',items:[
  {id:'lunar',n:'lunar transits',d:'the moon through the signs, daily',c:'#8FD0F2',on:1,gl:'☽︎'},
  {id:'lunation',n:'lunations & eclipses',d:'new moons, full moons, the big ones',c:'#F4CC2E',on:1,gl:'◑'},
  {id:'void',n:'void of course',d:'the dead zones — don\'t launch, don\'t send',c:'#5a564f',on:1,gl:'⊘'},
  {id:'lunret',n:'lunar return',d:'the moon comes home — your monthly reset',c:'#8FD0F2',on:0,gl:'☾'},
  {id:'cycle',n:'cycle & ovulation',d:'period, fertile window, luteal — logged and predicted',c:'#FF90E8',on:1,gl:'◉'}]},
 {g:'cosmic sky',items:[
  {id:'global',n:'global transits',d:'what the sky is doing for everyone',c:'#5a564f',on:1,gl:'☉︎'},
  {id:'retro',n:'retrogrades',d:'stations, shadows, the whole mess',c:'#C7B0F5',on:1,gl:'℞'},
  {id:'rulers',n:'house rulers on the move',d:'where your chart ruler is walking today',c:'#7FE0B5',on:0,gl:'⌂'}]},
 {g:'cosmic natal',items:[
  {id:'natal',n:'transits to natal',d:'what\'s actually hitting your placements',c:'#F4CC2E',on:1,gl:'✦'},
  {id:'promise',n:'natal promise windows',d:'when the chart finally pays out what it promised',c:'#F4CC2E',on:0,gl:'✧'},
  {id:'theirs',n:'their transits',d:'what each person in orbit is living through',c:'#C7B0F5',on:0,gl:'☍'},
  {id:'syn',n:'synastry hits',d:'when the sky touches both charts at once',c:'#FF90E8',on:0,gl:'◇'},
  {id:'comp',n:'composite transits',d:'the relationship\'s own chart, activated',c:'#C7B0F5',on:0,gl:'◍'}]},
 {g:'cosmic convergence',items:[
  {id:'prof',n:'profections',d:'which house is running your year, and this month',c:'#D6EC4F',on:1,gl:'◈'},
  {id:'firdaria',n:'firdaria & timelords',d:'the planet holding the keys right now',c:'#D6EC4F',on:1,gl:'♄︎'},
  {id:'zr',n:'zodiacal releasing',d:'chapters, peaks, and loosings of the bond',c:'#FF5A36',on:1,gl:'⟳'},
  {id:'prog',n:'progressed moon',d:'the inner clock — where your progressed moon is touching',c:'#7FE0B5',on:1,gl:'☽︎'},
  {id:'power',n:'power days',d:'career, luck, money, deal and love days — when it all lines up',c:'#F4CC2E',on:1,gl:'✦'},
  {id:'sixmo',n:'six-month plan',d:'each new moon as a planning checkpoint',c:'#FF9A3C',on:0,gl:'◐'}]},
 {g:'cosmic divination',items:[
  {id:'pull',n:'tarot pulls',d:'every card you\'ve logged, on its date',c:'#C7B0F5',on:1,gl:'✦'},
  {id:'entry',n:'journal entries',d:'notes, photos, synchronicities',c:'#7FE0B5',on:1,gl:'✧'}]},
 {g:'cosmic ritual',items:[
  {id:'ritual',n:'rituals & workings',d:'what you planned, what you performed',c:'#FF9A3C',on:1,gl:'✧'},
  {id:'sex',n:'intimacy log',d:'private. yours. cross-referenced with the sky.',c:'#FF90E8',on:0,gl:'◇'}]}
];
let LON={}; LAYERS.forEach(g=>g.items.forEach(i=>LON[i.id]=!!i.on));
const layMeta=id=>{for(const g of LAYERS)for(const i of g.items)if(i.id===id)return i;};

/* ══════════ STATE ══════════ */
const S={
  me:{name:'you',date:'',time:'',place:'',lanes:['transits','tarot','rituals','journaling']},
  people:[],
  entries:[],   /* {id,date,type,title,body,photos[],cards[{k,rev}],ritual} */
  cal:[],       /* {id,date,type,title,note} user-added */
  accent:0, cursor:new Date(), sel:'', jcursor:new Date(), jfilter:'all',
  notes:{}, set:{house:'porphyry'}
};
S.lon=LON;   /* layer toggles persist with the rest of the record */
S.cursor=new Date(S.cursor.getFullYear(),S.cursor.getMonth(),1);
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c);};
const fmt=d=>d.toLocaleDateString('en-us',{month:'short',day:'numeric'}).toLowerCase();
const fmtL=d=>d.toLocaleDateString('en-us',{weekday:'long',month:'long',day:'numeric'}).toLowerCase();
if(!S.sel)S.sel=key(new Date());

/* ══════════ NAV ══════════ */
const TAB={sky:'sky',cal:'cal',layers:'cal',event:'cal',journal:'cal',grim:'grim',lib:'grim',pat:'grim',orbit:'orbit',person:'orbit',me:'me',natal:'me'};
const VNAME={sky:'sky',cal:'calendar',layers:'layers',event:'the event',journal:'the record',grim:'the grimoire',lib:'the library',pat:'my patterns',orbit:'orbit',person:'their chart',me:'me',natal:'my chart'};
const ROOTS=['sky','cal','grim','orbit','me'];
/* the back stack. every view change is a history entry carrying the whole stack, so
   in-app back buttons, the browser back button, and the phone's back swipe all agree. */
let VSTACK=['sky'];
const RENDER={sky:()=>renderSky(),cal:()=>renderCal(),grim:()=>renderGrim(),journal:()=>renderJournal(),pat:()=>renderPat(),
  orbit:()=>renderOrbit(),layers:()=>renderLayers(),me:()=>renderMe(),natal:()=>renderNatal()};
function showView(id,focus){
  const el=document.getElementById('v-'+id);if(!el)return;
  document.querySelectorAll('.v').forEach(v=>v.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('.tab').forEach(t=>{const on=t.dataset.v===TAB[id];t.classList.toggle('on',on);
    if(on)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');});
  const prev=VSTACK.length>1?VSTACK[VSTACK.length-2]:null;
  const bk=el.querySelector(':scope > .back');
  if(bk&&prev)bk.textContent='‹ '+VNAME[prev];
  window.scrollTo(0,0);
  if(RENDER[id])try{RENDER[id]();}catch(e){console.error('render '+id,e);}
  if(focus){el.setAttribute('tabindex','-1');el.focus({preventScroll:true});}
}
function nav(id,opt){
  opt=opt||{};
  if(!document.getElementById('v-'+id))return;
  const cur=VSTACK[VSTACK.length-1];
  if(id===cur){showView(id);return;}
  if(opt.tab)VSTACK=[id];
  else if(VSTACK.includes(id))VSTACK=VSTACK.slice(0,VSTACK.indexOf(id)+1);   /* no loops: going "forward" to an ancestor rewinds */
  else VSTACK.push(id);
  history.pushState({ti:1,stack:VSTACK.slice()},'');
  showView(id,true);
}
function tabTo(id){
  if(VSTACK.length===1&&VSTACK[0]===id){window.scrollTo({top:0,behavior:'smooth'});return;}
  nav(id,{tab:true});
}
function goBack(fallback){
  if(VSTACK.length>1)history.back();
  else nav(fallback,{tab:ROOTS.includes(fallback)});
}
addEventListener('popstate',e=>{
  if(document.getElementById('sht').classList.contains('on')){
    /* back closes the open sheet first, and keeps you on the page underneath */
    closeSheet(true);history.pushState({ti:1,stack:VSTACK.slice()},'');return;
  }
  VSTACK=(e.state&&e.state.stack)||['sky'];
  showView(VSTACK[VSTACK.length-1],true);
});
history.replaceState({ti:1,stack:VSTACK.slice()},'');
let tt;function toast(m){const t=document.getElementById('toast');t.innerHTML=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2500);}

/* ══════════ THEME ══════════ */
const ACC=[
 {n:'lilac',c1:'#C7B0F5',c2:'#C7B0F5',a:'#C7B0F5'},
 {n:'pink',c1:'#FF90E8',c2:'#FF90E8',a:'#FF90E8'},
 {n:'yellow',c1:'#F4CC2E',c2:'#F4CC2E',a:'#F4CC2E'},
 {n:'chartreuse',c1:'#D6EC4F',c2:'#D6EC4F',a:'#D6EC4F'},
 {n:'orange',c1:'#FF9A3C',c2:'#FF9A3C',a:'#FF9A3C'},
 {n:'ice',c1:'#8FD0F2',c2:'#8FD0F2',a:'#8FD0F2'},
 {n:'mint',c1:'#7FE0B5',c2:'#7FE0B5',a:'#7FE0B5'},
 {n:'tomato',c1:'#FF5A36',c2:'#FF5A36',a:'#FF5A36'}];
const rgba=(h,a)=>{const n=parseInt(h.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
function setAcc(i){
  if(!ACC[i])i=0;S.accent=i;const A=ACC[i],r=document.documentElement.style;
  r.setProperty('--accent',A.a);
  r.setProperty('--soft',A.a);r.setProperty('--glow','transparent');
  document.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',+s.dataset.i===i));
  saveUi();stars();
}
/* mirror of the theme for app/layout.tsx's pre-paint script (no flash on reload) */
function saveUi(){try{const d=document.documentElement;localStorage.setItem('ti-ui',JSON.stringify({mode:d.dataset.mode,type:d.dataset.type,grad:d.dataset.grad,accent:(ACC[S.accent]||ACC[0]).a}));}catch(e){}}
const swHTML=()=>ACC.map((A,i)=>`<button class="sw${i===S.accent?' on':''}" data-i="${i}" style="--c1:${A.c1};--c2:${A.c2}" onclick="setAcc(${i})"><span class="d"></span><span class="n">${A.n}</span></button>`).join('');
function setMode(m){document.documentElement.dataset.mode=m;saveUi();document.querySelectorAll('#meMode button,#obMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));stars();}
function toggleGrad(){const on=document.documentElement.dataset.grad==='on';document.documentElement.dataset.grad=on?'off':'on';saveUi();document.getElementById('gradTog').classList.toggle('on',!on);}
const TSUB={clean:'all sans, zero ceremony',balanced:'serif titles + quotes only',ceremony:'full book of shadows — stars, glyphs, ✦'};
document.querySelectorAll('#meType button').forEach(b=>b.onclick=()=>{document.documentElement.dataset.type=b.dataset.t;saveUi();document.querySelectorAll('#meType button').forEach(x=>x.classList.toggle('on',x===b));toast(TSUB[b.dataset.t]);stars();});
document.querySelectorAll('#meMode button,#obMode button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));

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
const MAJ=[['m00','the fool','♅︎ uranus','the leap. beginnings, trust, the open road.','recklessness in a freedom costume. look before the cliff.','a yes to starting — pack light'],
['m01','the magician','☿︎ mercury','every tool is already on the table.','manifesting leaking into manipulating. whose spell is this?','skill, will, receipts'],
['m02','the high priestess','☽︎ moon','the knowing behind the veil. don\'t say it out loud yet.','intuition on mute — you\'re asking everyone but yourself.','sit with it. the answer surfaces'],
['m03','the empress','♀︎ venus','abundance, body, softness as a power move.','over-giving until there\'s nothing left to give from.','feed it and it grows'],
['m04','the emperor','♈︎ aries','structure. the boring thing that holds it all up.','control cosplaying as protection.','build the frame first'],
['m05','the hierophant','♉︎ taurus','tradition, teachers, the way it\'s always been done.','the rulebook is expired. write your own.','ask someone who\'s done it'],
['m06','the lovers','♊︎ gemini','a real choice — and choosing means losing the other.','indecision dressed as options.','choose. then commit.'],
['m07','the chariot','♋︎ cancer','armor on, wheels moving. willpower wins this one.','white-knuckling in the wrong direction.','drive. don\'t drift.'],
['m08','strength','♌︎ leo','soft hands on the lion. power that doesn\'t raise its voice.','forcing it. the lion isn\'t tamed, it\'s exhausted.','patience wins this one'],
['m09','the hermit','♍︎ virgo','the lantern, the distance, the answer only silence gives.','isolation with a spiritual excuse.','go quiet on purpose'],
['m10','wheel of fortune','♃︎ jupiter','the turn. luck, timing, the thing outside your grip.','stuck on the same loop of the same wheel.','the cycle is turning'],
['m11','justice','♎︎ libra','cause, effect, receipts. the scales don\'t care about your feelings.','avoiding accountability and calling it peace.','tell the truth'],
['m12','the hanged man','♆︎ neptune','the pause that changes the angle.','stalling and calling it surrender.','stop struggling. look again.'],
['m13','death','♏︎ scorpio','the ending that was already true. clear the field.','clutching the corpse of a chapter. let go.','transformation, not tragedy'],
['m14','temperance','♐︎ sagittarius','the blend. slow alchemy, right proportions.','extremes. all or nothing is a personality, not a plan.','middle path, on purpose'],
['m15','the devil','♑︎ capricorn','the chain you can take off whenever. that\'s the trick.','you\'re already loosening it. keep going.','name the addiction'],
['m16','the tower','♂︎ mars','the lightning does you a favor. false structures fall fast.','the collapse in slow motion — you\'re holding the wall up yourself.','sudden clarity, dramatic exit'],
['m17','the star','♒︎ aquarius','after the tower, the water. hope with evidence.','faith running on fumes. refill before you pour.','healing is on schedule'],
['m18','the moon','♓︎ pisces','the path between the towers. not everything is as lit as it looks.','the fog lifts — the confusion WAS the message.','trust the dog, watch the wolf'],
['m19','the sun','☉︎ sun','it\'s good. let it be good.','dimming yourself for someone else\'s comfort.','joy, no asterisk'],
['m20','judgement','♇ pluto','the call. you already heard it.','ignoring the call and pretending the phone\'s off.','rise. answer it.'],
['m21','the world','♄︎ saturn','the full circle. it\'s actually done.','so close. finish the last 5%.','completion, then the next spiral']];
const SUIT={w:['wands','△','fire','drive, will, the spark'],c:['cups','▽','water','feelings, love, the tide'],s:['swords','△','air','thought, truth, the blade'],p:['pents','▽','earth','money, body, the ground']};
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
['queen','mastery held inward. she feels it, she doesn\'t leak it.','absorbing everything. drowning in the tide.'],
['king','mastery held outward. authority, direction, the call.','the throne used as a weapon.']];
const DECK=[];
MAJ.forEach((m,i)=>DECK.push({k:m[0],n:m[1],a:'major · '+m[2],up:m[3],rv:m[4],f:m[5],suit:'major'}));
Object.keys(SUIT).forEach(s=>RANK.forEach((r,i)=>{const[nm,gl,el,th]=SUIT[s];
  DECK.push({k:`${s}${String(i+1).padStart(2,'0')}`,n:`${r[0]} of ${nm}`,a:`${gl} ${el} · ${th}`,
    up:r[1],rv:r[2],f:`${el} energy — ${th.split(',')[0]}`,suit:s});}));
const byKey=k=>DECK.find(c=>c.k===k);

/* ══════════ CONTENT ══════════ */
const RIT=[
 {n:'cut & clear',s:'banishing · candle',v:'for the one who overstayed',t:['release','protection'],ph:['waning crescent','last quarter','waning gibbous'],
  best:'waning moon · saturday ♄︎ · after dark',need:['black candle','bay leaf','rosemary','black tourmaline'],pair:'the cage door',
  st:['write what you\'re cutting on the bay leaf — the pattern, not the person','dress the black candle base-to-tip with rosemary','burn the leaf in the flame. name the cut out loud, once','let it finish. tourmaline at the door for three nights'],
  sg:'they cross your mind and nothing moves. the urge to check just… stops.'},
 {n:'road opener',s:'clearing · candle',v:'when everything\'s stuck in traffic',t:['money','clarity'],ph:['new moon','waxing crescent'],
  best:'new moon · sunday ☉︎ · morning',need:['orange candle','cinnamon','bay leaf','clear quartz'],pair:'the clarity cross',
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
  best:'new moon · moon hour ☽︎',need:['white candle','moon water','jasmine'],pair:'where do i feel safe',
  st:['moon water in a bowl at the center. that\'s the hearth.','white candle behind it. jasmine beside.','name three things that make a place feel like yours','write them down. paper under the bowl overnight.'],
  sg:'home starts feeling like a verb. you stop apologizing for taking up your own space.'},
 {n:'full moon truth pull',s:'divination · light',v:'she\'s lit — you can see everything now',t:['clarity','release'],ph:['full moon','waning gibbous'],
  best:'full moon · anywhere the light lands',need:['clear quartz','white candle','your deck'],pair:'the clarity cross',
  st:['deck in the moonlight for an hour. quartz on top.','one candle. one question. no follow-ups.','pull until it repeats. the repeat IS the answer.','write it before you interpret it'],
  sg:'the answer annoys you slightly. that\'s how you know it\'s real.'}];
const TAGS=['all','release','love','protection','confidence','money','clarity'];
let tagF='all';
const PANTRY=[
 {c:'❧ herbs',i:[
  {n:'bay leaf',e:'❧',w:'the messenger — write it, burn it, send it',u:'wishes · banishing · victory',o:'☉︎ sun · fire',r:['cut & clear','road opener'],cd:['m01']},
  {n:'rosemary',e:'❧',w:'cleansing + memory. the when-in-doubt herb.',u:'protection · clarity',o:'☉︎ sun · fire',r:['cut & clear'],cd:['m08']},
  {n:'cinnamon',e:'❧',w:'heat and speed. sweetens and accelerates.',u:'money · speed · sweetening',o:'☉︎ sun · fire',r:['honey jar','road opener'],cd:['p01']},
  {n:'rose petals',e:'✿',w:'love drawn soft. never forced.',u:'love · self-tenderness',o:'♀︎ venus · water',r:['honey jar'],cd:['c02']},
  {n:'jasmine',e:'✿',w:'moon medicine — dreams, intuition, night blooms',u:'intuition · peace',o:'☽︎ moon · water',r:['build the inner home'],cd:['m02']}]},
 {c:'◈ crystals',i:[
  {n:'black tourmaline',e:'◈',w:'the bouncer. absorbs what\'s aimed at you.',u:'protection · grounding',o:'♄︎ saturn · earth',r:['cut & clear'],cd:['m16']},
  {n:'rose quartz',e:'◈',w:'the heart on low heat. self-love first, always.',u:'love · healing',o:'♀︎ venus · water',r:['honey jar'],cd:['c13']},
  {n:'clear quartz',e:'◈',w:'the amplifier. boosts whatever sits beside it.',u:'clarity · amplification',o:'☽︎ moon',r:['return to sender','road opener','full moon truth pull'],cd:['m02']},
  {n:'citrine',e:'◈',w:'money and magnetism. doesn\'t hold negativity.',u:'money · confidence',o:'☉︎ sun · fire',r:['glamour before the shift'],cd:['m17']}]},
 {c:'✧ candles & colors',i:[
  {n:'black candle',e:'✧',w:'banish · protect · absorb. the full stop.',u:'release · protection',o:'♄︎ saturn',r:['cut & clear','return to sender'],cd:['m13']},
  {n:'white candle',e:'✧',w:'the blank one. any intention, moon-coded.',u:'cleansing · beginnings',o:'☽︎ moon',r:['build the inner home','full moon truth pull'],cd:['m00']},
  {n:'pink candle',e:'✧',w:'soft love. sweetening. self-tenderness.',u:'love',o:'♀︎ venus',r:['honey jar'],cd:['c02']},
  {n:'gold candle',e:'✧',w:'solar success. visibility. the win.',u:'confidence · glamour',o:'☉︎ sun',r:['glamour before the shift'],cd:['m19']},
  {n:'orange candle',e:'✧',w:'roads open. opportunity moves.',u:'momentum',o:'☿︎ mercury',r:['road opener'],cd:['m10']}]},
 {c:'☽︎ waters & oils',i:[
  {n:'moon water',e:'☽︎',w:'charged under her. the base of everything.',u:'intuition · cleansing',o:'☽︎ moon · water',r:['build the inner home'],cd:['m02']},
  {n:'rose water',e:'✿',w:'glamour in a bottle. wear it like intent.',u:'glamour · love',o:'♀︎ venus',r:['glamour before the shift'],cd:['m03']},
  {n:'black salt',e:'◈',w:'the line they don\'t cross.',u:'protection · banishing',o:'♄︎ saturn · earth',r:['return to sender'],cd:['m15']},
  {n:'honey',e:'❧',w:'sweeten the current. slow, sticky, undeniable.',u:'love · sweetening',o:'♀︎ venus',r:['honey jar'],cd:['c02']}]}];
const SPR={yours:[
 {n:'should i text back',f:'3 cards',p:['the pull','the pattern','the door']},
 {n:'the cage door',f:'4 cards',p:['the cage','the key','the cost','the open air']},
 {n:'the shadow dive',f:'5 cards',p:['surface','shadow','the hook','the medicine','the rise']},
 {n:'where do i feel safe',f:'4 cards · new moon',p:['the walls','the door','the hearth','the key']}],
classic:[
 {n:'the clarity cross',f:'5 cards · when the brain won\'t shut up',p:['heart of it','crossing','root','crown','next']},
 {n:'past · present · future',f:'3 cards · the classic for a reason',p:['past','present','future']},
 {n:'the celtic cross',f:'10 cards · the whole situation',p:['heart','cross','root','past','crown','future','self','environment','hopes/fears','outcome']}]};
const TRICKS=[['✦ significators','pick the court that matches your sun/moon/rising element. that\'s you in the spread.'],
 ['♞ knight directions','which way the horse faces = which way the energy is moving. toward you or away.'],
 ['✿ read by color','warm cards rush. cool cards retreat. count them before you read a single meaning.'],
 ['❀ the flower lens','look for buds, blooms, and wilt. that\'s the growth stage of the situation, right there.'],
 ['◑ the repeat rule','if a card comes back three times, stop asking. it already answered.']];

/* ══════════ SKY VIEW ══════════ */
/* ══════════ THE SKY RIGHT NOW (celestine, via /api/sky) ══════════ */
let SKY={chart:null,at:0,busy:false};
async function loadSky(force){
  if(SKY.busy||(!force&&SKY.chart&&Date.now()-SKY.at<15*60000))return;
  SKY.busy=true;
  const me=S.me;
  try{
    const r=await fetch('/api/sky',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      lat:me.lat??(me.natal&&me.natal.lat)??null,lng:me.lng??me.lon??(me.natal&&me.natal.lng)??null,
      tzName:Intl.DateTimeFormat().resolvedOptions().timeZone})});
    if(!r.ok)throw new Error('sky '+r.status);
    SKY={chart:(await r.json()).chart,at:Date.now(),busy:false};
    const v=document.querySelector('.v.on');if(v&&v.id==='v-sky')renderSky();
  }catch(e){SKY.busy=false;}
}
/* illumination from the engine's sun–moon elongation when the sky is cast, else the inline phase */
function illum(p){const ch=SKY.chart,su=ch&&bodyOf(ch,'sun'),mo=ch&&bodyOf(ch,'moon');
  if(su&&mo){const e=((mo.lon-su.lon)%360+360)%360;return Math.round((1-Math.cos(e*Math.PI/180))/2*100);}
  return Math.round((1-Math.cos(2*Math.PI*p))/2*100);}
const SKY_ASP=[[0,'☌','conjunct',8],[60,'⚹','sextile',4],[90,'□','square',6],[120,'△','trine',6],[180,'☍','opposite',8]];
function skyAspects(ch){
  const B=ch.bodies.filter(b=>['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(b.key)),out=[];
  for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){let d=Math.abs(B[i].lon-B[j].lon);if(d>180)d=360-d;
    for(const [a,g,n,o] of SKY_ASP){const orb=Math.abs(d-a);if(orb<=o)out.push({a:B[i],b:B[j],g,n,orb});}}
  return out.sort((x,y)=>x.orb-y.orb);
}
function renderSkyWheel(){
  const el=document.getElementById('skyWheel');if(!el)return;
  const ch=SKY.chart;
  if(!ch){el.innerHTML='<div class="sky-load">casting the sky ✧</div>';loadSky();return;}
  const b=k=>bodyOf(ch,k),pt=x=>x?`${dm(degIn(x.lon))} ${GLY[signOf(x.lon)]}`:'—';
  const rx=ch.bodies.filter(x=>x.retro&&!['north_node','south_node','lilith'].includes(x.key));
  const asp=skyAspects(ch)[0];
  const p=phase(new Date()),pn=phaseName(p);
  const el2={fire:0,earth:0,air:0,water:0};
  ch.bodies.filter(x=>['sun','moon','mercury','venus','mars','jupiter','saturn'].includes(x.key)).forEach(x=>el2[['fire','earth','air','water'][signOf(x.lon)%4]]++);
  const lead=Object.entries(el2).sort((a,c)=>c[1]-a[1])[0];
  const stat=(k,v,why)=>`<button class="sst" onclick="${why}"><span class="k">${k}</span><span class="v2">${v}</span></button>`;
  el.innerHTML=`<div class="sky-wheel">${wheelSVG(ch,'sky')}</div>
    <div class="sky-stats">
      ${stat('☉︎ sun',pt(b('sun')),"explainPlacement('sky','sun')")}
      ${stat('☽︎ moon',pt(b('moon'))+' · '+illum(p)+'%',"moonSheet()")}
      ${stat('↑ rising now',ch.timeKnown&&ch.asc!=null?`${dm(degIn(ch.asc))} ${GLY[signOf(ch.asc)]}`:'add a place',ch.timeKnown?"explainPlacement('sky','asc')":"castMine()")}
      ${stat('℞ retrograde',rx.length?rx.map(x=>WAB[x.key]||x.key).join(' · '):'none',"explain('retrograde')")}
      ${stat('✦ tightest',asp?`${WAB[asp.a.key]} ${asp.g} ${WAB[asp.b.key]} · ${asp.orb.toFixed(1)}°`:'—',"explain('aspects')")}
      ${stat('◐ element',`${lead[0]} ${lead[1]}/7`,"explain('elements')")}
    </div>
    <div class="sky-meta">${pn} · cast by the celestine engine for ${new Date(SKY.at).toLocaleTimeString('en-us',{hour:'numeric',minute:'2-digit'})}${S.me.place?' · '+esc(S.me.place.split(',')[0]):''}</div>`;
}
function renderSky(){
  const d=new Date(); const p=phase(d),pn=phaseName(p),ml=moonLon(d),si=signOf(ml);
  const r=dailyRead(d), vd=voidWindow(d);
  document.getElementById('skyDate').innerHTML=fmtL(d);
  document.getElementById('skyBody').innerHTML=
   `<button class="today" onclick="moonSheet()" aria-label="${pn} in ${SIGNS[si]} — open the moon"><div class="hl"></div>
      <div class="mn">${moonSVG(p,58)}</div>
      <div><div class="t1">${pn} in ${SIGNS[si]} ${GLY[si]}</div>
        <div class="t2">${illum(p)}% illuminated · ${degIn(ml).toFixed(0)}° ${SIGNS[si]}</div>
        <div class="t3">${vd.active?'⊘ void in '+vd.hrs+'h — hold the send':'☉︎ sun in '+SIGNS[signOf(sunLon(d))]}</div></div><span class="c">›</span>
    </button>
    <div id="skyWheel"></div>
    <div class="read">
      <div class="rl">✦ today's read</div>
      <p>${r.l1}</p><p>${r.l2}</p><p>${r.l3}</p>
      <button class="mv" onclick="openEntry('${key(d)}',null,PH_MOVE['${pn}'])"><b>today's move</b>${r.move}<span class="mv-go">log it ›</span></button>
    </div>`;
  renderSkyWheel();
  const ups=upcoming(d,4);
  document.getElementById('skyUp').innerHTML=ups.map(e=>evRow(e)).join('')||'<div class="card" style="color:var(--dust);font-size:13px">quiet stretch — nothing loud incoming ✧</div>';
  const today=S.entries.filter(e=>e.date===key(d));
  const rit=RIT.find(x=>x.ph.includes(pn));
  document.getElementById('skyDay').innerHTML=
   `<button class="tr" onclick="openEntry('${key(d)}',null,PROMPTS['${pn}'])"><span class="g">✧</span><div><div class="a">journal prompt</div><div class="b">${prompt(pn,SIGNS[si])}</div></div><span class="c">›</span></button>
    <button class="tr" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),80)"><span class="g">✧</span><div><div class="a">matched working · ${rit.n}</div><div class="b">${rit.v}</div></div><span class="n">${pn.split(' ')[0]}</span></button>
    <button class="tr" onclick="openEntry()"><span class="g">+</span><div><div class="a" style="color:var(--deep)">add to today</div><div class="b">${today.length} ${today.length===1?'entry':'entries'} logged</div></div></button>`;
}
const PROMPTS={'new moon':'what are you actually planting — not what sounds good out loud?','waxing crescent':'what would you protect if someone tried to talk you out of it?',
 'first quarter':'where\'s the resistance, and is it a wall or a door?','waxing gibbous':'what needs editing, not abandoning?','full moon':'what can you see now that you couldn\'t two weeks ago?',
 'waning gibbous':'what truth are you circling but not saying?','last quarter':'what have you outgrown but kept out of habit?','waning crescent':'what are you still feeding after it already ended?'};
const prompt=(pn,s)=>PROMPTS[pn];

/* ══════════ EVENTS ENGINE ══════════ */
/* ══════════ THE COSMIC CALENDAR (engine) ══════════
   /api/calendar returns every sky, moon, natal, divination, ritual and convergence event
   for a month, with the full descriptions. cached per month + chart; the inline sky math
   below stays as the offline fallback. */
const COS={};
const cosKey=(y,m)=>`${y}-${m}-${(S.me.natal&&S.me.natal.computedAt)||'sky'}`;
function cosFor(d){
  const y=d.getFullYear(),m=d.getMonth(),k=cosKey(y,m),c=COS[k];
  if(!c){loadCosmic(y,m);return null;}
  return c.state==='ok'?c:null;
}
async function loadCosmic(y,m){
  const k=cosKey(y,m);if(COS[k])return;COS[k]={state:'loading'};
  const pad=n=>String(n).padStart(2,'0'),last=new Date(y,m+1,0).getDate();
  const me=S.me,ch=me.natal;
  try{
    const r=await fetch('/api/calendar',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      start:`${y}-${pad(m+1)}-01`,end:`${y}-${pad(m+1)}-${pad(last)}`,
      tz:Intl.DateTimeFormat().resolvedOptions().timeZone,
      chart:ch&&ch.timeKnown?ch:null,birth:ch?{date:me.date,time:me.time||'',tzName:ch.tzName||me.tzName||null}:null})});
    if(!r.ok)throw new Error('calendar '+r.status);
    const j=await r.json(),ev={};
    j.events.forEach(e=>{(ev[e.date]=ev[e.date]||[]).push(e);});
    COS[k]={state:'ok',ev,personal:j.personal};
  }catch(e){COS[k]={state:'err'};setTimeout(()=>{if(COS[k]&&COS[k].state==='err')delete COS[k];},60000);return;}
  try{renderCal();const v=document.querySelector('.v.on');if(v&&v.id==='v-sky'&&typeof renderSky==='function')renderSky();}catch(e){}
}
function evForDate(d){
  const out=[];const k=key(d),p=phase(d),pn=phaseName(p),ml=moonLon(d),si=signOf(ml);
  const cm=cosFor(d);
  if(cm){
    /* the engine owns the sky, the moon, natal and convergence layers for this month */
    (cm.ev[k]||[]).forEach(e=>{if(LON[e.lay]!==false&&LON[e.lay]!==undefined)out.push({id:e.id,lay:e.lay,gl:e.gl,t:e.title,s:e.sub||'',date:k,big:e.big?1:0,cos:e});});
    if(LON.lunar&&signOf(moonLon(new Date(d.getTime()-86400000)))!==si)
      out.push({id:'ms-'+k,lay:'lunar',gl:'☽︎',t:`moon enters ${SIGNS[si]}`,s:`${MOOD[pn].split('.')[0]} · ${SIGN_READ[SIGNS[si]][0]}`,date:k});
    if(LON.ritual){const r=RIT.find(x=>x.ph.includes(pn));if(r&&(pn==='new moon'||pn==='full moon'))out.push({id:'r-'+k,lay:'ritual',gl:'✧',t:`matched working · ${r.n}`,s:r.v,date:k});}
    if(LON.sixmo&&pn==='new moon')out.push({id:'6-'+k,lay:'sixmo',gl:'◐',t:'six-month checkpoint',s:'new moon = plan review. what shipped, what stalled?',date:k});
    return out.concat(mineFor(k));
  }
  const pv=phase(new Date(d.getTime()-86400000));
  const cross=(a,b,t)=>(a<t&&b>=t)||(a>b&&(b>=t));
  if(LON.lunation){
    if(pv>.9&&p<.1)out.push({id:'nm-'+k,lay:'lunation',gl:'●',t:`new moon in ${SIGNS[si]}`,s:`${degIn(ml).toFixed(0)}° ${GLY[si]} · the month's seed`,date:k});
    if(pv<.5&&p>=.5)out.push({id:'fm-'+k,lay:'lunation',gl:'○',t:`full moon in ${SIGNS[si]}`,s:`${degIn(ml).toFixed(0)}° ${GLY[si]} · everything gets lit`,date:k});
  }
  if(LON.lunar&&signOf(moonLon(new Date(d.getTime()-86400000)))!==si)
    out.push({id:'ms-'+k,lay:'lunar',gl:'☽︎',t:`moon enters ${SIGNS[si]}`,s:`${MOOD[pn].split('.')[0]} · ${SIGN_READ[SIGNS[si]][0]}`,date:k});
  if(LON.void){const v=voidWindow(d);if(v.active)out.push({id:'v-'+k,lay:'void',gl:'⊘',t:'moon goes void',s:`~${v.hrs}h before she changes signs — don't launch`,date:k});}
  if(LON.natal&&S.me.natal){ /* transit to natal: moon through natal sun/moon sign (engine placements) */
    const b3=big3Of(S.me), nsun=b3.sun, nmoon=b3.moon;
    if(si===nsun)out.push({id:'tn-'+k,lay:'natal',gl:'✦',t:'moon conjunct your natal sun',s:'the month\'s emotional reset lands on your identity',date:k});
    else if(si===nmoon)out.push({id:'lr-'+k,lay:'lunret',gl:'☾',t:'lunar return',s:'the moon came home — your monthly reboot',date:k});
  }
  if(LON.lunation&&k==='2026-08-12')out.push({id:'ec',lay:'lunation',gl:'✦',t:'total solar eclipse · 21° leo',s:'a door slams and a spotlight turns on in the same second',date:k,big:1});
  if(LON.retro&&k==='2026-07-23')out.push({id:'md',lay:'retro',gl:'℞',t:'mercury stations direct',s:'the fog lifts. send it after.',date:k});
  if(LON.ritual){const r=RIT.find(x=>x.ph.includes(pn));if(r&&(pn==='new moon'||pn==='full moon'))out.push({id:'r-'+k,lay:'ritual',gl:'✧',t:`matched working · ${r.n}`,s:r.v,date:k});}
  if(LON.prof&&d.getDate()===1)out.push({id:'pf-'+k,lay:'prof',gl:'◈',t:'profection check-in',s:'which house is running your year — and who rules it',date:k});
  if(LON.sixmo&&pn==='new moon')out.push({id:'6-'+k,lay:'sixmo',gl:'◐',t:'six-month checkpoint',s:'new moon = plan review. what shipped, what stalled?',date:k});
  return out.concat(mineFor(k));
}
function mineFor(k){
  const out=[];
  S.cal.filter(c=>c.date===k).forEach(c=>{if(LON[c.lay||'ritual']!==false)out.push({...c,gl:c.gl||'✧',lay:c.lay||'ritual',mine:1});});
  S.entries.filter(e=>e.date===k).forEach(e=>{
    const lay=e.type==='pull'?'pull':e.type==='ritual'?'ritual':e.type==='cycle'?'cycle':e.type==='sex'?'sex':'entry';
    if(LON[lay])out.push({id:'e-'+e.id,lay,gl:e.type==='pull'?'✦':e.type==='ritual'?'✧':e.type==='cycle'?'◉':e.type==='sex'?'◇':'✧',
      t:e.title||(e.type==='pull'?'tarot pull':'journal entry'),s:(e.body||'').slice(0,60)||'logged',date:k,entry:1});
  });
  return out;
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
function evRow(e){const m=layMeta(e.lay)||{c:'#FF9A3C'};
  return `<button class="evrow" onclick="openEv('${e.date}','${e.id}')"><span class="g" style="background:${m.c}22;color:${m.c}">${e.gl}</span>
    <div><div class="e1">${e.t}</div><div class="e2">${e.s}</div></div><span class="w">${e.when||fmt(parse(e.date))}</span></button>`;}

let CV='dots';    /* the v1 grid by default; 'words' is the sheet view, 'ledger' the list */
const ccDot=c=>`<i class="cc-dot" style="background:${c}"></i>`;
const lc=e=>(layMeta(e.lay)||{c:'var(--c-sky)'}).c;
const layGroup=id=>{for(const g of LAYERS)if(g.items.some(i=>i.id===id))return g.g.replace(/^(the|your) /,'');return'sky';};
const lunOf=d=>{const p=phase(d),pv=phase(new Date(d.getTime()-864e5));return pv>.9&&p<.1?'●':pv<.5&&p>=.5?'○':'';};
const CC_LEG_GROUPS=[
 {n:'moon',ids:['lunar','lunation','void','lunret','cycle'],c:'#8FD0F2'},
 {n:'sky',ids:['global','retro','rulers'],c:'#5a564f'},
 {n:'natal',ids:['natal','promise','theirs','syn','comp'],c:'#F4CC2E'},
 {n:'convergence',ids:['prof','firdaria','zr','prog','power','sixmo'],c:'#D6EC4F'},
 {n:'divination',ids:['pull','entry'],c:'#C7B0F5'},
 {n:'ritual',ids:['ritual','sex'],c:'#FF5A36'}
];
document.querySelectorAll('#ccView button').forEach(b=>b.onclick=()=>{CV=b.dataset.v;document.querySelectorAll('#ccView button').forEach(x=>x.classList.toggle('on',x===b));renderCal();});
function ccToday(){const t=new Date();S.cursor=new Date(t.getFullYear(),t.getMonth(),1);S.sel=key(t);renderCal();}
/* the sheet's shorthand, so a day cell reads like the printed cosmic calendar */
const short=t=>String(t)
  .replace(/^moon enters (\w+)$/,(m,g)=>`☽︎ → ${g}`)
  .replace(/^new moon in (\w+)$/,(m,g)=>`● NM ${g}`)
  .replace(/^full moon in (\w+)$/,(m,g)=>`○ FM ${g}`)
  .replace(/^moon conjunct your natal (\w+)$/,(m,g)=>`☽︎ ☌ natal ${g}`)
  .replace(/^moon goes void$/,'☽︎ void')
  .replace(/^matched working · /,'✧ ')
  .replace(/^mercury stations direct$/,'☿︎ direct')
  .replace(/^total solar eclipse · /,'● eclipse ');
/* ══════════ CALENDAR VIEW ══════════ */
function renderCal(){
  const c=S.cursor,y=c.getFullYear(),m=c.getMonth(),dim=new Date(y,m+1,0).getDate(),tk=key(new Date());
  const D=[];for(let dd=1;dd<=dim;dd++){const d=new Date(y,m,dd),ev=evForDate(d);D.push({d,dd,k:key(d),ev,lun:lunOf(d),flag:ev.some(e=>e.big)||ev.length>=3});}
  const all=D.flatMap(x=>x.ev),nf=D.filter(x=>x.flag).length,grp={};
  all.forEach(e=>{const g=layGroup(e.lay);grp[g]=(grp[g]||0)+1;});
  const lonN=Object.values(LON).filter(Boolean).length,layN=Object.keys(LON).length;
  const mn=S.me.natal,sect=mn&&mn.timeKnown&&mn.cusps.porphyry?(houseOf(bodyOf(mn,'sun').lon,mn.cusps.porphyry)>=7?'day chart':'night chart'):'';
  document.getElementById('ccMeta').innerHTML=`<button class="lk" onclick="pickHouseSystem()">${HSYS[S.set.house]||'porphyry'}</button>${sect?' · '+sect:''}<br>${esc(S.me.place||'location pending')}<br><button class="lk" onclick="nav('layers')">${lonN} of ${layN} layers on ›</button>`;
  const me=S.me;let nat;
  if(me.natal){const ch=me.natal,cu=cuspsOf(ch),pt=lon=>`${dm(degIn(lon))} ${GLY[signOf(lon)]}`;
    const lit=k=>{const b=bodyOf(ch,k);if(!b)return'';const h=cu?houseOf(b.lon,cu):null;return `${k==='sun'?'☉︎':'☽︎'} ${pt(b.lon)}${h?' '+h+'H':''}`;};
    nat=`${ch.timeKnown?`ASC ${pt(ch.asc)} · MC ${pt(ch.mc)} · `:''}${lit('sun')} · ${lit('moon')} · <b>my chart ›</b>`;}
  else if(me.date)nat='casting your chart with the engine… <b>open ›</b>';
  else nat='natal chart not cast · <b>add birth data ›</b> to see transits to natal';
  document.getElementById('ccNatal').innerHTML=nat;
  document.getElementById('mTitle').innerHTML=`<em>${c.toLocaleDateString('en-us',{month:'long'})}</em> ${y}`;
  document.getElementById('ccStats').onclick=()=>explain('stats');
  document.getElementById('ccStats').innerHTML=`${all.length} ${all.length===1?'entry':'entries'} · ${nf} flagged<br>${Object.entries(grp).map(([g,n])=>g+' '+n).join(' · ')||'a quiet month'}`;
  const s0=signOf(sunLon(D[0].d)),ing=D.find(x=>signOf(sunLon(x.d))!==s0);
  const luns=D.filter(x=>x.lun).map(x=>`${x.lun} ${x.lun==='●'?'nm':'fm'} ${x.dd}`);
  document.getElementById('ccStand').onclick=()=>explain('stand');
  document.getElementById('ccStand').innerHTML=`☉︎ sun in ${SIGNS[s0]} ${GLY[s0]}${ing?` → ${SIGNS[(s0+1)%12]} ${GLY[(s0+1)%12]} ${fmt(ing.d)}`:' all month'}${luns.length?' · '+luns.join(' · '):''}`;
  const g=document.getElementById('mGrid');
  if(CV==='ledger'){
    g.className='cc-ledger';
    const rows=D.filter(x=>x.ev.length||S.notes[x.k]);
    g.innerHTML=rows.length?rows.map(x=>`<button class="cc-lr${x.k===S.sel?' sel':''}${x.flag?' flag':''}" onclick="pickDay('${x.k}')">
      <span class="cc-ld"><b>${x.dd}${x.lun?`<small style="font-size:10px">${x.lun}</small>`:''}</b><span>${x.d.toLocaleDateString('en-us',{weekday:'short'})}</span></span>
      <span class="cc-le">${x.ev.map(e=>`<span class="cc-ev">${ccDot(lc(e))}<span>${e.t}</span></span>`).join('')}${S.notes[x.k]?`<span class="cc-ev"><span class="cc-nt">✧</span><span style="opacity:.7">${S.notes[x.k]}</span></span>`:''}</span></button>`).join('')
      :'<div class="cc-lq">nothing on the books with these layers. switch a few on below.</div>';
  } else {
    g.className='cc-grid'+(CV==='words'?' words':'');
    let o=['mon','tue','wed','thu','fri','sat','sun'].map(d=>`<div class="cc-dl">${d}</div>`).join('');
    const pad=(new Date(y,m,1).getDay()+6)%7;
    for(let i=0;i<pad;i++)o+='<div class="cc-day pad"></div>';
    D.forEach(x=>{
      const cols=[...new Set(x.ev.map(lc))].slice(0,6);
      const body=CV==='words'?x.ev.slice(0,3).map(e=>`<span class="cc-ev">${ccDot(lc(e))}<span>${short(e.t)}</span></span>`).join('')
        :`<span class="cc-pips">${cols.map(ccDot).join('')}</span>`;
      const cnt=CV==='words'?(x.ev.length>3?'+'+(x.ev.length-3):''):(x.ev.length>1?x.ev.length:'');
      o+=`<button class="cc-day${x.k===tk?' tod':''}${x.k===S.sel?' sel':''}${x.flag?' flag':''}" onclick="pickDay('${x.k}')" aria-label="${fmtL(x.d)}, ${x.ev.length} events">
        <span class="cc-num">${x.dd}${S.notes[x.k]?'<span class="cc-nt">✧</span>':''}</span>${x.lun?`<span class="cc-mg">${x.lun}</span>`:''}${body}${cnt?`<span class="cc-cnt">${cnt}</span>`:''}</button>`;
    });
    const tail=(7-(pad+dim)%7)%7;for(let i=0;i<tail;i++)o+='<div class="cc-day pad"></div>';
    g.innerHTML=o;
  }
  document.getElementById('quickLay').innerHTML=CC_LEG_GROUPS.map(g=>{
    const allOn=g.ids.every(id=>LON[id]);const someOn=g.ids.some(id=>LON[id]);
    return `<button class="cc-li${someOn?'':' off'}" onclick="CC_LEG_GROUPS.find(x=>x.n==='${g.n}').ids.forEach(id=>LON[id]=${allOn?'false':'true'});renderCal()">${ccDot(g.c)}${g.n}</button>`;}).join('');
  const sd=parse(S.sel),ev=evForDate(sd),p=phase(sd),si=signOf(moonLon(sd));
  document.getElementById('dSelLab').innerHTML=`${fmtL(sd)}<button class="lk" onclick="moonSheet('${S.sel}')">${phaseName(p)} · ${GLY[si]} ${SIGNS[si]} ›</button>`;
  document.getElementById('dSel').innerHTML=ev.length?ev.map(e=>evRow(e)).join('')
    :`<button class="card qd" onclick="openAdd('${S.sel}')">nothing on the books. the sky's quiet — ${MOOD[phaseName(p)].toLowerCase()}<span class="qd-go">+ add something to ${fmt(sd)} ›</span></button>`;
  const nt=document.getElementById('ccNote');if(document.activeElement!==nt)nt.value=S.notes[S.sel]||'';
  nt.placeholder=`what happened on ${fmt(sd)}? the record keeps it.`;
  document.getElementById('ccNoteDay').textContent=fmt(sd);
  const W=[];
  if(ing)W.push({k:ing.k,d:ing.d,c:'var(--c-sky)',t:`sun enters ${SIGNS[(s0+1)%12]} ${GLY[(s0+1)%12]}`,s:'the season turns'});
  D.forEach(x=>x.ev.forEach(e=>{if(e.big||['lunation','retro','natal','lunret','zr','promise'].includes(e.lay))W.push({k:x.k,d:x.d,id:e.id,c:lc(e),t:e.t,s:e.s});}));
  D.filter(x=>x.flag&&!W.some(w=>w.k===x.k)).forEach(x=>W.push({k:x.k,d:x.d,c:'#FF5A36',t:`${x.ev.length} things stack up`,s:x.ev.slice(0,3).map(e=>e.t).join(' · ')}));
  W.sort((a,b)=>a.d-b.d);
  document.getElementById('ccWatch').innerHTML=W.length?W.slice(0,6).map(w=>`<button class="cc-wi" onclick="${w.id?`openEv('${w.k}','${w.id}')`:`pickDay('${w.k}')`}">
    <span class="cc-wd">${fmt(w.d)}</span><span><span class="cc-wt">${ccDot(w.c)}${w.t}</span><span class="cc-ws">${w.s}</span></span></button>`).join('')
    :'<div class="cc-ws" style="padding:8px 0">nothing loud this month with the layers you have on.</div>';
  document.getElementById('ccFootL').innerHTML=`<button class="lk" onclick="nav('journal')">${esc(me.name||'you')} · master event list ›</button>`;
  document.getElementById('ccFootR').innerHTML=`<button class="lk" onclick="document.querySelector('#ccView [data-v=ledger]').click()">sheet ${m+1} of 12 · ledger ›</button>`;
}
function mShift(n){S.cursor=new Date(S.cursor.getFullYear(),S.cursor.getMonth()+n,1);const t=new Date();
  S.sel=(t.getFullYear()===S.cursor.getFullYear()&&t.getMonth()===S.cursor.getMonth())?key(t):key(S.cursor);renderCal();}
function ccToday(){const t=new Date();S.cursor=new Date(t.getFullYear(),t.getMonth(),1);S.sel=key(t);renderCal();}
function pickDay(k){S.sel=k;const d=parse(k);if(d.getMonth()!==S.cursor.getMonth()||d.getFullYear()!==S.cursor.getFullYear())S.cursor=new Date(d.getFullYear(),d.getMonth(),1);renderCal();}
function renderLayers(){
  document.getElementById('layerGroups').innerHTML=LAYERS.map(g=>
   `<div class="lab">${g.g}</div><div class="card">${g.items.map(i=>
     `<button class="lay" onclick="LON['${i.id}']=!LON['${i.id}'];renderLayers();toast('${i.n} ${LON[i.id]?'off':'on'}')">
        <span class="lg" style="display:flex;align-items:center;justify-content:center;gap:4px;color:var(--moon)"><i class="cc-dot" style="background:${i.c};width:8px;height:8px"></i>${i.gl}</span>
        <span class="ln">${i.n}<div class="ld">${i.d}</div></span>
        <span class="tog${LON[i.id]?' on':''}"></span></button>`).join('')}</div>`).join('');
}
/* a calendar description, laid out: CAPS lines are section heads, the rest is text */
function cosText(txt){
  return String(txt||'').split('\n').map(l=>{const t=l.trim();if(!t)return'';
    if(/^[A-Z][A-Z ·+&/0-9-]+$/.test(t)&&t.length<40)return `<div class="cos-h">${esc(t.toLowerCase())}</div>`;
    return `<div class="cos-l">${esc(t)}</div>`;}).join('');
}
function cosDetail(dk,ev){
  const c=ev.cos,d=new Date(c.t);
  const when=c.allDay?fmtL(parse(dk)):`${fmtL(parse(dk))} · ${d.toLocaleTimeString('en-us',{hour:'numeric',minute:'2-digit',timeZoneName:'short'})}`;
  const blk=(lab,gl,txt,cls)=>txt?`<div class="card cos${cls?' '+cls:''}"><div class="cos-lab">${gl} ${lab}</div>${cosText(txt)}</div>`:'';
  const noTime=!c.natal&&!c.conv&&S.me.natal&&!S.me.natal.timeKnown;
  return `<div class="eb"><span class="cer">✧ · </span><button class="lk" onclick="nav('layers')">${(layMeta(ev.lay)||{n:'the sky'}).n}</button><span class="cer"> · ✧</span></div>
    <div class="h1 cos-title">${esc(c.title)}</div>
    <div class="h1s"><button class="lk" onclick="pickDay('${dk}');nav('cal')">${when}</button>${c.house?` · <button class="lk" onclick="explainHouse(${c.house})">your ${c.house}H</button>`:''}</div>
    ${blk('the sky','☉︎',c.sky,'sky')}
    ${blk('natal','✦',c.natal)}
    ${blk('divination','☽︎',c.divination)}
    ${blk('ritual','✧',c.ritual)}
    ${blk('convergence','◈',c.conv)}
    ${noTime?`<button class="card qd" onclick="castMine()">add your birth time and this event gets your houses — natal, divination and ritual layers.<span class="qd-go">add birth time ›</span></button>`:''}`;
}
function openEv(dk,id){
  const d=parse(dk), ev=evForDate(d).find(e=>e.id===id)||{t:'the sky',s:'',lay:'global',gl:'☉︎'};
  if(ev.cos){
    const p=phase(d),pn=phaseName(p),rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
    document.getElementById('evBody').innerHTML=cosDetail(dk,ev)+
     `<div class="lab">work with this sky</div>
      <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✧ working</b>
        <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.n}</div>
        <div style="font-size:12.5px;color:var(--dust)">${rit.v}</div>
        <button class="btn g" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),80)">open the working ›</button></div>
      <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✦ spread</b>
        <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.pair}</div>
        <button class="btn g" onclick="openPull(0,'${rit.pair}')">✦ pull this spread ›</button></div>
      <button class="btn" onclick="addCal('${dk}','${rit.n}')">+ add a working to this day</button>`;
    nav('event');return;
  }
  const p=phase(d),pn=phaseName(p),si=signOf(moonLon(d));
  const rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
  const r=dailyRead(d);
  document.getElementById('evBody').innerHTML=
   `<div class="eb"><span class="cer">✧ · </span><button class="lk" onclick="nav('layers')">${(layMeta(ev.lay)||{n:'the sky'}).n}</button><span class="cer"> · ✧</span></div>
    <div class="h1"><em>${ev.t.split(' ')[0]}</em> ${ev.t.split(' ').slice(1).join(' ')}</div>
    <div class="h1s"><button class="lk" onclick="pickDay('${dk}');nav('cal')">${fmtL(d)}</button> · <button class="lk" onclick="moonSheet('${dk}')">${pn} in <b>${SIGNS[si]} ${GLY[si]}</b></button></div>
    ${ev.mine?`<div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✧ your note</b><div style="margin-top:6px">${esc(ev.s||'')}</div><button class="btn g sm" onclick="delEvent('${ev.id}');goBack('cal')">remove from calendar</button></div>`:''}
    <div class="pnl"><div class="rl cap" style="font-size:9.5px;color:var(--deep);font-weight:600">✦ the astrology first</div>
      <p style="font-size:14px;margin-top:9px">${r.l1}</p>
      <p style="font-size:14px;margin-top:8px;color:var(--dust)">${r.l2}</p></div>
    <div class="lab">work with this sky</div>
    <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✧ working</b>
      <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.n}</div>
      <div style="font-size:12.5px;color:var(--dust)">${rit.v}</div>
      <button class="btn g" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),80)">open the working ›</button></div>
    <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✦ spread</b>
      <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.pair}</div>
      <button class="btn g" onclick="openPull(0,'${rit.pair}')">✦ pull this spread ›</button></div>
    <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">❧ ingredients</b>
      <div class="ich" style="margin-top:8px">${rit.need.map(n=>`<button class="ic2" onclick="nav('lib');setShelf('ing');setTimeout(()=>jumpIng('${n}'),80)">${n}</button>`).join('')}</div></div>
    <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✧ journal prompt</b>
      <div class="sf" style="font-size:15px;margin-top:6px;color:var(--dust)">&ldquo;${PROMPTS[pn]}&rdquo;</div>
      <button class="btn g" onclick="openEntry('${dk}')">write it ›</button></div>
    <button class="btn" onclick="addCal('${dk}','${rit.n}')">+ add this to my calendar</button>`;
  nav('event');
}
function addCal(dk,t){S.cal.push({id:'c'+Date.now(),date:dk,lay:'ritual',gl:'✧',t,s:'planned working'});toast('✧ on the calendar — the sky will remind you');renderCal();}

/* ══════════ ORBIT ══════════ */
function renderOrbit(){
  const m=S.me;
  document.getElementById('orbitMe').innerHTML= m.date?
   `<div style="display:flex;gap:14px;align-items:center"><div class="disc">${(m.name||'y')[0]}</div>
      <div><div style="font-size:18px;font-weight:700">${esc(m.name||'you')}</div><div style="font-size:12px;color:var(--dust)">${esc(m.place||'—')} · ${m.date}</div></div></div>
    ${big3(m,'me')}<button class="btn g" onclick="nav('natal')">open my chart ›</button>`
   :`<div class="empty"><div class="eg">☉︎</div><div class="et">no chart yet</div>
      <div class="ed">add your birth data and every transit in this app starts talking to <i>you</i> specifically.</div>
      <button class="btn" onclick="castMine()">cast my chart</button></div>`;
  document.getElementById('orbitList').innerHTML= S.people.length? S.people.map((p,i)=>
   `<button class="row" onclick="openPerson(${i})"><span class="disc" style="flex:0 0 40px;height:40px;font-size:16px">${(p.name||'?')[0]}</span>
     <span><span class="t">${esc(p.name)}</span><div class="s">${p.natal?(()=>{const b=big3Of(p);return `☉︎ ${SIGNS[b.sun]} · ☽︎ ${SIGNS[b.moon]}${b.rise!=null?' · ↑ '+SIGNS[b.rise]:''}`;})():p.date?'casting…':'birth data pending'}</div></span><span class="c">›</span></button>`).join('')
   :`<div class="card"><div class="empty" style="padding:20px 8px"><div class="eg">☍</div><div class="et">orbit's empty</div>
      <div class="ed">add the people whose charts you actually care about. their transits become a calendar layer you can toggle on.</div></div></div>`;
}
function big3(p,who){
  if(!p.date)return'';
  const b=big3Of(p), ref=who===undefined?'me':who;
  const cell=(g,k,i,why)=>`<button class="b3c" onclick="${i!=null?`explainPlacement(${JSON.stringify(ref).replace(/"/g,'&quot;')},'${k==='rising'?'asc':k}')`:why}">
      <div class="g">${g}</div><div class="k">${k}</div><div class="v">${i!=null?SIGNS[i]+' '+GLY[i]:(b.pending?'casting…':'—')}</div></button>`;
  const riseWhy=b.noTime?`explain('rising')`:`explain('rising')`;
  return `<div class="b3">${cell('☉︎','sun',b.sun,"explain('sun')")}${cell('☽︎','moon',b.moon,"explain('moon')")}${
    b.rise!=null?cell('↑','rising',b.rise):`<button class="b3c" onclick="${ref==='me'?'castMine()':riseWhy}"><div class="g">↑</div><div class="k">rising</div><div class="v">${b.noTime?'add birth time':(b.pending?'casting…':'—')}</div></button>`}</div>`;
}
function openPerson(i){
  if(i===undefined){
    sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">☍ · add to orbit · ☍</div>
     <div class="sf" style="font-size:24px;text-align:center;margin-top:4px">someone new</div>
     <div class="ob-f" style="margin-top:14px">
       <input id="pN" placeholder="name" aria-label="name">
       <label class="ob-label"><span class="ob-lt">date of birth</span><input id="pD" type="date"></label>
       <label class="ob-label"><span class="ob-lt">time of birth · optional</span><input id="pT" type="time"></label>
       <div style="position:relative"><input id="pP" placeholder="birth city — start typing" autocomplete="off" aria-label="birth city" oninput="placeSearch(this.value,'pPlaceList',c=>pCity=c)"><div id="pPlaceList" class="ob-places"></div></div>
       <select id="pR" style="appearance:none"><option>partner</option><option>ex</option><option>situationship</option><option>friend</option><option>family</option><option>enemy</option><option>client</option></select>
     </div>
     <button class="btn" onclick="savePerson()">cast their chart</button>`);
    return;
  }
  const p=S.people[i];
  document.getElementById('pBody').innerHTML=
   `<div class="eb"><span class="cer">☍ · </span>${p.rel||'orbit'}<span class="cer"> · ☍</span></div>
    <div class="h1 sf">${p.name}<span class="k">✦</span></div>
    <div class="h1s">${p.place||'—'} · ${p.date||'no birth data'}</div>
    <div class="pnl">${p.natal?`<div class="pwheel">${wheelSVG(p.natal,i)}</div>`:''}${big3(p,i)}</div>
    <div class="lab">their sky today</div>
    <div class="card">${p.date?theirSky(p):'<div style="font-size:13px;color:var(--dust)">add their birth date to read their transits</div>'}</div>
    <div class="lab">entanglement</div>
    <button class="row" onclick="${p.natal?`showCompare('syn',${i})`:`openCompare('syn')`}"><span class="ic">◇</span><span><span class="t">synastry</span><div class="s">how your charts touch</div></span><span class="c">›</span></button>
    <button class="row" onclick="${p.natal?`showCompare('comp',${i})`:`openCompare('comp')`}"><span class="ic">◍</span><span><span class="t">composite</span><div class="s">the relationship as its own being</div></span><span class="c">›</span></button>
    <button class="row" onclick="LON.theirs=true;nav('cal');toast('their transits are now a calendar layer ☍')"><span class="ic">✧</span><span><span class="t">show their transits on my calendar</span><div class="s">toggle them on as a layer</div></span><span class="c">›</span></button>
    <div class="lab">the record · ${p.name}</div>
    <button class="btn g" onclick="openEntry(null,'${p.name}')">+ journal about ${p.name}</button>
    <div id="pEntries"></div>`;
  const es=S.entries.filter(e=>e.who===p.name);
  document.getElementById('pEntries').innerHTML=es.length?es.map(entHTML).join('')
    :'<div class="card" style="font-size:13px;color:var(--dust)">nothing logged yet. every note, pull, and pattern about them lands here.</div>';
  nav('person');
}
function theirSky(p){
  const d=new Date(),si=signOf(moonLon(d));
  const b3=big3Of(p);if(b3.sun==null)return '<div style="font-size:13px;color:var(--dust)">their chart is still casting — check back in a sec</div>';
  const nsun=b3.sun,nmoon=b3.moon;
  const hit=si===nsun?'the moon is sitting on their sun today — they\'re feeling extremely themselves. handle accordingly.'
    :si===nmoon?'lunar return for them. they\'re raw, resetting, and probably won\'t admit it.'
    :`moon in ${SIGNS[si]} for them too — ${SIGN_READ[SIGNS[si]][1]}`;
  return `<div class="tr"><span class="g">☽︎</span><div><div class="a">moon in ${SIGNS[si]} ${GLY[si]}</div><div class="b">${hit}</div></div></div>`;
}
let pCity=null;
function savePerson(){
  const n=document.getElementById('pN').value.trim();if(!n)return toast('name them first ☍');
  const p={name:n,date:document.getElementById('pD').value,time:document.getElementById('pT').value,place:document.getElementById('pP').value,rel:document.getElementById('pR').value};
  if(pCity){p.lat=pCity.lat;p.lng=pCity.lng;p.tzName=pCity.tz;}
  S.people.push(p);pCity=null;
  closeSheet();renderOrbit();tiSave();
  if(!p.date)return toast('☍ in orbit — add a birth date to cast their chart');
  toast('☍ casting their chart…');
  castChart(p,false).then(ch=>{p.natal=ch;renderOrbit();tiSave();const b=big3Of(p);
    toast(`✦ ${esc(p.name)} is in orbit — ${SIGNS[b.sun]} sun${b.rise!=null?', '+SIGNS[b.rise]+' rising':''}`);})
   .catch(e=>toast('✦ '+String(e.message||e).toLowerCase()));
}

/* ══════════ GRIMOIRE ══════════ */
function renderGrim(){
  const d=new Date(),p=phase(d),pn=phaseName(p),si=signOf(moonLon(d));
  const rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
  document.getElementById('gCount').textContent=`${S.entries.length} ${S.entries.length===1?'entry':'entries'}`;
  document.getElementById('gSky').innerHTML=
   `<button class="gsky" onclick="moonSheet()" style="display:flex;gap:13px;align-items:center;position:relative;width:100%">
      <div class="mn">${moonSVG(p,46)}</div>
      <div><div class="t1">${pn} in ${SIGNS[si]} ${GLY[si]}</div><div class="t2">${MOOD[pn]}</div></div><span class="c">›</span></button>`;
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
   `<button class="st" onclick="nav('pat')"><div class="v">${streak()}</div><div class="k">day streak</div></button>
    <button class="st" onclick="S.jfilter='pull';nav('journal')"><div class="v">${pulls.length}</div><div class="k">pulls</div></button>
    <button class="st" onclick="${allc.length?`explainSuit('${({w:'wands',c:'cups',s:'swords',p:'pents'})[tops[0]]}')`:"nav('pat')"}"><div class="v">${allc.length?SUIT[tops[0]][1]:'—'}</div><div class="k">your suit</div></button>
    <button class="st" onclick="nav('pat')"><div class="v">${allc.length?Math.round(revs/allc.length*100)+'%':'—'}</div><div class="k">reversed</div></button>`;
  document.getElementById('gRec').innerHTML= top.length? top.slice(0,8).map(([k,n])=>{
    const c=byKey(k);return `<button class="recc" onclick="openCard('${k}')"><img src="${IMG[k]||''}" alt="${c.n}"><div class="n">${c.n}</div><div class="x">×${n}</div></button>`;}).join('')
    :'<button class="card qd" style="flex:1" onclick="openPull()">log a few pulls and the repeats show up here — with the actual card art ✦<span class="qd-go">log a pull ›</span></button>';
  const planned=S.cal.length, done=S.entries.filter(e=>e.type==='ritual').length;
  document.getElementById('gPractice').innerHTML=
   `<button class="chip" onclick="nav('cal')">planned · ${planned}</button>
    <button class="chip" onclick="S.jfilter='ritual';nav('journal')">performed · ${done}</button>
    <button class="chip" onclick="S.jfilter='pull';nav('journal')">pulls · ${pulls.length}</button>
    <button class="chip" onclick="S.jfilter='note';nav('journal')">notes · ${S.entries.filter(e=>e.type==='note').length}</button>`;
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
     <div class="ed">the app can't clock a pattern it hasn't seen. log a few pulls — repeats, reversals, and your dominant suit all surface here automatically.</div>
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
        <img src="${IMG[tc.k]}" style="width:86px;border-radius:0;border:1px solid var(--line)">
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
    h.innerHTML=`<div class="lab">the deck · all 78 · 1909 original scans</div>
      <div class="deck">${DECK.map(c=>`<button class="tc" onclick="openCard('${c.k}')"><img src="${IMG[c.k]||''}" loading="lazy" alt="${c.n}"></button>`).join('')}</div>
      <div class="hint">tap any card to open it ✦</div>
      <div class="lab">spreads · yours</div>${SPR.yours.map(sprHTML).join('')}
      <div class="lab">spreads · classic</div>${SPR.classic.map(sprHTML).join('')}
      <div class="lab">✧ tricks & tips</div>
      <div class="card">${TRICKS.map(t=>`<div class="pinr"><span class="e" style="flex:0 0 auto">${t[0].split(' ')[0]}</span><span class="s">${t[0].split(' ').slice(1).join(' ')}<div style="font-weight:400;color:var(--dust);font-size:12px;margin-top:2px">${t[1]}</div></span></div>`).join('')}</div>`;
    wire(h);
  } else if(shelf==='work'){
    const L=RIT.filter(r=>tagF==='all'||r.t.includes(tagF));
    h.innerHTML=`<div class="lab">by intention</div>
      <div class="chips">${TAGS.map(t=>`<button class="chip${t===tagF?' on':''}" onclick="tagF='${t}';renderShelf()">${t}</button>`).join('')}</div>
      <div class="lab">the workings</div>
      ${L.map(r=>`<div class="wk" data-n="${r.n}"><button class="wkh"><span><span class="nm">${r.n}</span><div class="mt">${r.s} · &ldquo;${r.v}&rdquo;</div></span><span class="wkc">›</span></button>
        <div class="wkb">
          <div class="chips">${r.t.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          <div class="tim"><b>◇ best timing</b>${r.best}<br><span style="font-weight:700">next window: ${nextWin(r)}</span>
            <button class="btn g sm" style="margin-top:8px" onclick="addCal('${nextWinK(r)}','${r.n}')">+ add to calendar</button></div>
          <div class="wr"><b>△ you'll need</b><div class="ich">${r.need.map(n=>`<button class="ic2" onclick="setShelf('ing');setTimeout(()=>jumpIng('${n}'),60)">${n}</button>`).join('')}</div></div>
          <div class="wr"><b>✦ pair it with</b><button class="ic2" onclick="setShelf('tarot')">${r.pair}</button></div>
          <div class="wr"><b>◈ the steps</b><ol>${r.st.map(s=>`<li>${s}</li>`).join('')}</ol></div>
          <div class="wr"><b>◉ it's working when</b>${r.sg}</div>
          <button class="btn" onclick="logRitual('${r.n}')">✧ log this working</button>
        </div></div>`).join('')}`;
    wire(h);
  } else {
    h.innerHTML=`<div class="lab">the pantry — every link goes both ways</div>
      ${PANTRY.map(g=>`<div class="lab">${g.c}</div>${g.i.map(it=>
        `<div class="pan" data-i="${it.n}"><div class="t"><span style="font-size:17px;color:var(--deep)">${it.e}</span>
          <div><div class="n">${it.n}</div><div class="w">${it.w}</div></div></div>
          <div class="m"><b>uses</b> ${it.u} · <b>corr</b> ${it.o}</div>
          <div class="uses"><span class="k">in →</span>${it.r.map(r=>`<button class="ic2" onclick="setShelf('work');setTimeout(()=>jumpRit('${r}'),60)">${r}</button>`).join('')}</div>
          <div class="uses"><span class="k">cards →</span>${it.cd.map(k=>`<button class="ic2" onclick="openCard('${k}')">${byKey(k).n}</button>`).join('')}</div></div>`).join('')}`).join('')}`;
  }
}
const sprHTML=s=>`<div class="wk"><button class="wkh"><span><span class="nm">${s.n}</span><div class="mt">${s.f}</div></span><span class="wkc">›</span></button>
  <div class="wkb"><div class="pos">${s.p.map((p,i)=>`<div><div class="n">${i+1}</div><div class="p">${p}</div></div>`).join('')}</div>
  <button class="btn g" onclick="openPull(0,'${s.n}')">✦ log a pull on this spread</button></div></div>`;
function wire(h){h.querySelectorAll('.wkh').forEach(b=>b.onclick=()=>b.parentElement.classList.toggle('open'));}
function nextWin(r){const d=new Date();for(let i=0;i<45;i++){if(r.ph.includes(phaseName(phase(d))))return i===0?'tonight ☽︎':fmt(d);d.setDate(d.getDate()+1);}return'—';}
function nextWinK(r){const d=new Date();for(let i=0;i<45;i++){if(r.ph.includes(phaseName(phase(d))))return key(d);d.setDate(d.getDate()+1);}return key(new Date());}
function jumpIng(n){const e=document.querySelector(`.pan[data-i="${n}"]`);if(e){e.scrollIntoView({behavior:'smooth',block:'center'});e.classList.add('fl');setTimeout(()=>e.classList.remove('fl'),1300);}}
function jumpRit(n){const e=document.querySelector(`.wk[data-n="${n}"]`);if(e){e.classList.add('open');e.scrollIntoView({behavior:'smooth',block:'center'});}}
function logRitual(n){
  S.entries.unshift({id:Date.now(),date:key(new Date()),type:'ritual',title:n,body:'performed under '+phaseName(phase(new Date()))+' in '+SIGNS[signOf(moonLon(new Date()))],photos:[],cards:[]});
  toast('✧ logged in the record — stamped with tonight\'s sky');
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
    <button class="btn g" onclick="closeSheet();openPull(0,null,'${k}')">+ log this card</button>`);
}

/* ══════════ LOG A PULL ══════════ */
let pullSel=[],pullPhotos=[];
function openPull(past,spread,pre){
  pullSel=pre?[{k:pre,rev:false}]:[];pullPhotos=[];
  const today=key(new Date());
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✦ · ${past?'restore the record':'log a pull'} · ✦</div>
    <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">${past?'a past night':'what came up'}</div>
    <div style="font-size:12px;color:var(--dust);text-align:center;margin-top:4px">${spread?'spread · '+spread:'photo it, or pick the cards'}</div>
    <div class="ob-f" style="margin-top:14px">
      <input id="puD" type="date" value="${today}">
      <input id="puT" placeholder="what was the question?">
    </div>
    <div class="lab" style="margin:16px 0 6px">◉ snap it</div>
    <label class="up"><input type="file" id="puF" accept="image/*" multiple hidden>
      <div class="g">◉</div><div class="t">upload a photo of the spread</div><div class="s">tap to choose · the cards stay as you laid them</div></label>
    <div class="prev" id="puP"></div>
    <div class="lab" style="margin:16px 0 6px">✦ or pick the cards</div>
    <input id="puS" placeholder="search all 78…" oninput="renderPick()">
    <div class="selr" id="puSel"></div>
    <div class="pick" id="puPick"></div>
    <div class="hint">tap to add · tap again to reverse ⟲</div>
    <div class="lab" style="margin:14px 0 6px">✧ the read</div>
    <textarea id="puN" rows="3" placeholder="what did it say? what did you feel?"></textarea>
    <button class="btn" onclick="savePull('${spread||''}')">into the book</button>`);
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
function savePull(spread){
  const d=document.getElementById('puD').value||key(new Date());
  if(!pullSel.length&&!pullPhotos.length)return toast('pick a card or snap the spread ✦');
  const dt=parse(d),p=phase(dt),si=signOf(moonLon(dt));
  S.entries.unshift({id:Date.now(),date:d,type:'pull',title:document.getElementById('puT').value||(spread||'a pull'),
    body:document.getElementById('puN').value,photos:[...pullPhotos],cards:[...pullSel],
    sky:`${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}`});
  closeSheet();toast(`✦ into the book — stamped ${phaseName(p)} in ${SIGNS[si]}`);
  renderGrim();renderJournal();
}

/* ══════════ ENTRIES ══════════ */
let entPhotos=[];
function openEntry(dk,who,pre){
  entPhotos=[];
  sheet(`<div class="gb"></div>
    <div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✧ · the record · ✧</div>
    <div class="sf" style="font-size:24px;text-align:center;margin-top:3px">new entry</div>
    <div class="seg" id="etype" style="margin-top:14px">
      <button data-t="note" class="on">✧ note</button><button data-t="ritual">✧ working</button>
      <button data-t="cycle">◉ cycle</button><button data-t="sex">◇ intimacy</button></div>
    <div class="ob-f" style="margin-top:12px">
      <input id="enD" type="date" value="${dk||key(new Date())}">
      <input id="enT" placeholder="title" value="${who?'about '+who:''}">
      <textarea id="enB" rows="4" placeholder="${who?'what happened with '+esc(who)+'?':'what happened, what you noticed, what the sky was doing…'}">${pre?esc(pre)+'\n\n':''}</textarea>
    </div>
    <label class="up"><input type="file" id="enF" accept="image/*" multiple hidden>
      <div class="g">◉</div><div class="t">add photos</div><div class="s">screenshots, spreads, altars, signs</div></label>
    <div class="prev" id="enP"></div>
    ${who?`<input type="hidden" id="enW" value="${who}">`:''}
    <button class="btn" onclick="saveEntry()">✧ into the book</button>`);
  document.getElementById('enF').onchange=e=>{
    [...e.target.files].forEach(f=>{const r=new FileReader();r.onload=x=>{entPhotos.push(x.target.result);
      document.getElementById('enP').innerHTML=entPhotos.map(p=>`<img src="${p}">`).join('');};r.readAsDataURL(f);});};
  document.querySelectorAll('#etype button').forEach(b=>b.onclick=()=>document.querySelectorAll('#etype button').forEach(x=>x.classList.toggle('on',x===b)));
}
function saveEntry(){
  const t=document.querySelector('#etype button.on').dataset.t;
  const d=document.getElementById('enD').value||key(new Date());
  const b=document.getElementById('enB').value.trim();
  if(!b&&!entPhotos.length)return toast('write something or add a photo ✧');
  const dt=parse(d),p=phase(dt),si=signOf(moonLon(dt));
  const w=document.getElementById('enW');
  S.entries.unshift({id:Date.now(),date:d,type:t,title:document.getElementById('enT').value||t,body:b,
    photos:[...entPhotos],cards:[],who:w?w.value:null,sky:`${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}`});
  closeSheet();toast('✧ logged — stamped with that night\'s sky');renderJournal();renderGrim();
}
const EG={note:'✧',pull:'✦',ritual:'✧',cycle:'◉',sex:'◇'};
function entHTML(e){
  return `<div class="ent"><div class="eh"><span class="g">${EG[e.type]||'✧'}</span>
      <div><button class="d lk" onclick="closeSheet();pickDay('${e.date}');nav('cal')">${fmt(parse(e.date))} · ${e.type} ›</button></div>
      <button class="sky lk" onclick="moonSheet('${e.date}')">${e.sky||''}</button></div>
    ${e.title?`<div class="tt">${esc(e.title)}</div>`:''}
    ${e.body?`<div class="bd">${esc(e.body)}</div>`:''}
    ${e.cards&&e.cards.length?`<div class="cds">${e.cards.map(c=>`<button class="cdb" onclick="openCard('${c.k}',${!!c.rev})"><img src="${IMG[c.k]}" class="${c.rev?'rv':''}" alt="${byKey(c.k).n}"></button>`).join('')}</div>`:''}
    ${e.photos&&e.photos.length?`<div class="ph">${e.photos.map(p=>`<img src="${p}">`).join('')}</div>`:''}</div>`;
}
function renderJournal(){
  const F=['all','note','pull','ritual','cycle','sex'];
  document.getElementById('jFilter').innerHTML=F.map(f=>`<button class="chip${S.jfilter===f?' on':''}" onclick="S.jfilter='${f}';renderJournal()" aria-pressed="${S.jfilter===f}">${f==='all'?'all':(EG[f]+' '+f)}</button>`).join('');
  const list=S.entries.filter(e=>S.jfilter==='all'||e.type===S.jfilter).slice().sort((a,b)=>a.date<b.date?1:-1);
  document.getElementById('jLab').textContent=`${list.length} ${list.length===1?'entry':'entries'}`;
  let lastM='';
  document.getElementById('jList').innerHTML=list.length?list.map(e=>{const m=parse(e.date).toLocaleDateString('en-us',{month:'long',year:'numeric'}).toLowerCase();
      const head=m!==lastM?`<div class="jmh">${m}</div>`:'';lastM=m;return head+entHTML(e);}).join('')
    :`<div class="card"><div class="empty"><div class="eg">✧</div><div class="et">the book is empty</div>
       <div class="ed">every pull, working, note, and photo you log lands here — stamped with the sky it happened under. that's what makes it usable data later.</div>
       <button class="btn" onclick="openEntry()">write the first one</button></div></div>`;
}
function jShift(n){S.jcursor=new Date(S.jcursor.getFullYear(),S.jcursor.getMonth()+n,1);renderJournal();}
function jPick(k){ /* kept for old links: a day opens on the calendar now */
  pickDay(k);nav('cal');return;const es=S.entries.filter(e=>e.date===k);if(!es.length)return openEntry(k);
  sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✧ · ${fmt(parse(k))} · ✧</div>
    <div class="sf" style="font-size:22px;text-align:center;margin-top:3px">${es.length} ${es.length===1?'entry':'entries'}</div>
    ${es.map(entHTML).join('')}<button class="btn g" onclick="closeSheet();openEntry('${k}')">+ add another</button>`);}

/* ══════════ NATAL ══════════ */
const PLAN=[['☉︎','sun',0],['☽︎','moon',1],['☿︎','mercury',2],['♀︎','venus',3],['♂︎','mars',4],['♃︎','jupiter',5],['♄︎','saturn',6]];
const BG={sun:'☉︎',moon:'☽︎',mercury:'☿︎',venus:'♀︎',mars:'♂︎',jupiter:'♃︎',saturn:'♄︎',uranus:'♅︎',neptune:'♆︎',pluto:'♇︎',chiron:'⚷',north_node:'☊',south_node:'☋',lilith:'⚸',asc:'↑',mc:'⊼'};
const BN={north_node:'north node',south_node:'south node',lilith:'lilith',asc:'rising',mc:'midheaven'};
const bname=k=>BN[k]||k;
const ASP=[{n:'conjunction',a:0,o:8,g:'☌'},{n:'sextile',a:60,o:5,g:'⚹',soft:1},{n:'square',a:90,o:7,g:'□'},{n:'trine',a:120,o:7,g:'△',soft:1},{n:'opposition',a:180,o:8,g:'☍'}];
const ASP_BODIES=['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
/* aspects are geometry on the engine's longitudes — no positions are computed here */
function aspectsOf(ch){
  if(!ch)return[];const B=ch.bodies.filter(b=>ASP_BODIES.includes(b.key)),out=[];
  for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){
    let d=Math.abs(B[i].lon-B[j].lon);if(d>180)d=360-d;
    for(const A of ASP){const orb=Math.abs(d-A.a);if(orb<=A.o){out.push({a:B[i].key,b:B[j].key,t:A,orb});break;}}
  }
  return out.sort((x,y)=>x.orb-y.orb);
}
const dm=deg=>{const d=Math.floor(deg),m=Math.floor((deg-d)*60);return `${d}°${String(m).padStart(2,'0')}′`;};
/* the wheel — a port of the Natal Blueprint wheel() (design-system
   chart-engine/template.html): ink only, three rings, 3-letter sign codes, 5° ticks,
   bold 2-letter body codes, ASC–DSC solid, MC–IC dashed, aspects under 4° in the hub
   (squares/oppositions solid, the rest dashed). The app adds: porphyry/placidus cusp
   lines when that's the house system, and every code is tappable. */
const WSG=['ARI','TAU','GEM','CAN','LEO','VIR','LIB','SCO','SAG','CAP','AQU','PIS'];
const WAB={sun:'SU',moon:'MO',mercury:'ME',venus:'VE',mars:'MA',jupiter:'JU',saturn:'SA',uranus:'UR',neptune:'NE',pluto:'PL',chiron:'CH',north_node:'NN'};
function wheelSVG(ch,who){
  const size=360,c=size/2,rO=c-2,rS=c-30,rH=c*.5,rA=rH-24,rP=rS-26;
  const hasAng=ch.timeKnown&&ch.asc!=null, asc=hasAng?ch.asc:0;
  const ang=lon=>Math.PI+(lon-asc)*Math.PI/180;
  const xy=(r,lon)=>[(c+r*Math.cos(ang(lon))).toFixed(1),(c-r*Math.sin(ang(lon))).toFixed(1)];
  const L=(r1,l1,r2,l2,extra)=>{const[a,b]=xy(r1,l1),[d,e]=xy(r2,l2);return `<line x1="${a}" y1="${b}" x2="${d}" y2="${e}" ${extra||''}/>`;};
  const wq=JSON.stringify(who).replace(/"/g,'&quot;');
  const hs=(S.set&&S.set.house)||'porphyry', cusps=cuspsOf(ch), whole=hs==='whole_sign'||!cusps;
  let s=`<svg class="wheel" viewBox="0 0 ${size} ${size}" fill="none" stroke="currentColor" stroke-width="1" role="img" aria-label="natal chart wheel">`;
  s+=`<circle cx="${c}" cy="${c}" r="${rO}"/><circle cx="${c}" cy="${c}" r="${rS}"/><circle cx="${c}" cy="${c}" r="${rH}"/>`;
  const ascSign=Math.floor(asc/30)*30;
  for(let i=0;i<12;i++){const b=i*30;
    s+=L(whole&&hasAng?rH:rS,b,rO,b);
    const[tx,ty]=xy((rO+rS)/2,b+15);
    s+=`<text class="wz" x="${tx}" y="${ty}" font-size="${(size/42).toFixed(1)}" letter-spacing="1.5" font-weight="500" onclick="explainSign(${i})">${WSG[i]}</text>`;
    if(whole&&hasAng){const hn=((i*30-ascSign)/30+12)%12+1,[hx,hy]=xy(rH-14,b+15);
      s+=`<text class="wh" x="${hx}" y="${hy}" font-size="${(size/50).toFixed(1)}" onclick="explainHouse(${hn})">${hn}</text>`;}
  }
  if(!whole&&hasAng){cusps.forEach((cu,i)=>{s+=L(rH,cu,rS,cu,'stroke-width=".8"');
    const nx=cusps[(i+1)%12],mid=(cu+((nx-cu+360)%360)/2)%360,[hx,hy]=xy(rH-14,mid);
    s+=`<text class="wh" x="${hx}" y="${hy}" font-size="${(size/50).toFixed(1)}" onclick="explainHouse(${i+1})">${i+1}</text>`;});}
  for(let d=0;d<360;d+=5)s+=L(rS,d,rS+(d%10?4:7),d,'stroke-width=".7"');
  if(hasAng){
    s+=`<g class="wax" onclick="explainPlacement(${wq},'asc')">${L(rO,asc,rO,asc+180,'stroke-width="1.6"')}${L(rO,asc,rO,asc+180,'stroke="transparent" stroke-width="10"')}</g>`;
    s+=`<g class="wax" onclick="explainPlacement(${wq},'mc')">${L(rO,ch.mc,rO,ch.mc+180,'stroke-width="1.6" stroke-dasharray="4 3"')}${L(rO,ch.mc,rO,ch.mc+180,'stroke="transparent" stroke-width="10"')}</g>`;
  }
  /* bodies, nudged apart */
  const B=ch.bodies.filter(b=>WAB[b.key]).map(b=>({...b,pl:b.lon})).sort((a,b)=>a.lon-b.lon);
  for(let k=0;k<4;k++)for(let i=0;i<B.length;i++){const a=B[i],b=B[(i+1)%B.length];const d=(b.pl-a.pl+360)%360;if(d<8){a.pl-=(8-d)/2;b.pl+=(8-d)/2;}}
  B.forEach(b=>{s+=L(rS,b.lon,rS-6,b.lon,'stroke-width="1.4"');
    const[x,y]=xy(rP,b.pl);
    s+=`<g class="wp" onclick="explainPlacement(${wq},'${b.key}')"><rect x="${(+x-11).toFixed(1)}" y="${(+y-9).toFixed(1)}" width="22" height="18" fill="transparent" stroke="none"/><text class="wg" x="${x}" y="${y}" font-size="${(size/34).toFixed(1)}" font-weight="700">${WAB[b.key]}</text></g>`;});
  /* aspect lines (major, tight) in the hub */
  aspectsOf(ch).filter(A=>A.orb<4&&A.t.a!==0&&WAB[A.a]&&WAB[A.b]).forEach(A=>{const a=bodyOf(ch,A.a),b=bodyOf(ch,A.b);
    s+=L(rA,a.lon,rA,b.lon,`stroke-width=".7"${A.t.n==='square'||A.t.n==='opposition'?'':' stroke-dasharray="3 3"'}`);});
  s+=`<circle cx="${c}" cy="${c}" r="${rA}" stroke-width=".5"/>`;
  return s+'</svg>';
}
function natalRowsHTML(ch,who){
  const wq=JSON.stringify(who).replace(/"/g,'&quot;');
  const cusps=cuspsOf(ch);
  const row=(k,sign,deg,house,retro)=>{const si=SIGNS.indexOf(sign);
    return `<button class="nr" onclick="explainPlacement(${wq},'${k}')"><span class="g">${BG[k]||'•'}</span><span class="n">${bname(k)}</span>
      <span class="w2">${GLY[si]} ${sign} ${dm(deg)}${retro?' ℞':''}</span><span class="h">${house?'h'+house:''}</span><span class="c">›</span></button>`;};
  let h='';
  if(ch.timeKnown&&ch.asc!=null){h+=row('asc',SIGNS[signOf(ch.asc)],degIn(ch.asc),1);h+=row('mc',SIGNS[signOf(ch.mc)],degIn(ch.mc),cusps?houseOf(ch.mc,cusps):null);}
  ch.bodies.forEach(b=>{h+=row(b.key,b.sign,b.deg,cusps?houseOf(b.lon,cusps):null,b.retro);});
  return h;
}
function renderNatal(){
  const ch=S.me.natal;
  if(!S.me.date||!ch){
    document.getElementById('natalSub').textContent=S.me.date?'casting with the engine…':'no chart yet';
    document.getElementById('wheelWrap').innerHTML=`<div class="empty"><div class="eg">☉︎</div><div class="et">${S.me.date?'casting your chart':'cast your chart first'}</div><div class="ed">${S.me.date?'the engine is placing your planets — this takes a second. offline? it finishes next launch.':'the wheel needs a date, a time, and a place.'}</div><button class="btn" onclick="castMine()">${S.me.date?'recast it':'cast it'}</button></div>`;
    document.getElementById('natalRows').innerHTML='';document.getElementById('natalPromise').textContent='';
    const a=document.getElementById('natalAsp');if(a)a.innerHTML='';
    return;}
  const hs=HSYS[(S.set&&S.set.house)||'porphyry'];
  document.getElementById('natalSub').innerHTML=`${S.me.date} · ${S.me.time||'time unknown'} · ${esc(S.me.place||'—')}<br><button class="lk" onclick="pickHouseSystem()">${ch.timeKnown?hs+' houses':'no birth time — houses hidden'} ›</button>`;
  document.getElementById('wheelWrap').innerHTML=wheelSVG(ch,'me')+
    `<div class="wleg"><span><i class="hard"></i>square · opposition</span><span><i class="soft"></i>trine · sextile · conjunction</span><button class="lk" onclick="explain('wheel')">how to read it ›</button></div>`;
  document.getElementById('natalRows').innerHTML=natalRowsHTML(ch,'me');
  const A=aspectsOf(ch).slice(0,8);
  const ae=document.getElementById('natalAsp');
  if(ae)ae.innerHTML=A.length?A.map(x=>`<button class="nr" onclick="explainAspect('${x.a}','${x.b}','${x.t.n}',${x.orb.toFixed(1)})"><span class="g">${x.t.g}</span><span class="n">${bname(x.a)} ${x.t.n} ${bname(x.b)}</span><span class="w2">${x.orb.toFixed(1)}° orb</span><span class="c">›</span></button>`).join(''):'<div class="nr">no major aspects inside orb</div>';
  const b=big3Of(S.me);
  document.getElementById('natalPromise').innerHTML=
   `your sun's in <b>${SIGNS[b.sun]}</b> and your moon's in <b>${SIGNS[b.moon]}</b> — so the thing you're built to become and the thing you actually need are ${b.sun===b.moon?'the same department, which is rare and means when you\'re on, you\'re fully on, and when you\'re off, there\'s nowhere to hide':'running on different frequencies. that\'s not a flaw, that\'s the whole tension the chart is asking you to metabolize'}. ${SIGN_READ[SIGNS[b.moon]][1]}${b.rise!=null?` and with <b>${SIGNS[b.rise]}</b> rising, that's the door everyone walks through first — ${SIGN_READ[SIGNS[b.rise]][0]}.`:''}`;
}

/* ══════════ ME ══════════ */
function renderMe(){
  document.getElementById('meSw').innerHTML=swHTML();
  document.getElementById('meName').innerHTML='<em>'+esc(S.me.name||'you')+'</em>';
  document.getElementById('meSub').textContent=S.me.date?`${S.me.date} · ${S.me.time||'—'} · ${S.me.place||'—'}`:'no chart cast yet';
  if(S.me.natal){const b=big3Of(S.me);
    document.getElementById('meBig3').textContent=`☉︎ ${SIGNS[b.sun]} · ☽︎ ${SIGNS[b.moon]} · ↑ ${b.rise!=null?SIGNS[b.rise]:'add birth time'}`;}
  else document.getElementById('meBig3').textContent=S.me.date?'casting with the engine…':'the wheel, the houses, the promise';
  const hv=document.getElementById('meHouseV');if(hv)hv.textContent=HSYS[S.set.house]||'porphyry';
  const bv=document.getElementById('meBirthV');if(bv)bv.textContent=S.me.date?'edit':'add';
  const lv=document.getElementById('meLayV');if(lv)lv.textContent=`${Object.values(LON).filter(Boolean).length} on`;
}
function exportBook(){
  const blob=new Blob([JSON.stringify({me:S.me,people:S.people,entries:S.entries,cal:S.cal},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='the-book.json';a.click();
  toast('↓ exported. it\'s yours forever.');
}

/* ══════════ SHEET ══════════ */
let sheetReturn=null;
function sheet(h){
  const sh=document.getElementById('sht');
  if(!sh.classList.contains('on'))sheetReturn=document.activeElement;
  sh.innerHTML=`<button class="sht-x" onclick="closeSheet()" aria-label="close">×</button>`+h;
  sh.scrollTop=0;
  document.getElementById('scr').classList.add('on');sh.classList.add('on');
  document.body.classList.add('sheet-open');
  sh.focus({preventScroll:true});
}
function closeSheet(){
  const sh=document.getElementById('sht');if(!sh.classList.contains('on'))return;
  document.getElementById('scr').classList.remove('on');sh.classList.remove('on');
  document.body.classList.remove('sheet-open');
  if(sheetReturn&&document.contains(sheetReturn))try{sheetReturn.focus({preventScroll:true});}catch(e){}
  sheetReturn=null;
}
addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('sht').classList.contains('on'))closeSheet();
    else if(VSTACK.length>1)goBack(TAB[VSTACK[VSTACK.length-1]]);
  }
});


/* ══════════ EXPLAIN · every element leads somewhere ══════════
   tap anything with meaning and it opens: what it is, what it means for you,
   and where to go next. reference copy stays plain; the read stays bestie. */
const SIGN_META=[
 ['fire','cardinal','mars','♂︎'],['earth','fixed','venus','♀︎'],['air','mutable','mercury','☿︎'],['water','cardinal','moon','☽︎'],
 ['fire','fixed','sun','☉︎'],['earth','mutable','mercury','☿︎'],['air','cardinal','venus','♀︎'],['water','fixed','mars · pluto','♂︎ ♇︎'],
 ['fire','mutable','jupiter','♃︎'],['earth','cardinal','saturn','♄︎'],['air','fixed','saturn · uranus','♄︎ ♅︎'],['water','mutable','jupiter · neptune','♃︎ ♆︎']];
const HOUSE_MEAN=['self, body, the first impression — the door everyone walks through','money, resources, what you value and what values you','siblings, neighbors, texts, the daily commute of your mind','home, family, roots, the private floor plan','romance, creativity, play, kids, the fun you make','work, health, routines, the daily grind and the daily care',
 'partners, contracts, the people across the table','shared money, sex, debt, inheritance, the deep end','travel, belief, higher learning, the long road','career, reputation, the public chapter of you','friends, networks, the future you\'re building with others','the hidden, the subconscious, endings, rest, retreat'];
const PLANET_MEAN={sun:'your core identity — what you\'re here to become',moon:'your emotional body — what you need to feel safe',mercury:'how you think, talk, and process',venus:'how you love, attract, and value',mars:'how you want, chase, and fight',jupiter:'where luck and growth come easy (and where you overdo it)',
 saturn:'where life makes you earn it — discipline, fear, mastery',uranus:'where you rebel and break the pattern',neptune:'where you dream, dissolve, and get foggy',pluto:'where power, obsession, and rebirth live',chiron:'the wound that becomes the medicine',
 north_node:'the direction you\'re growing toward',south_node:'the comfort zone you\'re growing out of',lilith:'the part of you that refused to be tamed',asc:'your rising — the lens, the body, the vibe people clock first',mc:'the midheaven — your public direction and reputation',dsc:'the descendant — what you seek in partners',ic:'the IC — your roots and private foundation'};
const GLOSS={
 retrograde:['℞ retrograde','a planet looks like it\'s walking backwards from here. it isn\'t — earth is lapping it. in practice: that planet\'s topics go into review. redo, revisit, reread. launching is harder; fixing is easier.'],
 elements:['◐ the element balance','count the seven classical planets by element: fire (aries, leo, sagittarius) acts, earth (taurus, virgo, capricorn) builds, air (gemini, libra, aquarius) talks, water (cancer, scorpio, pisces) feels. whichever leads is the day\'s default setting.'],
 rising:['↑ the rising','your ascendant — the zodiac sign that was rising on the eastern horizon the minute you were born. it sets every house in your chart, so it needs your exact birth time and place. the app casts it with the celestine engine — no time, no rising (we won\'t fake it).'],
 sun:['☉︎ the sun','where the sun was when you were born. your core identity, your engine, the thing you\'re built to become.'],
 moon:['☽︎ the moon','your emotional body. what you need to feel safe, how you self-soothe, what you do when nobody\'s watching.'],
 wheel:['◎ reading the wheel','the outer band is the zodiac (ARI → PIS), ticked every 5°. the solid line across is your horizon — rising on the left, setting on the right; the dashed line is the MC–IC meridian. the small numbers are your houses, running counter-clockwise from the rising. planets sit at their exact degree as two-letter codes (SU sun, MO moon, ME mercury…). lines in the hub are aspects under 4°: solid for squares and oppositions, dashed for the easy ones. tap any code to open it.'],
 aspects:['☌ aspects','the angles between your planets. conjunction 0° (fused), sextile 60° (easy opening), square 90° (friction that builds muscle), trine 120° (natural talent), opposition 180° (a seesaw). the orb is how close to exact — tighter means louder.'],
 placements:['✦ placements','every body in your chart: which sign it\'s in (the style), which degree, and which house (the life department). ℞ means it was retrograde at your birth — the energy turns inward first.'],
 notifications:['◉ notifications','push reminders for voids, exact windows, lunations, and your returns are being built. for now the calendar is the source of truth — everything that would ping you is already on it.'],
 deck:['✦ deck art','rider–waite–smith, 1909 original scans by pamela colman smith. public domain — yours to keep forever.'],
 layers:['◐ calendar layers','every lens the calendar can show: the moon, the sky, your chart, your people, your practice. turn on what you use and the calendar redraws live.'],
 porphyry:['◈ porphyry houses','the default here. your real angles (ASC, IC, DSC, MC) anchor the four quadrants and each quadrant splits into three equal houses. stable at every latitude, honest to your actual horizon.'],
 void:['⊘ void of course','the stretch after the moon makes her last major aspect in a sign and before she enters the next one. launches, sends, and promises made in a void tend to fizzle. rest, edit, wait.'],
 lunation:['● lunations','new moons (plant) and full moons (harvest, reveal). eclipses are lunations with the volume turned all the way up.'],
 flag:['✦ flagged days','days where three or more things stack up, or something big lands (an eclipse, a station). worth planning around.'],
 stand:['☉︎ the sun\'s season','the sun spends about a month in each sign — that\'s the season everyone is living in. the arrow shows when it moves on.'],
 stats:['◇ the month at a glance','how many things are on the books this month with your current layers, how many days are flagged, and which part of the sky is loudest.'],
 calendar:['✦ the calendar','this is the cosmic calendar sheet, live: your chart line up top, the layers you have on, the standing condition for the month in the black bar, every event written into its day, and what to watch underneath. tap any day, event, layer or line to open it.'],
 compare:['☍ synastry & composite','synastry lays two charts on top of each other — where your planets hit theirs. a composite blends both charts into one: the relationship as its own creature. both need a cast chart for each person.']};
function explain(k,more){
  const g=GLOSS[k];if(!g)return;
  sheet(`<div class="gb"></div><div class="xp-eb">✦ · explained · ✦</div><div class="xp-h">${g[0]}</div><p class="xp-p">${g[1]}</p>${more||''}
    ${k==='layers'?'<button class="btn" onclick="closeSheet();nav(\'layers\')">open the layers ›</button>':''}
    ${k==='rising'&&!(S.me.natal&&S.me.natal.timeKnown)?'<button class="btn" onclick="closeSheet();castMine()">add my birth time ›</button>':''}
    ${k==='porphyry'?'<button class="btn" onclick="pickHouseSystem()">choose a house system ›</button>':''}`);
}
/* where is the moon next in sign i? scan forward day by day */
function nextMoonIn(i){const d=new Date();for(let n=0;n<40;n++){if(signOf(moonLon(d))===i)return new Date(d);d.setDate(d.getDate()+1);}return null;}
function explainSign(i){
  const [el,mod,rul,rg]=SIGN_META[i],nm=SIGNS[i],[vibe,read]=SIGN_READ[nm];
  const ch=S.me.natal,cusps=cuspsOf(ch);
  const mine=ch?ch.bodies.filter(b=>b.sign===nm).map(b=>`<button class="ic2" onclick="explainPlacement('me','${b.key}')">${BG[b.key]||''} ${bname(b.key)}</button>`):[];
  if(ch&&ch.timeKnown&&signOf(ch.asc)===i)mine.unshift(`<button class="ic2" onclick="explainPlacement('me','asc')">↑ rising</button>`);
  const nh=cusps?cusps.findIndex(c=>signOf(c)===i):-1;
  const nx=nextMoonIn(i);
  sheet(`<div class="gb"></div><div class="xp-eb">${el} · ${mod} · ruled by ${rul} ${rg}</div>
    <div class="xp-sign">${GLY[i]}</div><div class="xp-bl">${nm}</div>
    <p class="xp-p"><b>${vibe}.</b> ${read}</p>
    ${mine.length?`<div class="xp-lab">in your chart</div><div class="ich">${mine.join('')}</div>`:''}
    ${nh>=0?`<div class="xp-lab">your houses</div><p class="xp-p">${nm} opens your <b>${nh+1}${['st','nd','rd'][nh]||'th'} house</b> — ${HOUSE_MEAN[nh]}.</p>`:''}
    ${nx?`<button class="btn" onclick="closeSheet();pickDay('${key(nx)}');nav('cal')">moon in ${nm} next · ${fmt(nx)} ›</button>`:''}`);
}
function explainHouse(n){
  const ch=S.me.natal,cusps=cuspsOf(ch);
  const inside=ch&&cusps?ch.bodies.filter(b=>houseOf(b.lon,cusps)===n):[];
  const cs=cusps?signOf(cusps[n-1]):null;
  sheet(`<div class="gb"></div><div class="xp-eb">house ${n} · ${HSYS[S.set.house]||'porphyry'}</div>
    <div class="xp-h">the ${n}${['st','nd','rd'][n-1]||'th'} house</div>
    <p class="xp-p">${HOUSE_MEAN[n-1]}.</p>
    ${cs!=null?`<p class="xp-p">your cusp is in <button class="lk" onclick="explainSign(${cs})"><b>${SIGNS[cs]} ${GLY[cs]}</b></button> — that's the style this department runs on.</p>`:''}
    ${inside.length?`<div class="xp-lab">who lives here</div><div class="ich">${inside.map(b=>`<button class="ic2" onclick="explainPlacement('me','${b.key}')">${BG[b.key]||''} ${bname(b.key)}</button>`).join('')}</div>`:'<p class="xp-p" style="opacity:.7">empty house — not empty life. look to the sign on the cusp and its ruler.</p>'}
    <button class="btn g" onclick="pickHouseSystem()">house system · ${HSYS[S.set.house]||'porphyry'} ›</button>`);
}
const whoChart=who=>who==='me'?S.me:who==='sky'?{name:'the sky',natal:SKY.chart}:S.people[who];
function explainPlacement(who,k){
  const p=whoChart(who);if(!p)return;
  const ch=p.natal;
  if(!ch){return explain(k==='asc'?'rising':(k==='moon'?'moon':'sun'));}
  const cusps=cuspsOf(ch);
  let lon,retro=false;
  if(k==='asc'||k==='mc'||k==='dsc'||k==='ic'){
    if(!ch.timeKnown)return explain('rising');
    lon=k==='asc'?ch.asc:k==='mc'?ch.mc:k==='dsc'?(ch.asc+180)%360:(ch.mc+180)%360;
  } else {const b=bodyOf(ch,k);if(!b)return;lon=b.lon;retro=b.retro;}
  const si=signOf(lon),nm=SIGNS[si],h=cusps?houseOf(lon,cusps):null;
  const asp=aspectsOf(ch).filter(a=>a.a===k||a.b===k).slice(0,4);
  const nameW=who==='me'?'your':esc(p.name)+'\'s';
  sheet(`<div class="gb"></div><div class="xp-eb">${nameW} chart · celestine</div>
    <div class="xp-sign">${BG[k]||'✦'}</div><div class="xp-h">${bname(k)} in ${nm}</div>
    <div class="xp-meta">${GLY[si]} ${dm(degIn(lon))} ${nm}${h?` · house ${h}`:''}${retro?' · retrograde ℞':''}</div>
    <p class="xp-p"><b>${bname(k)}</b> is ${PLANET_MEAN[k]||'a point in the chart'}. in <button class="lk" onclick="explainSign(${si})"><b>${nm}</b></button> it runs ${SIGN_READ[nm][0]}.</p>
    ${h?`<p class="xp-p">it lives in <button class="lk" onclick="explainHouse(${h})"><b>house ${h}</b></button> — ${HOUSE_MEAN[h-1]}.</p>`:''}
    ${retro?'<p class="xp-p">retrograde at birth: this energy processes inward first, then comes out sharper.</p>':''}
    ${asp.length?`<div class="xp-lab">tightest aspects</div>${asp.map(a=>`<button class="nr" onclick="explainAspect('${a.a}','${a.b}','${a.t.n}',${a.orb.toFixed(1)})"><span class="g">${a.t.g}</span><span class="n">${bname(a.a)} ${a.t.n} ${bname(a.b)}</span><span class="w2">${a.orb.toFixed(1)}°</span><span class="c">›</span></button>`).join('')}`:''}
    ${who==='me'?`<button class="btn" onclick="closeSheet();nav('natal')">open my chart ›</button>`:''}`);
}
const ASP_READ={conjunction:'fused. these two act as one unit — you can\'t get one without the other.',sextile:'an open door. easy cooperation that pays off when you actually use it.',
 square:'friction on purpose. this is where you build muscle — annoying, productive, permanent.',trine:'natural talent. flows so easily you might not notice it\'s a gift.',opposition:'a seesaw. you swing between the two until you learn to hold both.'};
function explainAspect(a,b,t,orb){
  const A=ASP.find(x=>x.n===t);
  sheet(`<div class="gb"></div><div class="xp-eb">aspect · ${orb}° orb</div>
    <div class="xp-sign">${BG[a]} ${A.g} ${BG[b]}</div><div class="xp-h">${bname(a)} ${t} ${bname(b)}</div>
    <p class="xp-p">${ASP_READ[t]}</p>
    <p class="xp-p"><b>${bname(a)}</b>: ${PLANET_MEAN[a]}.<br><b>${bname(b)}</b>: ${PLANET_MEAN[b]}.</p>
    <div class="ich"><button class="ic2" onclick="explainPlacement('me','${a}')">${BG[a]} ${bname(a)} ›</button><button class="ic2" onclick="explainPlacement('me','${b}')">${BG[b]} ${bname(b)} ›</button></div>
    <button class="btn g" onclick="explain('aspects')">how aspects work ›</button>`);
}
function explainSuit(sk){
  const k={wands:'w',cups:'c',swords:'s',pents:'p'}[sk],[nm,gl,el,th]=SUIT[k];
  const signs={w:[0,4,8],c:[3,7,11],s:[2,6,10],p:[1,5,9]}[k];
  sheet(`<div class="gb"></div><div class="xp-eb">${gl} ${el} · the courts → the signs</div>
    <div class="xp-h">${nm}</div><p class="xp-p">${th}. the ${el} signs are where this suit lives in the sky.</p>
    <div class="ich">${signs.map(i=>`<button class="ic2" onclick="explainSign(${i})">${GLY[i]} ${SIGNS[i]}</button>`).join('')}</div>
    <div class="xp-lab">the court</div>
    <div class="ich">${[11,12,13,14].map(n=>{const c=byKey(k+String(n).padStart(2,'0'));return `<button class="ic2" onclick="openCard('${c.k}')">${c.n}</button>`;}).join('')}</div>
    <button class="btn g" onclick="closeSheet();nav('lib');setShelf('tarot')">the whole deck ›</button>`);
}
/* the moon on any day: phase, sign, void, and the next big ones */
function moonSheet(k){
  const d=k?parse(k):new Date(),p=phase(d),pn=phaseName(p),ml=moonLon(d),si=signOf(ml),vd=voidWindow(d);
  const nx=(want)=>{const x=new Date(d);for(let n=1;n<32;n++){x.setDate(x.getDate()+1);const q=phase(x),qv=phase(new Date(x.getTime()-864e5));
    if(want==='new'?(qv>.9&&q<.1):(qv<.5&&q>=.5))return new Date(x);}return null;};
  const nm=nx('new'),fm=nx('full'),rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
  sheet(`<div class="gb"></div><div class="xp-eb">☽︎ · ${fmtL(d)} · ☽︎</div>
    <div class="xp-moon">${moonSVG(p,96)}</div>
    <div class="xp-h">${pn} in ${SIGNS[si]} ${GLY[si]}</div>
    <div class="xp-meta">${Math.round((1-Math.cos(2*Math.PI*p))/2*100)}% lit · ${dm(degIn(ml))} ${SIGNS[si]}${vd.active?' · void now':''}</div>
    <p class="xp-p">${MOOD[pn]}</p>
    ${vd.active?`<button class="nr" onclick="explain('void')"><span class="g">⊘</span><span class="n">void for ~${vd.hrs}h</span><span class="w2">hold the send</span><span class="c">›</span></button>`:''}
    <div class="xp-lab">coming up</div>
    ${nm?`<button class="nr" onclick="closeSheet();pickDay('${key(nm)}');nav('cal')"><span class="g">●</span><span class="n">new moon</span><span class="w2">${fmt(nm)}</span><span class="c">›</span></button>`:''}
    ${fm?`<button class="nr" onclick="closeSheet();pickDay('${key(fm)}');nav('cal')"><span class="g">○</span><span class="n">full moon</span><span class="w2">${fmt(fm)}</span><span class="c">›</span></button>`:''}
    <button class="nr" onclick="explainSign(${si})"><span class="g">${GLY[si]}</span><span class="n">moon in ${SIGNS[si]}</span><span class="w2">the sign</span><span class="c">›</span></button>
    <button class="nr" onclick="closeSheet();nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),80)"><span class="g">✧</span><span class="n">${rit.n}</span><span class="w2">matched working</span><span class="c">›</span></button>
    <button class="btn" onclick="closeSheet();pickDay('${key(d)}');nav('cal')">open ${fmt(d)} on the calendar ›</button>`);
}
function pickHouseSystem(){
  const cur=S.set.house||'porphyry';
  const D={porphyry:'the default. your real angles anchor four quadrants, each split in three. honest at every latitude.',
    whole_sign:'the oldest system. your rising sign is the whole 1st house, the next sign the 2nd, and so on. clean and bold.',
    placidus:'the most common in apps. time-based cusps — sizes vary, and it breaks down far north or south.'};
  sheet(`<div class="gb"></div><div class="xp-eb">◈ · the houses · ◈</div><div class="xp-h">house system</div>
    <p class="xp-p">same planets, same signs — only the house lines move. every option is cast by the engine.</p>
    ${Object.keys(HSYS).map(h=>`<button class="hs${h===cur?' on':''}" onclick="setHouseSystem('${h}')" aria-pressed="${h===cur}"><span class="hs-n">${HSYS[h]}${h==='porphyry'?' · default':''}</span><span class="hs-d">${D[h]}</span></button>`).join('')}
    ${S.me.natal&&!S.me.natal.timeKnown?'<p class="xp-p" style="opacity:.7">your chart has no birth time, so houses stay hidden in every system.</p>':''}`);
}
function setHouseSystem(h){
  S.set.house=h;tiSave();renderNatal();renderMe();
  closeSheet();toast(`◈ ${HSYS[h]} houses`);
}
/* compare: synastry + composite on engine longitudes */
function openCompare(kind){
  const cast=S.people.map((p,i)=>({p,i})).filter(x=>x.p.natal);
  if(!S.me.natal||!cast.length){
    return explain('compare',`<p class="xp-p">${!S.me.natal?'cast your chart first. ':''}${!cast.length?'then add someone with a birth date — their chart casts the moment you save.':''}</p>
      ${!S.me.natal?'<button class="btn" onclick="closeSheet();castMine()">cast my chart ›</button>':''}
      <button class="btn g" onclick="closeSheet();openPerson()">+ add someone ›</button>`);
  }
  if(cast.length===1)return showCompare(kind,cast[0].i);
  sheet(`<div class="gb"></div><div class="xp-eb">☍ · ${kind==='syn'?'synastry':'composite'} · ☍</div><div class="xp-h">with who?</div>
    ${cast.map(x=>`<button class="nr" onclick="showCompare('${kind}',${x.i})"><span class="g">${esc((x.p.name||'?')[0])}</span><span class="n">${esc(x.p.name)}</span><span class="w2">${esc(x.p.rel||'')}</span><span class="c">›</span></button>`).join('')}`);
}
function showCompare(kind,i){
  const p=S.people[i],A=S.me.natal,B=p.natal;
  if(kind==='syn'){
    const out=[];
    A.bodies.filter(b=>ASP_BODIES.includes(b.key)).forEach(a=>B.bodies.filter(b=>ASP_BODIES.includes(b.key)).forEach(b=>{
      let d=Math.abs(a.lon-b.lon);if(d>180)d=360-d;
      for(const T of ASP){const orb=Math.abs(d-T.a);if(orb<=Math.min(T.o,6)){out.push({a:a.key,b:b.key,t:T,orb});break;}}}));
    out.sort((x,y)=>x.orb-y.orb);
    const bc=cuspsOf(B);
    const over=bc?['sun','moon','venus','mars'].map(k=>{const b=bodyOf(A,k);return b?`<div class="nr"><span class="g">${BG[k]}</span><span class="n">your ${k}</span><span class="w2">their house ${houseOf(b.lon,bc)}</span></div>`:'';}).join(''):'';
    sheet(`<div class="gb"></div><div class="xp-eb">◇ · synastry · you × ${esc(p.name)}</div><div class="xp-h">how your charts touch</div>
      <div class="xp-lab">tightest contacts</div>
      ${out.slice(0,8).map(x=>`<div class="nr"><span class="g">${x.t.g}</span><span class="n">your ${bname(x.a)} ${x.t.n} their ${bname(x.b)}</span><span class="w2">${x.orb.toFixed(1)}°</span></div>`).join('')||'<p class="xp-p">no tight contacts — a quiet, low-drama pairing.</p>'}
      ${over?`<div class="xp-lab">you in their houses</div>${over}`:''}
      <button class="btn g" onclick="explain('aspects')">how to read contacts ›</button>`);
  } else {
    const mid=(x,y)=>{let d=((y-x+540)%360)-180;return (x+d/2+360)%360;};
    const rows=ASP_BODIES.slice(0,7).map(k=>{const a=bodyOf(A,k),b=bodyOf(B,k);if(!a||!b)return'';const l=mid(a.lon,b.lon),si=signOf(l);
      return `<div class="nr"><span class="g">${BG[k]}</span><span class="n">${k}</span><span class="w2">${GLY[si]} ${SIGNS[si]} ${dm(degIn(l))}</span></div>`;}).join('');
    const rise=A.timeKnown&&B.timeKnown?signOf(mid(A.asc,B.asc)):null;
    sheet(`<div class="gb"></div><div class="xp-eb">◍ · composite · you × ${esc(p.name)}</div><div class="xp-h">the relationship's own chart</div>
      <p class="xp-p">midpoints of both charts — the "us" as its own creature.${rise!=null?` it rises in <b>${SIGNS[rise]}</b>: ${SIGN_READ[SIGNS[rise]][0]}.`:''}</p>${rows}`);
  }
}
/* user calendar events — the "+ add to the calendar" sheet */
const ADD_TYPES=[['ritual','✧','working'],['entry','✧','reminder'],['pull','✦','reading'],['cycle','◉','cycle'],['global','☉︎','sky watch']];
function openAdd(dk){
  sheet(`<div class="gb"></div><div class="xp-eb">✧ · add to the calendar · ✧</div><div class="xp-h">something to remember</div>
    <div class="ob-f" style="margin-top:12px">
      <input id="adT" placeholder="what is it?" aria-label="title">
      <input id="adD" type="date" value="${dk||S.sel||key(new Date())}" aria-label="date">
      <textarea id="adN" rows="2" placeholder="a note for future you" aria-label="note"></textarea>
    </div>
    <div class="seg" id="adL" style="margin-top:10px">${ADD_TYPES.map((t,i)=>`<button type="button" data-l="${t[0]}" class="${i===0?'on':''}" onclick="document.querySelectorAll('#adL button').forEach(x=>x.classList.toggle('on',x===this))">${t[1]} ${t[2]}</button>`).join('')}</div>
    <button class="btn" onclick="saveEvent()">✧ put it on the calendar</button>`);
  setTimeout(()=>{const t=document.getElementById('adT');if(t)t.focus();},60);
}
function saveEvent(){
  const t=document.getElementById('adT').value.trim();if(!t)return toast('name it first ✧');
  const d=document.getElementById('adD').value||key(new Date());
  const l=(document.querySelector('#adL button.on')||{dataset:{l:'ritual'}}).dataset.l;
  const T=ADD_TYPES.find(x=>x[0]===l);
  S.cal.push({id:'c'+Date.now(),date:d,lay:l,gl:T[1],t,s:document.getElementById('adN').value.trim()||T[2],mine:1});
  if(!LON[l])LON[l]=true;
  closeSheet();pickDay(d);toast('✧ on the calendar');sparkleBurst(innerWidth/2,innerHeight/2,12);
}
function delEvent(id){S.cal=S.cal.filter(c=>c.id!==id);closeSheet();renderCal();toast('removed from the calendar');}
function obPrev(){if(obS>0){obS--;obR();}}
function replayIntro(){
  playSplash();
  setTimeout(()=>{obReplay(0);},1900);
  setTimeout(()=>{const sp=document.getElementById('splash');if(sp)sp.classList.add('off');},2300);
}

/* ══════════ SPARKLES ══════════ */
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const SPK='<svg viewBox="0 0 24 24"><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"/></svg>';
/* a soft shower for the moments that earn it (saved, cast, logged) — sparkles drift down
   from above the spot and fade. no more bursts on every tap. */
function sparkleBurst(x,y,n){
  if(RM.matches)return;
  const fx=document.getElementById('fx');if(!fx)return;
  for(let i=0;i<(n||6);i++){
    const s=document.createElement('span');s.className='spk fall';s.innerHTML=SPK;
    const sz=5+Math.random()*7,dur=1400+Math.random()*900;
    s.style.cssText=`left:${x+(Math.random()-.5)*220}px;top:${Math.max(0,y-140-Math.random()*80)}px;width:${sz}px;height:${sz}px;--fy:${150+Math.random()*120}px;--fx:${(Math.random()-.5)*40}px;--rot:${Math.random()*180}deg;animation-duration:${dur}ms;animation-delay:${Math.random()*350}ms`;
    fx.appendChild(s);setTimeout(()=>s.remove(),dur+500);
  }
}

/* ══════════ ONBOARDING ══════════ */
const LANES=['transits','tarot','rituals','synastry','journaling','moon tracking','cycle','shadow work'];
let obS=0;const OBL=["let's begin","next","next","read my stars"];
/* ══════ CITY AUTOCOMPLETE ══════ */
const CITIES=[
 {n:'New York, NY',lat:40.71,lng:-74.01,tz:'America/New_York'},{n:'Los Angeles, CA',lat:34.05,lng:-118.24,tz:'America/Los_Angeles'},
 {n:'Chicago, IL',lat:41.88,lng:-87.63,tz:'America/Chicago'},{n:'Houston, TX',lat:29.76,lng:-95.37,tz:'America/Chicago'},
 {n:'Phoenix, AZ',lat:33.45,lng:-112.07,tz:'America/Phoenix'},{n:'Philadelphia, PA',lat:39.95,lng:-75.17,tz:'America/New_York'},
 {n:'San Antonio, TX',lat:29.42,lng:-98.49,tz:'America/Chicago'},{n:'San Diego, CA',lat:32.72,lng:-117.16,tz:'America/Los_Angeles'},
 {n:'Dallas, TX',lat:32.78,lng:-96.80,tz:'America/Chicago'},{n:'Austin, TX',lat:30.27,lng:-97.74,tz:'America/Chicago'},
 {n:'Jacksonville, FL',lat:30.33,lng:-81.66,tz:'America/New_York'},{n:'San Francisco, CA',lat:37.77,lng:-122.42,tz:'America/Los_Angeles'},
 {n:'Indianapolis, IN',lat:39.77,lng:-86.16,tz:'America/Indiana/Indianapolis'},{n:'Columbus, OH',lat:39.96,lng:-82.99,tz:'America/New_York'},
 {n:'Charlotte, NC',lat:35.23,lng:-80.84,tz:'America/New_York'},{n:'Seattle, WA',lat:47.61,lng:-122.33,tz:'America/Los_Angeles'},
 {n:'Denver, CO',lat:39.74,lng:-104.99,tz:'America/Denver'},{n:'Nashville, TN',lat:36.16,lng:-86.78,tz:'America/Chicago'},
 {n:'Louisville, KY',lat:38.25,lng:-85.76,tz:'America/Kentucky/Louisville'},{n:'Portland, OR',lat:45.51,lng:-122.68,tz:'America/Los_Angeles'},
 {n:'Las Vegas, NV',lat:36.17,lng:-115.14,tz:'America/Los_Angeles'},{n:'Memphis, TN',lat:35.15,lng:-90.05,tz:'America/Chicago'},
 {n:'Baltimore, MD',lat:39.29,lng:-76.61,tz:'America/New_York'},{n:'Milwaukee, WI',lat:43.04,lng:-87.91,tz:'America/Chicago'},
 {n:'Albuquerque, NM',lat:35.08,lng:-106.65,tz:'America/Denver'},{n:'Tucson, AZ',lat:32.22,lng:-110.97,tz:'America/Phoenix'},
 {n:'Fresno, CA',lat:36.74,lng:-119.77,tz:'America/Los_Angeles'},{n:'Sacramento, CA',lat:38.58,lng:-121.49,tz:'America/Los_Angeles'},
 {n:'Atlanta, GA',lat:33.75,lng:-84.39,tz:'America/New_York'},{n:'Miami, FL',lat:25.76,lng:-80.19,tz:'America/New_York'},
 {n:'New Orleans, LA',lat:29.95,lng:-90.07,tz:'America/Chicago'},{n:'Detroit, MI',lat:42.33,lng:-83.05,tz:'America/Detroit'},
 {n:'Minneapolis, MN',lat:44.98,lng:-93.27,tz:'America/Chicago'},{n:'Boston, MA',lat:42.36,lng:-71.06,tz:'America/New_York'},
 {n:'Jeffersonville, IN',lat:38.28,lng:-85.74,tz:'America/Kentucky/Louisville'},{n:'New Albany, IN',lat:38.29,lng:-85.82,tz:'America/Kentucky/Louisville'},
 {n:'Lexington, KY',lat:38.04,lng:-84.50,tz:'America/New_York'},{n:'Cincinnati, OH',lat:39.10,lng:-84.51,tz:'America/New_York'},
 {n:'St. Louis, MO',lat:38.63,lng:-90.20,tz:'America/Chicago'},{n:'Kansas City, MO',lat:39.10,lng:-94.58,tz:'America/Chicago'},
 {n:'Pittsburgh, PA',lat:40.44,lng:-80.00,tz:'America/New_York'},{n:'Tampa, FL',lat:27.95,lng:-82.46,tz:'America/New_York'},
 {n:'Raleigh, NC',lat:35.78,lng:-78.64,tz:'America/New_York'},{n:'Omaha, NE',lat:41.26,lng:-95.94,tz:'America/Chicago'},
 {n:'Cleveland, OH',lat:41.50,lng:-81.69,tz:'America/New_York'},{n:'Virginia Beach, VA',lat:36.85,lng:-75.98,tz:'America/New_York'},
 {n:'Oakland, CA',lat:37.80,lng:-122.27,tz:'America/Los_Angeles'},{n:'Tulsa, OK',lat:36.15,lng:-95.99,tz:'America/Chicago'},
 {n:'Honolulu, HI',lat:21.31,lng:-157.86,tz:'Pacific/Honolulu'},{n:'London, UK',lat:51.51,lng:-0.13,tz:'Europe/London'},
 {n:'Toronto, ON',lat:43.65,lng:-79.38,tz:'America/Toronto'},{n:'Berlin, Germany',lat:52.52,lng:13.41,tz:'Europe/Berlin'},
 {n:'Paris, France',lat:48.86,lng:2.35,tz:'Europe/Paris'},{n:'Tokyo, Japan',lat:35.68,lng:139.69,tz:'Asia/Tokyo'},
 {n:'Sydney, Australia',lat:-33.87,lng:151.21,tz:'Australia/Sydney'},{n:'Mexico City, Mexico',lat:19.43,lng:-99.13,tz:'America/Mexico_City'}
];
let obCity=null;
/* city search: the seed list answers instantly, open-meteo answers for everywhere else.
   every hit carries an IANA zone so the engine gets DST-correct birth time. */
let placeT=null,placeHits=[];
function placeSearch(q,listId,cb){
  const el=document.getElementById(listId||'obPlaceList');
  obCity=null;
  if(q.length<2){el.classList.remove('on');return;}
  const ql=q.toLowerCase();
  const show=hits=>{
    placeHits=hits.slice(0,6);
    if(!placeHits.length){el.classList.remove('on');return;}
    el.innerHTML=placeHits.map((c,i)=>`<button type="button" onclick="pickCity(${i},'${listId||'obPlaceList'}')">${esc(c.n)}</button>`).join('');
    el.classList.add('on');
    el._cb=cb;
  };
  const seed=CITIES.filter(c=>c.n.toLowerCase().includes(ql));
  show(seed);
  clearTimeout(placeT);
  placeT=setTimeout(async()=>{
    try{
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.split(',')[0].trim())}&count=6&language=en&format=json`);
      const j=await r.json();
      const far=(j.results||[]).filter(x=>x.timezone).map(x=>({n:[x.name,x.admin1,x.country_code].filter(Boolean).join(', '),lat:x.latitude,lng:x.longitude,tz:x.timezone}));
      const seen=new Set(seed.map(c=>c.n.toLowerCase()));
      show([...seed,...far.filter(c=>!seen.has(c.n.toLowerCase()))]);
    }catch(e){/* offline — the seed list carries it */}
  },280);
}
function pickCity(i,listId){
  const c=placeHits[i];if(!c)return;
  const el=document.getElementById(listId);
  const input=el.parentElement.querySelector('input');
  input.value=c.n;el.classList.remove('on');
  if(el._cb)el._cb(c);else obCity=c;
}
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);

/* ══════════ THE CHART · celestine via /api/natal ══════════
   the server casts (celestine, porphyry default); the client only draws and looks up
   houses against the cusps it was handed. no client-side ascendant math, ever. */
async function castChart(who,self){
  if(!who||!who.date)return null;
  const r=await fetch('/api/natal',{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({name:who.name,date:who.date,time:who.time||'',place:who.place||'',lat:who.lat??null,lng:who.lng??null,tzName:who.tzName||null,self:!!self})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'the chart didn\'t cast');
  return j.chart;
}
const HSYS={porphyry:'porphyry',whole_sign:'whole sign',placidus:'placidus'};
function cuspsOf(ch){
  if(!ch||!ch.timeKnown||!ch.cusps)return null;
  const want=(S.set&&S.set.house)||'porphyry';
  return ch.cusps[want]||ch.cusps.porphyry;
}
function houseOf(lon,cusps){
  if(!cusps)return null;
  for(let i=0;i<12;i++){const a=cusps[i],b=cusps[(i+1)%12];
    if(a<b?(lon>=a&&lon<b):(lon>=a||lon<b))return i+1;}
  return 1;
}
const bodyOf=(ch,k)=>ch&&ch.bodies?ch.bodies.find(b=>b.key===k):null;
/* the big three, straight off the engine. rising stays honest: no time, no rising. */
function big3Of(p){
  const ch=p.natal;
  const sun=bodyOf(ch,'sun'),moon=bodyOf(ch,'moon');
  return {
    sun:sun?SIGNS.indexOf(sun.sign):null,
    moon:moon?SIGNS.indexOf(moon.sign):null,
    rise:ch&&ch.timeKnown&&ch.asc!=null?signOf(ch.asc):null,
    pending:!ch&&!!p.date,
    noTime:ch&&!ch.timeKnown
  };
}
function obR(){
  document.querySelectorAll('.ob-s').forEach(s=>s.classList.toggle('on',+s.dataset.s===obS));
  document.getElementById('obDots').innerHTML=[0,1,2,3].map(i=>`<span class="dt${i===obS?' on':''}"></span>`).join('');
  document.getElementById('obNext').textContent=OBL[obS];
  const ob=document.getElementById('obBack');if(ob)ob.style.visibility=obS>0?'visible':'hidden';
}
try{
document.getElementById('obLanes').innerHTML=LANES.map(l=>`<button class="chip${S.me.lanes.includes(l)?' on':''}" onclick="this.classList.toggle('on')">${l}</button>`).join('');
document.getElementById('obSw').innerHTML=swHTML();
document.getElementById('obNext').onclick=()=>{
  if(obS===0){S.me.name=document.getElementById('obName').value.trim()||'you';}
  if(obS<3){obS++;obR();sparkleBurst(innerWidth/2,innerHeight-60,6);}else obDone();
};
}catch(e){console.error('ob init:',e);}
function renderAll(){
  [renderSky,renderCal,renderGrim,renderJournal,renderOrbit,renderNatal,renderMe].forEach(fn=>{try{fn();}catch(e){console.error(fn.name,e);}});
}
async function obDone(){
  const v=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
  const n=v('obName'),d=v('obDate'),t=v('obTime'),p=v('obPlace');
  if(n)S.me.name=n;
  const birthChanged=d&&(d!==S.me.date||t!==(S.me.time||'')||p!==(S.me.place||''));
  if(d)S.me.date=d;
  S.me.time=t;
  if(p)S.me.place=p;
  if(obCity){S.me.lat=obCity.lat;S.me.lng=obCity.lng;S.me.tzName=obCity.tz;}
  S.onboarded=true;
  if(window.tiCloud){window.tiCloud.saveProfile(S.me).catch(()=>{});}
  const ob=document.getElementById('ob');ob.classList.add('off');
  setTimeout(()=>ob.classList.remove('on','off'),520);
  if(d&&(birthChanged||!S.me.natal)){
    /* the loading ritual covers the real cast — never shorter than the ritual, never faked */
    const cl=document.getElementById('chartLoad');cl.classList.remove('off');cl.classList.add('on');
    const msgs=['reading the ephemeris','finding your rising','drawing the houses','placing the planets','checking the aspects','almost there'];
    let mi=0;document.getElementById('clTxt').textContent=msgs[0];
    const iv=setInterval(()=>{mi=Math.min(mi+1,msgs.length-1);document.getElementById('clTxt').textContent=msgs[mi];},520);
    const minWait=new Promise(r=>setTimeout(r,2600));
    let msg='welcome in ✦ the sky\'s been waiting';
    try{
      S.me.natal=await castChart(S.me,true);
      const b=big3Of(S.me);
      msg=b.rise!=null?`✦ ${SIGNS[b.rise]} rising — the houses are yours now`:'✦ chart cast — add a birth time to unlock your rising';
    }catch(e){msg='✦ '+String(e.message||e).toLowerCase();}
    await minWait;clearInterval(iv);
    cl.classList.add('off');setTimeout(()=>cl.classList.remove('on','off'),400);
    renderAll();tiSave();toast(msg);sparkleBurst(innerWidth/2,innerHeight/2,18);
  } else {
    renderAll();tiSave();
    toast('welcome in ✦ the sky\'s been waiting');
  }
}
function obReplay(step){
  obS=step||0;obR();
  const set=(id,v)=>{const el=document.getElementById(id);if(el&&v)el.value=v;};
  let wn='';try{wn=localStorage.getItem('ti-name')||'';}catch(e){}   /* the name typed on /welcome */
  set('obName',S.me.name&&S.me.name!=='you'?S.me.name:wn);set('obDate',S.me.date);set('obTime',S.me.time);set('obPlace',S.me.place);
  if(S.me.lat!=null)obCity={n:S.me.place,lat:S.me.lat,lng:S.me.lng,tz:S.me.tzName};
  const ob=document.getElementById('ob');ob.classList.remove('off');ob.classList.add('on');
}
/* jump straight to the birth-data step */
function castMine(){obReplay(3);}

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
async function syncBackend(){
  try{
    await sb('/rest/v1/tarot_cards?select=card_key&limit=1');  /* anon-readable — proves the pipe */
    S.backendLive=true;
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
/* self-heal: anyone onboarded before the engine route existed (or whose cast failed
   offline) gets a real celestine chart on the next launch — quietly. */
async function healChart(){
  const todo=[];
  if(S.onboarded&&S.me.date&&!S.me.natal)todo.push([S.me,true]);
  S.people.forEach(p=>{if(p.date&&!p.natal)todo.push([p,false]);});
  if(!todo.length)return;
  let me=false;
  for(const [who,self] of todo){
    try{who.natal=await castChart(who,self);if(self)me=true;}catch(e){/* offline or no place — next launch */}
  }
  renderAll();tiSave();
  if(me){const b=big3Of(S.me);if(b.rise!=null)toast(`✦ chart recast by the engine — ${SIGNS[b.rise]} rising`);}
}
/* ── cloud state · supabase app_state ──
   the S object is still the single source of truth at runtime; the cloud is its shadow.
   loads before first render so a returning bestie lands in her own app, not a blank one. */
const TI_PERSIST_KEYS=['me','people','entries','cal','notes','lon','layv','accent','cursor','sel','jcursor','jfilter','set','plus','onboarded'];
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
  if(state.lon&&typeof state.lon==='object')Object.assign(LON,state.lon);
  /* layers v2: the full cosmic calendar arrived — switch its layers on once for existing records */
  if((state.layv||0)<2)['global','retro','lunar','lunation','void','natal','prof','firdaria','zr','prog','power'].forEach(i=>LON[i]=true);
  S.layv=2;
  S.lon=LON;
  S.notes=S.notes||{};S.set=Object.assign({house:'porphyry'},S.set||{});
  if(typeof S.accent==='number'&&S.accent>0)setAcc(S.accent);
  saveUi();
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
  /* every launch opens on today, whatever month was last browsed */
  {const t=new Date();S.cursor=new Date(t.getFullYear(),t.getMonth(),1);S.jcursor=new Date(t.getFullYear(),t.getMonth(),1);S.sel=key(t);}
  const _run=[['stars',stars],['obR',obR],['renderSky',renderSky],['renderCal',renderCal],['renderShelf',renderShelf],['renderJournal',renderJournal],['renderGrim',renderGrim],['renderOrbit',renderOrbit],['renderMe',renderMe]];
  for(const [n,fn] of _run){try{fn();}catch(e){console.error('tiBoot crash in '+n+':',e);}}
  healChart().catch(e=>console.error('healChart:',e));
  try{syncBackend();}catch(e){console.error('syncBackend:',e);}
  tiSplash();
}
/* the greeting reads the actual sky before it opens its mouth */
function greetLine(){
  const now=new Date(), hr=now.getHours(), k=key(now);
  const nm=S.me.name&&S.me.name!=='you'?', '+S.me.name:'';
  const hi=(hr<5?'good evening':hr<12?'good morning':hr<18?'good afternoon':'good evening')+nm+'.';
  /* use live moon phase instead of removed NEWMOON/FULLMOON tables */
  const p=phase(now),pn=phaseName(p);
  if(pn==='full moon')return [hi,'the full moon is waiting.'];
  if(pn==='new moon')return [hi,'it\'s time to plant something new.'];
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
/* the splash runs by explicit call from tiBoot (next injects these scripts after the
   page 'load' event). it already painted from the server markup, so it's on screen the
   whole time state loads — this only decides how long it lingers and where it hands off. */
function splashSeen(){try{const t=+sessionStorage.getItem('ti-splash-at');return !!t&&Date.now()-t<120000;}catch(e){return false;}}
function playSplash(){
  const sp=document.getElementById('splash');if(!sp)return;
  delete document.documentElement.dataset.splash;
  const c=sp.cloneNode(true);c.classList.remove('off');sp.replaceWith(c);   /* fresh node = animations replay */
  try{sessionStorage.setItem('ti-splash-at',String(Date.now()));}catch(e){}
}
function tiSplash(){
  const quick=splashSeen();
  try{sessionStorage.setItem('ti-splash-at',String(Date.now()));}catch(e){}
  const hold=quick?700:2400;
  const off=()=>{const sp=document.getElementById('splash');if(sp)sp.classList.add('off');};
  if(S.onboarded){
    /* returning: splash → sky-aware greeting → straight into the app */
    const g=greetLine();
    setTimeout(off,hold);
    setTimeout(()=>{toast(g[0]+' '+g[1]);sparkleBurst(innerWidth/2,innerHeight*.42,10);},hold+500);
  } else {
    /* new: splash → onboarding (prefilled with whatever the account already knows) */
    /* the name was already asked on /welcome, so skip straight to the ribbon */
    let wn='';try{wn=localStorage.getItem('ti-name')||'';}catch(e){}
    if(wn&&(!S.me.name||S.me.name==='you'))S.me.name=wn;
    setTimeout(()=>{obReplay(S.me.name&&S.me.name!=='you'?1:0);},hold-350);
    setTimeout(off,hold);
  }
}
