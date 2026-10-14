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
const MOOD={'new moon':'sun and moon meet, and the sky goes dark. this is the start of the cycle: quiet, low-light, good for choosing rather than doing.',
 'waxing crescent':'the first sliver of light after the new moon. what you started is real but fragile; give it care before you give it an audience.',
 'first quarter':'the moon sits square the sun, half lit. this is the first test of the cycle: friction shows you where the plan needs a stronger frame.',
 'waxing gibbous':'the moon is nearly full. this is the edit before the reveal: improve what you started, don\'t tear it down.',
 'full moon':'the moon stands opposite the sun, fully lit. what grew since the new moon is visible now, including what you were avoiding looking at.',
 'waning gibbous':'the light starts to recede. this is the phase of telling: share what you learned, give thanks or name the grievance, then let it settle.',
 'last quarter':'the moon squares the sun again, half dark this time. a turning point toward release: decide what stays and what you\'ve outgrown.',
 'waning crescent':'the last sliver before the dark. the cycle is closing; rest, clear, and let the field go fallow before you plant again.'};

/* ══════════ DAILY READ (the blend: structure, then meaning, then at most one line of bite) ══════════ */
const SIGN_READ={
 aries:['cardinal fire, ruled by mars: quick, direct, impatient with waiting','start the thing instead of discussing it. watch the temper; the urgency is real, the emergency usually isn\'t.'],
 taurus:['fixed earth, ruled by venus: slow, sensory, loyal to what already works','trust what your body says yes and no to today. that isn\'t laziness, it\'s information.'],
 gemini:['mutable air, ruled by mercury: quick-minded, curious, talkative','good for conversations, errands and gathering information. bad for final decisions made on half the facts.'],
 cancer:['cardinal water, ruled by the moon itself: tender, protective, feelings first','moods run closer to the surface and home matters more. look after yourself the way you\'d look after someone you love.'],
 leo:['fixed fire, ruled by the sun: warm, generous, wants to be seen','be visible on purpose. making yourself smaller so someone else feels comfortable is not humility.'],
 virgo:['mutable earth, ruled by mercury: precise, useful, quietly anxious','fix the one thing that is actually broken. the urge to fix everything at once is the anxiety talking.'],
 libra:['cardinal air, ruled by venus: diplomatic, aesthetic, relationship-minded','good for repair, beauty and fair deals. if you\'re polling everyone before you choose, you probably already know.'],
 scorpio:['fixed water, ruled by mars and pluto: deep, private, all or nothing','feelings run deep and you can sense what sits under the surface. you don\'t have to announce what you\'ve noticed.'],
 sagittarius:['mutable fire, ruled by jupiter: honest, restless, hungry for meaning','reach for something bigger: a class, a trip, a long view. say the honest thing, just not at full volume.'],
 capricorn:['cardinal earth, ruled by saturn: serious, capable, playing the long game','do the unglamorous task that pays off in six months. structure is the magic here.'],
 aquarius:['fixed air, ruled by saturn and uranus: detached, inventive, future-facing','step back and see the pattern. you aren\'t being cold, you\'re being clear; from outside they look the same.'],
 pisces:['mutable water, ruled by jupiter and neptune: porous, dreamy, compassionate','good for art, rest and intuition. not everything you\'re feeling is yours; put down what you picked up.']};
const PH_MOVE={'new moon':'name one intention, in one sentence, in the present tense. write it where you\'ll see it.',
 'waxing crescent':'take the first small step, and keep the plan to yourself until it can stand on its own.',
 'first quarter':'do the hard part first. the resistance is showing you where to reinforce.',
 'waxing gibbous':'revise one thing you\'ve already made. edit, don\'t abandon.',
 'full moon':'feel it fully, decide later. draft the message tonight and send it, if at all, in daylight.',
 'waning gibbous':'tell one person something true: a thank-you, a lesson, or a boundary.',
 'last quarter':'remove one thing: a draft, a habit, a commitment you only keep out of momentum.',
 'waning crescent':'rest before you\'ve earned it. clearing space is part of the work, not a break from it.'};
function dailyRead(d){
  const p=phase(d), pn=phaseName(p), ms=SIGNS[signOf(moonLon(d))], ss=SIGNS[signOf(sunLon(d))];
  const [frame,read]=SIGN_READ[ms];
  const vd=voidWindow(d);
  const l1=`the moon is in <button class="lk il" onclick="explainSign(${SIGNS.indexOf(ms)})"><b>${ms} ${GLY[SIGNS.indexOf(ms)]}</b></button>, ${frame}. ${MOOD[pn]}`;
  const l2=read;
  const l3=vd.active?`the moon goes void of course in about ${vd.hrs}h: no major aspects left before she changes sign. what you launch, sign or promise in that window tends to go nowhere. <button class="lk il" onclick="explain('void')">what void means ◇</button>`:
    `the sun is in <button class="lk il" onclick="explainSign(${SIGNS.indexOf(ss)})"><b>${ss}</b></button>, setting the season underneath the moon\'s daily weather: ${SIGN_READ[ss][0].split(': ')[1]}.`;
  return {l1,l2,l3,move:PH_MOVE[pn],pn,ms};
}

/* ══════════ LAYERS ══════════ */
const LAYERS=[
 {g:'cosmic moon',items:[
  {id:'lunar',n:'lunar transits',d:'the moon\'s sign each day, the fastest mood shift in the sky',c:'#8FD0F2',on:1,gl:'☽︎'},
  {id:'lunation',n:'lunations & eclipses',d:'new and full moons and eclipses: the month\'s beginnings and culminations',c:'#F4CC2E',on:1,gl:'◑'},
  {id:'void',n:'void of course',d:'moon between signs: rest and edit; don\'t launch or send',c:'#5a564f',on:1,gl:'⊘'},
  {id:'lunret',n:'lunar return',d:'the moon back at its natal degree: your monthly emotional reset',c:'#8FD0F2',on:0,gl:'☾'},
  {id:'cycle',n:'cycle & ovulation',d:'period, fertile window and luteal phase, logged and estimated',c:'#FF90E8',on:1,gl:'◉'}]},
 {g:'cosmic sky',items:[
  {id:'global',n:'global transits',d:'ingresses and aspects everyone lives under, whatever their chart',c:'#5a564f',on:1,gl:'☉︎'},
  {id:'retro',n:'retrogrades',d:'stations and shadow periods, when a planet\'s topics go into review',c:'#C7B0F5',on:1,gl:'℞'},
  {id:'rulers',n:'house rulers on the move',d:'where your chart ruler travels today, and which houses it stirs',c:'#7FE0B5',on:0,gl:'⌂'}]},
 {g:'cosmic natal',items:[
  {id:'natal',n:'transits to natal',d:'today\'s planets aspecting your placements: what is personal, not general',c:'#F4CC2E',on:1,gl:'✦'},
  {id:'promise',n:'natal promise windows',d:'when transits trigger what your birth chart already promises',c:'#F4CC2E',on:0,gl:'✧'},
  {id:'theirs',n:'their transits',d:'what each person in your orbit is living through',c:'#C7B0F5',on:0,gl:'☍'},
  {id:'syn',n:'synastry hits',d:'transits that touch both charts at once, felt by both',c:'#FF90E8',on:0,gl:'◇'},
  {id:'comp',n:'composite transits',d:'transits to the relationship\'s own chart, the bond as one entity',c:'#C7B0F5',on:0,gl:'◍'}]},
 {g:'cosmic convergence',items:[
  {id:'prof',n:'profections',d:'the house, and its ruler, running your year and month',c:'#D6EC4F',on:1,gl:'◈'},
  {id:'firdaria',n:'firdaria & timelords',d:'the planet ruling this period of your life, by traditional timing',c:'#D6EC4F',on:1,gl:'♄︎'},
  {id:'zr',n:'zodiacal releasing',d:'your life in chapters: peak periods and loosings of the bond',c:'#FF5A36',on:1,gl:'⟳'},
  {id:'prog',n:'progressed moon',d:'your inner clock: the progressed moon\'s sign, house and contacts',c:'#7FE0B5',on:1,gl:'☽︎'},
  {id:'power',n:'power days',d:'days where career, money, luck or love indicators line up',c:'#F4CC2E',on:1,gl:'✦'},
  {id:'sixmo',n:'six-month plan',d:'each new moon as a checkpoint for the six months ahead',c:'#FF9A3C',on:0,gl:'◐'}]},
 {g:'cosmic divination',items:[
  {id:'pull',n:'tarot pulls',d:'every card you\'ve logged, on its date, beside the sky',c:'#C7B0F5',on:1,gl:'✦'},
  {id:'entry',n:'journal entries',d:'notes, photos and synchronicities, matched to the day\'s sky',c:'#7FE0B5',on:1,gl:'✧'}]},
 {g:'cosmic ritual',items:[
  {id:'ritual',n:'rituals & workings',d:'what you planned and what you performed, with its timing',c:'#FF9A3C',on:1,gl:'✧'},
  {id:'sex',n:'intimacy log',d:'private to you, cross-referenced with the sky',c:'#FF90E8',on:0,gl:'◇'}]}
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
  r.setProperty('--glow','transparent');   /* --soft is mixed from --accent in astrocake.css */
  document.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',+s.dataset.i===i));
  saveUi();stars();
}
/* mirror of the theme for app/layout.tsx's pre-paint script (no flash on reload) */
function saveUi(){try{const d=document.documentElement;localStorage.setItem('ti-ui',JSON.stringify({mode:d.dataset.mode,type:d.dataset.type,grad:d.dataset.grad,accent:(ACC[S.accent]||ACC[0]).a}));}catch(e){}}
const swHTML=()=>ACC.map((A,i)=>`<button class="sw${i===S.accent?' on':''}" data-i="${i}" style="--c1:${A.c1};--c2:${A.c2}" onclick="setAcc(${i})"><span class="d"></span><span class="n">${A.n}</span></button>`).join('');
function setMode(m){document.documentElement.dataset.mode=m;saveUi();document.querySelectorAll('#meMode button,#obMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));stars();}
function toggleGrad(){const on=document.documentElement.dataset.grad==='on';document.documentElement.dataset.grad=on?'off':'on';saveUi();document.getElementById('gradTog').classList.toggle('on',!on);}
const TSUB={clean:'all sans serif, no ornament',balanced:'serif for titles and quotes, sans for the rest',ceremony:'the full book of shadows: serif, stars, glyphs, ✦'};
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
const MAJ=[['m00','the fool','♅︎ uranus','the fool is zero, the step taken before you know where the ground is. beginnings, trust, the open road, and the nerve to look a little foolish.','the leap without the looking: recklessness in freedom\'s clothes, or the opposite, a start you keep postponing because the ground isn\'t guaranteed.','say yes to the start. pack light.'],
['m01','the magician','☿︎ mercury','the magician is one: all four suit tools on the table, one hand to the sky, one to the earth. skill meets will, and you already have what you need to begin.','the same skill turned to sleight of hand: talent left idle, plans that stay talk, or persuasion sliding into manipulation. check whose spell this is.','the tools are on the table. use them.'],
['m02','the high priestess','☽︎ moon','the high priestess sits between the pillars, the scroll half-hidden in her robe. she is the knowing that comes before words; keep it close, it isn\'t ready to be said.','intuition on mute: you poll everyone but yourself, or discretion hardens into withholding. the inner voice is still talking; you stopped listening.','sit with it. the answer surfaces.'],
['m03','the empress','♀︎ venus','the empress, venus\'s card, sits in a ripening field: fertility, the body, abundance that grows from care. softness here is a form of power, not the absence of it.','the garden overgrown or left untended: over-giving until nothing is left, care that smothers, or creative work blocked because you stopped feeding yourself.','what you tend, grows.'],
['m04','the emperor','♈︎ aries','the emperor sits on a stone throne carved with rams: aries\'s fire turned into order. structure, authority, the plain frame that holds everything else up.','the frame becomes a cage: control passing itself off as protection, rigidity for its own sake, or no discipline where structure is actually needed.','build the frame first.'],
['m05','the hierophant','♉︎ taurus','the hierophant blesses two initiates at his feet: teaching handed down, tradition, the institutions that keep knowledge. under taurus it lasts because it was tested.','the rulebook outlives its reason: conformity out of habit, or a teacher who stopped earning the title. you may need to write your own doctrine.','ask someone who has walked this road.'],
['m06','the lovers','♊︎ gemini','the lovers stand under an angel, the tree of knowledge behind them. gemini\'s card is a choice made with heart and values together, and choosing means letting the other path go.','values and desire pulling apart: indecision dressed up as having options, or a bond held together by habit rather than choice.','choose. then commit.'],
['m07','the chariot','♋︎ cancer','the chariot is cancer\'s shell on wheels, two sphinxes pulling opposite ways. victory through will: hold the reins steady and opposing forces move as one.','the reins slip: momentum without direction, white-knuckling the wrong route, or armor so thick that nothing gets in, help included.','drive. don\'t drift.'],
['m08','strength','♌︎ leo','strength is leo\'s card: a woman closes the lion\'s jaws with bare hands. courage as patience and composure; power that doesn\'t need to raise its voice.','force replacing gentleness, or self-doubt replacing courage. the lion isn\'t tamed, just tired, and so are you.','patience is the stronger hand.'],
['m09','the hermit','♍︎ virgo','the hermit stands alone on the peak, lantern raised, a star inside it. virgo\'s discernment turned inward: stepping back to find the answer only quiet gives.','solitude past its use: isolation with a spiritual excuse, or refusing to go inward at all because of what you might hear.','go quiet on purpose.'],
['m10','wheel of fortune','♃︎ jupiter','the wheel of fortune turns under jupiter, the great benefic: timing, luck, a change of cycle you didn\'t arrange. what was down comes up.','the turn resisted, or the same loop on repeat: bad timing, setbacks taken personally, a lesson returning because it wasn\'t learned the first time.','the cycle is turning.'],
['m11','justice','♎︎ libra','justice holds the sword and the scales, libra\'s balance with an edge. cause and effect, fairness, decisions weighed on fact: what you put in comes back.','the scales tipped: dishonesty, an unfair outcome, or avoiding accountability and calling it keeping the peace.','tell the truth. the scales are already moving.'],
['m12','the hanged man','♆︎ neptune','the hanged man hangs by one foot, calm, a halo at his head. neptune\'s surrender: the chosen pause that turns the world upside down so you see it differently.','stalling and calling it surrender: martyrdom, indecision, a sacrifice nobody asked for. the pause has stopped teaching you anything.','stop struggling. look again.'],
['m13','death','♏︎ scorpio','death is thirteen, scorpio\'s card, riding past a sun rising between two towers. an ending that is already true; transformation by clearing the field, rarely anything literal.','resisting the ending: clutching a chapter that has closed, stagnation, change dragging slowly because you won\'t let it happen fast.','transformation, not tragedy.'],
['m14','temperance','♐︎ sagittarius','temperance pours water between two cups, one foot on land, one in the stream. after death comes the slow alchemy: moderation, right proportion, opposites mixed into something new.','the mix goes wrong: excess, impatience, swinging between extremes. all or nothing is a temperament, not a plan.','the middle path, on purpose.'],
['m15','the devil','♑︎ capricorn','the devil crouches over two chained figures whose collars are loose enough to lift off. capricorn\'s shadow: attachment, compulsion, materialism, the bond you agreed to.','the chains loosening: release, detachment, naming the habit out loud. read the other way, a deeper hold you won\'t look at yet.','name the chain. then lift it off.'],
['m16','the tower','♂︎ mars','the tower is struck by lightning under mars, its crown blown off. sudden upheaval, false structures falling fast, a revelation that clears ground you couldn\'t clear yourself.','the collapse in slow motion: delaying an overdue fall, holding the wall up yourself. it comes down either way; you only choose how long it takes.','sudden clarity, dramatic exit.'],
['m17','the star','♒︎ aquarius','the star kneels by the pool after the tower, pouring water onto land and back into the source. aquarius\'s card: hope, renewal, healing you can actually see.','faith running on fumes: discouragement, disconnection, pouring for everyone else from an empty jug. refill before you pour.','healing is on schedule.'],
['m18','the moon','♓︎ pisces','the moon lights a path between two towers while a dog and a wolf howl at it. pisces\'s card: dreams, illusion, fear and intuition. not everything is as lit as it looks.','the fog lifting: confusion clears, a deception surfaces, fear loosens its grip. or the fog thickens because you keep avoiding what it hides.','trust the dog. watch the wolf.'],
['m19','the sun','☉︎ sun','the sun shines on a child riding a white horse past the garden wall. the sun\'s own card: joy, vitality, success, clarity. it\'s good. let it be good.','the light dimmed, not gone: joy delayed, optimism shaded by doubt, or yourself made smaller for someone else\'s comfort.','joy, no asterisk.'],
['m20','judgement','♇ pluto','judgement sounds the trumpet and the dead rise from their coffins. pluto\'s card of rebirth: the reckoning, the call to become who you already are.','the call ignored: self-doubt, harsh self-judgement, refusing to learn from the past. pretending the phone is off doesn\'t stop it ringing.','rise. answer it.'],
['m21','the world','♄︎ saturn','the world is the last major, a dancer inside the wreath, saturn closing the circle. completion, integration, a cycle that is genuinely done.','so close: an ending left loose, shortcuts, the last five percent unfinished. closure waits until you finish.','completion, then the next spiral.']];
const SUIT={w:['wands','△','fire','drive, will, ambition, the spark'],c:['cups','▽','water','feeling, love, intuition, the tide'],s:['swords','△','air','thought, truth, conflict, the blade'],p:['pents','▽','earth','money, body, work, the ground']};
const RANK=[['ace','the ace is the root of its suit: the element in its purest form, offered by a hand from the cloud. a seed, a beginning, raw potential.','the seed left unplanted: an opportunity delayed, missed, or left to rot on the counter.'],
['2','two is the element meeting itself for the first time: a pair, a choice, a balance point you have to hold.','balance lost: one side carrying more, or a choice put off so long it makes itself.'],
['3','three is the first result: the element takes shape as growth, collaboration, early proof that it works.','growth stalls: delays, a crack in the collaboration, or plans that never leave the planning stage.'],
['4','four is the square: foundation, stability, rest. the element holds still long enough to settle, sometimes too long.','stability tipping into stagnation: the walls got comfortable, or the foundation is shifting under you.'],
['5','five breaks the square open: conflict, loss, struggle, the humbling that forces change.','the worst is passing and recovery begins, or the conflict goes quiet without being resolved.'],
['6','six restores harmony after five\'s disruption: exchange, giving and receiving, moving through and moving on.','the exchange goes uneven: a debt nobody named, strings on the gift, or a past you keep going back to.'],
['7','seven tests what six earned: strategy, assessment, defending your position or rethinking it.','the test fumbled: overwhelm, self-deception, or giving up the ground before anyone took it.'],
['8','eight is movement and mastery: speed, skill, change in motion, or the urge to get out.','motion blocked or aimless: stuck in place, or moving fast with no direction.'],
['9','nine is the element near its fullest: almost there, the last hard stretch before the close.','the fear is louder than the facts: anxiety, exhaustion, or the finish slipping because you stopped believing in it.'],
['10','ten is the cycle completed: the element at its full weight, ending in fulfilment or in burden.','the weight released or refused. either way, it\'s over. put it down.'],
['page','the page is the student of the suit: curious, a little awkward, carrying news and learning the element from scratch.','the student who won\'t study: immaturity, news that doesn\'t arrive, enthusiasm with no follow-through.'],
['knight','the knight carries the suit at full speed: pursuit, action, focus, a little reckless.','speed without the focus: impulsive, scattered, or the charge that never leaves the stable.'],
['queen','the queen holds the element inward: mastery as care and receptivity. she feels it fully and doesn\'t leak it.','mastery turned against herself: absorbing everyone else\'s weather until there\'s no shore left.'],
['king','the king holds the element outward: mastery as authority, direction, the final call.','authority misused: the throne as a weapon, control without care, or a hand that is never there.']];
const DECK=[];
MAJ.forEach((m,i)=>DECK.push({k:m[0],n:m[1],a:'major · '+m[2],up:m[3],rv:m[4],f:m[5],suit:'major'}));
Object.keys(SUIT).forEach(s=>RANK.forEach((r,i)=>{const[nm,gl,el,th]=SUIT[s];
  DECK.push({k:`${s}${String(i+1).padStart(2,'0')}`,n:`${r[0]} of ${nm}`,a:`${gl} ${el} · ${th}`,
    up:r[1],rv:r[2],f:`${el} · ${th.split(',')[0]}`,suit:s});}));
const byKey=k=>DECK.find(c=>c.k===k);

/* ══════════ CONTENT ══════════ */
const RIT=[
 {n:'cut & clear',s:'banishing · candle',v:'a saturn working for the tie that outlived its purpose. you cut the pattern, not the person.',t:['release','protection'],ph:['waning crescent','last quarter','waning gibbous'],
  best:'waning moon · saturday ♄︎ · after dark',need:['black candle','bay leaf','rosemary','black tourmaline'],pair:'the cage door',
  st:['set up on a fireproof dish, clear of anything that catches. on the bay leaf, write the pattern you\'re ending, not the name of the person.','dress the black candle from base to tip with rosemary. pushing away from you is the banishing direction.','light the leaf from the candle and drop it in the dish. say the cut out loud, once. repeating it is how you keep it.','let the candle burn down while you stay in the room; snuff it if you have to leave. set the tourmaline by the front door for three nights.'],
  sg:'they cross your mind and nothing in you moves. the urge to check on them quietly stops.'},
 {n:'road opener',s:'clearing · candle',v:'a solar working for the plan that stalled with no clear reason. it clears the way; you still walk it.',t:['money','clarity'],ph:['new moon','waxing crescent'],
  best:'new moon · sunday ☉︎ · morning',need:['orange candle','cinnamon','bay leaf','clear quartz'],pair:'the clarity cross',
  st:['name one blocked road and write it on the bay leaf. one road per working keeps the aim clean.','dress the orange candle with cinnamon from tip to base. drawing toward you is the calling-in direction.','burn the leaf in a fireproof dish, and open a real door or window as it catches. the body learns the gesture.','set the quartz on the sill until the road moves. never leave the candle burning in an empty room.'],
  sg:'callbacks, green lights, replies. the thing marked pending stops being pending.'},
 {n:'honey jar',s:'sweetening · jar',v:'a venus working, slow by design. honey softens how someone feels toward you; it does not override what they want.',t:['love'],ph:['waxing crescent','waxing gibbous','first quarter'],
  best:'waxing moon · friday ♀︎ · venus hour',need:['honey','rose petals','cinnamon','pink candle','rose quartz'],pair:'should i text back',
  st:['write their name three times, then yours across it. fold the paper toward you and place it in the jar.','add honey, rose petals, and a pinch of cinnamon to warm it.','the traditional seal is a taste of the honey and the words "as this is sweet to me, so i am sweet to you." a fingertip pressed in works too.','each friday, burn a small pink candle on a heatproof plate on the lid, with the rose quartz beside it. stay with it while it burns.'],
  sg:'softer replies. they reach out first. the tone warms before the facts change.'},
 {n:'return to sender',s:'protection · mirror',v:'a mars-hour reflection, not a curse. you send back what was sent; where it lands is not your job.',t:['protection'],ph:['new moon','waning crescent'],
  best:'dark moon · mars hour ♂︎',need:['small mirror','black salt','black candle','clear quartz'],pair:'the shadow dive',
  st:['stand the mirror facing outward, toward the door. never point it at yourself.','ring the mirror with black salt and set the candle behind it on a heatproof surface.','don\'t name a target. reflection only returns what was aimed; it needs no address from you.','when the candle is out, set the quartz in the room to clear it. sweep up the salt and throw it out away from the house.'],
  sg:'the strange run of friction stops landing on you. their chaos gets loud somewhere else.'},
 {n:'glamour before the shift',s:'glamour · self',v:'a venus glamour for walking in already decided. it changes how you carry yourself, so the room reads you differently.',t:['confidence'],ph:['waxing gibbous','full moon'],
  best:'venus hour · moon in libra ♎︎',need:['rose water','gold candle','citrine','mirror'],pair:'past · present · future',
  st:['touch rose water to your pulse points (patch-test first if your skin is sensitive) and name the version of you who is clocking in.','light the gold candle beside the mirror while you get ready, well away from hair, sprays, and fabric.','take one full look and hold your own eyes for ten seconds. it is harder than it sounds.','put the citrine in your bag and blow out the candle before you leave.'],
  sg:'compliments from strangers. better tips. the light finds you in photos.'},
 {n:'build the inner home',s:'grounding · water',v:'a lunar working for the cancer in everyone: make safety in yourself before you ask a place to provide it.',t:['clarity','love'],ph:['new moon','waxing crescent'],
  best:'new moon · moon hour ☽︎',need:['white candle','moon water','jasmine'],pair:'where do i feel safe',
  st:['set a bowl of moon water at the center of your space. that is the hearth.','place the white candle behind it on a heatproof dish and the jasmine beside it.','name three things that make a place feel like yours. be specific: a smell, a sound, a lock.','write them down and leave the paper under the bowl overnight. snuff the candle before you sleep.'],
  sg:'home starts to feel like something you do, not somewhere you wait. you stop apologizing for taking up your own space.'},
 {n:'full moon truth pull',s:'divination · light',v:'the full moon is sun and moon in opposition, everything lit from both sides. ask while nothing can hide.',t:['clarity','release'],ph:['full moon','waning gibbous'],
  best:'full moon · anywhere the light lands',need:['clear quartz','white candle','your deck'],pair:'the clarity cross',
  st:['leave the deck in moonlight for an hour with the quartz on top.','light one candle in a safe holder and ask one question. no follow-ups.','pull cards until one repeats. the repeat is the answer.','write the card down before you interpret it, so the first read stays honest. blow out the candle when you\'re done.'],
  sg:'the answer annoys you slightly. that is usually how you know it\'s real.'}];
const TAGS=['all','release','love','protection','confidence','money','clarity'];
let tagF='all';
const PANTRY=[
 {c:'❧ herbs',i:[
  {n:'bay leaf',e:'❧',w:'sacred to apollo and ruled by the sun, bay was the victor\'s crown. folk practice turns it into a messenger: write on it, burn it, let the smoke carry it.',u:'wishes · banishing · victory',o:'☉︎ sun · fire',r:['cut & clear','road opener'],cd:['m01']},
  {n:'rosemary',e:'❧',w:'a solar, fiery herb tied to remembrance and to clearing a space. it cleanses and protects, which makes it the herb to reach for when you\'re not sure.',u:'protection · clarity',o:'☉︎ sun · fire',r:['cut & clear'],cd:['m08']},
  {n:'cinnamon',e:'❧',w:'hot, solar, and fast. cinnamon speeds up whatever it\'s added to and sweetens it on the way, so it shows up in both money and love work.',u:'money · speed · sweetening',o:'☉︎ sun · fire',r:['honey jar','road opener'],cd:['p01']},
  {n:'rose petals',e:'✿',w:'the rose belongs to venus in nearly every tradition. petals draw love gently, by attraction rather than pressure, and that includes love for yourself.',u:'love · self-tenderness',o:'♀︎ venus · water',r:['honey jar'],cd:['c02']},
  {n:'jasmine',e:'✿',w:'it blooms and scents the air at night, so tradition gives it to the moon: dreams, intuition, and the quiet that lets you hear them.',u:'intuition · peace',o:'☽︎ moon · water',r:['build the inner home'],cd:['m02']}]},
 {c:'◈ crystals',i:[
  {n:'black tourmaline',e:'◈',w:'dark, dense, and grounding, so it goes to saturn and earth. it is kept at doors and thresholds to absorb what is aimed your way. the bouncer, basically.',u:'protection · grounding',o:'♄︎ saturn · earth',r:['cut & clear'],cd:['m16']},
  {n:'rose quartz',e:'◈',w:'pink, soft, and given to venus. it works on the heart at a low steady heat, and it starts with how you treat yourself.',u:'love · healing',o:'♀︎ venus · water',r:['honey jar'],cd:['c13']},
  {n:'clear quartz',e:'◈',w:'clear like water and reflective like moonlight, so it is linked to the moon. it carries no agenda of its own and amplifies whatever sits beside it.',u:'clarity · amplification',o:'☽︎ moon',r:['return to sender','road opener','full moon truth pull'],cd:['m02']},
  {n:'citrine',e:'◈',w:'the colour of sunlight, so it is ruled by the sun. it draws money and visibility, and folk lore says it never holds on to negativity.',u:'money · confidence',o:'☉︎ sun · fire',r:['glamour before the shift'],cd:['m17']}]},
 {c:'✧ candles & colors',i:[
  {n:'black candle',e:'✧',w:'black is saturn\'s colour: limits, endings, protection. it banishes and absorbs, and it is how a working says "this stops here."',u:'release · protection',o:'♄︎ saturn',r:['cut & clear','return to sender'],cd:['m13']},
  {n:'white candle',e:'✧',w:'white holds every colour, so it stands in for any intention. it is lunar and clean, the one to use for new beginnings.',u:'cleansing · beginnings',o:'☽︎ moon',r:['build the inner home','full moon truth pull'],cd:['m00']},
  {n:'pink candle',e:'✧',w:'pink is venus at her gentlest. it is used for tender love, sweetening, and repair, including the repair you owe yourself.',u:'love',o:'♀︎ venus',r:['honey jar'],cd:['c02']},
  {n:'gold candle',e:'✧',w:'gold is the sun\'s metal and colour: success, visibility, being seen to win.',u:'confidence · glamour',o:'☉︎ sun',r:['glamour before the shift'],cd:['m19']},
  {n:'orange candle',e:'✧',w:'orange sits between solar gold and fiery red and is traditionally given to mercury, god of roads and crossings. it opens doors and gets opportunity moving.',u:'momentum',o:'☿︎ mercury',r:['road opener'],cd:['m10']}]},
 {c:'☽︎ waters & oils',i:[
  {n:'moon water',e:'☽︎',w:'water left out overnight under the moon, usually a full one, to take on her qualities. it is the base for most lunar work. for altar use, not for drinking.',u:'intuition · cleansing',o:'☽︎ moon · water',r:['build the inner home'],cd:['m02']},
  {n:'rose water',e:'✿',w:'venus distilled. worn on the skin, it turns attraction into something you put on deliberately, like a scent with a purpose.',u:'glamour · love',o:'♀︎ venus',r:['glamour before the shift'],cd:['m03']},
  {n:'black salt',e:'◈',w:'salt has protected thresholds for centuries; blackened with ash or charcoal, it takes on saturn\'s weight. you lay it down as a line that isn\'t crossed.',u:'protection · banishing',o:'♄︎ saturn · earth',r:['return to sender'],cd:['m15']},
  {n:'honey',e:'❧',w:'sweetness has belonged to venus since antiquity. honey sweetens a situation slowly and holds on, which is why jar work is built on it.',u:'love · sweetening',o:'♀︎ venus',r:['honey jar'],cd:['c02']}]}];
const SPR={yours:[
 {n:'should i text back',f:'3 cards · what pulls you, what repeats, what opens',p:['the pull','the pattern','the door']},
 {n:'the cage door',f:'4 cards · for leaving what you\'ve outgrown',p:['the cage','the key','the cost','the open air']},
 {n:'the shadow dive',f:'5 cards · down into the pattern and back up',p:['surface','shadow','the hook','the medicine','the rise']},
 {n:'where do i feel safe',f:'4 cards · new moon',p:['the walls','the door','the hearth','the key']}],
classic:[
 {n:'the clarity cross',f:'5 cards · for when your mind won\'t settle',p:['heart of it','crossing','root','crown','next']},
 {n:'past · present · future',f:'3 cards · the classic, and a classic for a reason',p:['past','present','future']},
 {n:'the celtic cross',f:'10 cards · the whole situation, layer by layer',p:['heart','cross','root','past','crown','future','self','environment','hopes/fears','outcome']}]};
const TRICKS=[['✦ significators','choose the court card whose suit matches the element of your sun, moon, or rising: wands for fire, cups for water, swords for air, pentacles for earth. that card is you in the spread.'],
 ['♞ knight directions','notice which way the knight\'s horse faces. toward the centre of the spread, the situation is coming to you; facing out, it is leaving.'],
 ['✿ read by color','before you read a single meaning, count warm cards against cool ones. warm palettes push forward; cool ones hold back and reflect.'],
 ['❀ the flower lens','look at the plants in the imagery: buds, full bloom, or wilt. they show what stage the situation has reached.'],
 ['◑ the repeat rule','if the same card turns up three times, stop asking. it already answered, and you didn\'t like it.']];

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
const PROMPTS={'new moon':'what are you actually beginning this cycle, not what sounds good out loud?',
 'waxing crescent':'what new thing would you protect if someone tried to talk you out of it?',
 'first quarter':'where is the resistance, and is it telling you to stop or to build it stronger?',
 'waxing gibbous':'what needs one more revision before it\'s ready to be seen?',
 'full moon':'what can you see clearly now that you couldn\'t two weeks ago?',
 'waning gibbous':'what have you learned this cycle, and who needs to hear it?',
 'last quarter':'what are you still carrying out of habit rather than choice?',
 'waning crescent':'what is ending, and what do you need to rest before the next beginning?'};
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
      out.push({id:'ms-'+k,lay:'lunar',gl:'☽︎',t:`moon enters ${SIGNS[si]}`,s:`${pn} · ${SIGN_READ[SIGNS[si]][0].split(':')[0]}`,date:k});
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
    out.push({id:'ms-'+k,lay:'lunar',gl:'☽︎',t:`moon enters ${SIGNS[si]}`,s:`${pn} · ${SIGN_READ[SIGNS[si]][0].split(':')[0]}`,date:k});
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
    :`<button class="card qd" onclick="openAdd('${S.sel}')">nothing scheduled. ${MOOD[phaseName(p)]}<span class="qd-go">+ add something to ${fmt(sd)} ›</span></button>`;
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
     <span><span class="t">${esc(p.name)}</span><div class="s">${p.natal?(()=>{const b=big3Of(p);return `☉︎ ${SIGNS[b.sun]} · ☽︎ ${SIGNS[b.moon]}${b.rise!=null?' · ↑ '+SIGNS[b.rise]:''}`;})():p.date?(p.cast==='failed'?'couldn\'t cast · tap to fix':'casting…'):'birth data pending'}</div></span><span class="c">›</span></button>`).join('')
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
function personForm(i){
  const p=i===undefined?{rel:'partner'}:S.people[i];
  pCity=p.lat!=null&&p.tzName?{lat:p.lat,lng:p.lng,tz:p.tzName,n:p.place}:null;
  sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">☍ · ${i===undefined?'add to orbit':'birth details'} · ☍</div>
     <div class="xp-h">${i===undefined?'someone new':esc(p.name)}</div>
     <div class="fm">
       <label class="fl"><span>name</span><input id="pN" placeholder="what you call them" value="${esc(p.name||'')}"></label>
       <div class="frow"><label class="fl"><span>birthday</span><input id="pD" type="date" value="${esc(p.date||'')}"></label>
         <label class="fl"><span>time · optional</span><input id="pT" type="time" value="${esc(p.time||'')}"></label></div>
       <label class="fl" style="position:relative"><span>birth city</span><input id="pP" placeholder="start typing, then pick" autocomplete="off" value="${esc(p.place||'')}" oninput="pCity=null;placeSearch(this.value,'pPlaceList',c=>pCity=c)"><div id="pPlaceList" class="ob-places"></div></label>
       <div class="fl"><span>they're your</span><div class="fchips" id="pRc">${['partner','situationship','ex','friend','family','client','enemy'].map(r=>`<button type="button" class="fchip${r===(p.rel||'partner')?' on':''}" data-r="${r}" onclick="document.querySelectorAll('#pRc button').forEach(x=>x.classList.toggle('on',x===this));document.getElementById('pR').value='${r}'">${r}</button>`).join('')}</div>
         <input type="hidden" id="pR" value="${esc(p.rel||'partner')}"></div>
       <div class="ferr" id="pErr"></div>
     </div>
     <button class="btn" id="pGo" onclick="savePerson(${i===undefined?'':i})">${i===undefined?'cast their chart':'save and recast'}</button>`);
}
function openPerson(i){
  if(i===undefined)return personForm();
  const p=S.people[i];S.personIdx=i;
  document.getElementById('pBody').innerHTML=
   `<div class="eb"><span class="cer">☍ · </span>${p.rel||'orbit'}<span class="cer"> · ☍</span></div>
    <div class="h1 sf">${p.name}<span class="k">✦</span></div>
    <div class="h1s">${esc(p.place||'—')} · ${p.date||'no birth data'} · <button class="lk" onclick="personForm(${i})">edit</button></div>
    ${p.cast==='failed'&&!p.natal?castFailHTML(p,i):''}
    ${p.cast==='failed'&&!p.natal?'':`<div class="pnl">${p.natal?`<div class="pwheel">${wheelSVG(p.natal,i)}</div>`:''}${big3(p,i)}</div>`}
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
  const b3=big3Of(p);if(b3.sun==null)return `<div style="font-size:13px;color:var(--dust)">${p.cast==='failed'?'their sky reads once the chart casts.':'casting their chart with the engine…'}</div>`;
  const nsun=b3.sun,nmoon=b3.moon;
  const hit=si===nsun?`the moon is crossing their sun sign today, so they feel more like themselves than usual: visible, a little louder, easier to read.`
    :si===nmoon?`the moon is back in their moon sign: a small monthly reset for them. feelings sit closer to the surface; go gently.`
    :`the moon in ${SIGNS[si]} touches them too: ${SIGN_READ[SIGNS[si]][0].split(': ')[1]}.`;
  return `<div class="tr"><span class="g">☽︎</span><div><div class="a">moon in ${SIGNS[si]} ${GLY[si]}</div><div class="b">${hit}</div></div></div>`;
}
let pCity=null;
/* a typed city that wasn't picked from the list: look it up once before casting */
async function resolveCity(q){
  const seed=CITIES.find(c=>c.n.toLowerCase().startsWith(q.toLowerCase()));
  if(seed)return seed;
  try{
    const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.split(',')[0].trim())}&count=1&language=en&format=json`,{signal:AbortSignal.timeout(6000)});
    const x=((await r.json()).results||[]).find(h=>h.timezone);
    return x?{n:[x.name,x.admin1,x.country_code].filter(Boolean).join(', '),lat:x.latitude,lng:x.longitude,tz:x.timezone}:null;
  }catch(e){return null;}
}
async function savePerson(i){
  const err=m=>{const e=document.getElementById('pErr');if(e)e.textContent=m;};
  const n=document.getElementById('pN').value.trim();if(!n)return err('give them a name first.');
  const date=document.getElementById('pD').value, time=document.getElementById('pT').value;
  let place=document.getElementById('pP').value.trim();
  if(date&&place&&!pCity){
    const go=document.getElementById('pGo');if(go){go.disabled=true;go.textContent='finding that city…';}
    pCity=await resolveCity(place);
    if(go){go.disabled=false;go.textContent=i===undefined?'cast their chart':'save and recast';}
    if(!pCity)return err('couldn\'t find that city. type a few letters and pick it from the list.');
  }
  if(date&&!place)return err('add their birth city so the chart has a place to stand.');
  const p=i===undefined?{}:S.people[i];
  Object.assign(p,{name:n,date,time,place:pCity?pCity.n||place:place,rel:document.getElementById('pR').value});
  if(pCity){p.lat=pCity.lat;p.lng=pCity.lng;p.tzName=pCity.tz;}
  if(i===undefined)S.people.push(p);
  pCity=null;closeSheet();
  if(!p.date){p.natal=null;p.cast=null;renderOrbit();tiSave();return toast('☍ in orbit. add a birth date to cast their chart');}
  castPerson(p);
}
/* casting has three honest states: casting, cast, or failed with a reason and a way out */
function castPerson(p){
  p.natal=null;p.cast='casting';p.castErr='';
  renderOrbit();rerenderPerson(p);tiSave();
  return castChart(p,false).then(ch=>{
    if(!ch)throw new Error('the chart didn\'t cast');
    p.natal=ch;p.cast=null;renderOrbit();rerenderPerson(p);tiSave();const b=big3Of(p);
    toast(`✦ ${esc(p.name)}: ${SIGNS[b.sun]} sun${b.rise!=null?', '+SIGNS[b.rise]+' rising':''}`);
  }).catch(e=>{
    p.cast='failed';p.castErr=String(e.message||e).toLowerCase();
    renderOrbit();rerenderPerson(p);tiSave();
    toast('☍ '+p.castErr);
  });
}
function rerenderPerson(p){
  const i=S.people.indexOf(p);
  if(i>=0&&VSTACK[VSTACK.length-1]==='person'&&S.personIdx===i)openPerson(i);
}
function castFailHTML(p,i){
  return `<div class="card cfail"><div class="t1">their chart didn't cast</div><div class="t2">${esc(p.castErr||'something went wrong reaching the engine.')}</div>
    <div class="cfail-b"><button class="btn" onclick="castPerson(S.people[${i}])">try again</button><button class="btn g" onclick="personForm(${i})">edit birth details</button></div></div>`;
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
const sprHTML=s=>`<div class="wk spr"><button class="wkh"><span class="spr-mini">${spreadHTML(layoutOf(s,s.p.length),s.p.map(()=>null),{w:9,mini:1})}</span><span><span class="nm">${s.n}</span><div class="mt">${s.f}</div></span><span class="wkc">›</span></button>
  <div class="wkb"><div class="spr-show">${spreadHTML(layoutOf(s,s.p.length),s.p.map(()=>null),{w:s.p.length>=9?22:28})}</div>
  <ol class="spr-pos">${s.p.map(p=>`<li>${p}</li>`).join('')}</ol>
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

/* ══════════ LOG A PULL ══════════
   four steps, one sheet: ◉ photo → ✦ spread → ⟡ cards → ✧ the read.
   the spread is drawn as real card outlines in its real shape; tap a slot, tap a card. */
/* layouts: [x, y, crossed?] — x in card widths, y in card heights, from the spread's centre */
const SPR_LAYOUT={
 'one card':[[0,0]],
 'past · present · future':[[-1.2,0],[0,0],[1.2,0]],
 'should i text back':[[-1.2,0],[0,0],[1.2,0]],
 'the cage door':[[-1.8,0],[-.6,0],[.6,0],[1.8,0]],
 'where do i feel safe':[[0,-.62],[-1.2,0],[1.2,0],[0,.62]],
 'the shadow dive':[[-2.4,-.3],[-1.2,.15],[0,.6],[1.2,.15],[2.4,-.3]],
 'the clarity cross':[[0,0],[0,0,1],[0,1.08],[0,-1.08],[1.4,0]],
 'the celtic cross':[[-.9,0],[-.9,0,1],[-.9,1.08],[-2.3,0],[-.9,-1.08],[.5,0],[2.1,1.62],[2.1,.54],[2.1,-.54],[2.1,-1.62]]
};
const ONE={n:'one card',f:'1 card · the daily pull',p:['the card']};
const FREE={n:'free pull',f:'any number · lay it how it fell',p:[]};
const allSpreads=()=>[ONE,...SPR.classic,...SPR.yours];
const sprBy=n=>allSpreads().find(x=>x.n===n);
function layoutOf(sp,count){
  if(sp&&SPR_LAYOUT[sp.n])return SPR_LAYOUT[sp.n];
  const n=Math.max(1,count),per=Math.min(5,n),rows=Math.ceil(n/per);   /* free pull: rows of five */
  return Array.from({length:n},(_,i)=>{const r=Math.floor(i/per),c=i%per,inRow=Math.min(per,n-r*per);
    return [(c-(inRow-1)/2)*1.2,(r-(rows-1)/2)*1.12];});
}
/* draws a spread: slots = [{k,rev}|null], opts = {w, active, tap (fn name), labels, mini} */
function spreadHTML(L,slots,o){
  const w=o.w,h=Math.round(w*1.62),pos=L.map(([x,y,cr])=>({x:x*w,y:y*h,cr:!!cr}));
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  pos.forEach(q=>{const hw=(q.cr?h:w)/2,hh=(q.cr?w:h)/2;x0=Math.min(x0,q.x-hw);x1=Math.max(x1,q.x+hw);y0=Math.min(y0,q.y-hh);y1=Math.max(y1,q.y+hh);});
  const W=Math.ceil(x1-x0)+2,H=Math.ceil(y1-y0)+2;
  return `<div class="spl${o.mini?' mini':''}" style="width:${W}px;height:${H}px">${pos.map((q,i)=>{
    const c=slots[i],act=o.active===i;
    const st=`left:${(q.x-x0-w/2+1).toFixed(1)}px;top:${(q.y-y0-h/2+1).toFixed(1)}px;width:${w}px;height:${h}px${q.cr?';transform:rotate(90deg)':''}`;
    const inner=c?`<img src="${IMG[c.k]||''}" alt="${byKey(c.k).n}" class="${c.rev?'rv':''}">`:(o.mini?'':`<span class="sn">${i+1}</span>`);
    return o.tap?`<button class="slot${c?' full':''}${act?' act':''}${q.cr?' cr':''}" style="${st}" onclick="${o.tap}(${i})" aria-label="position ${i+1}${c?' · '+byKey(c.k).n:''}">${inner}</button>`
      :`<span class="slot${c?' full':''}${q.cr?' cr':''}" style="${st}">${inner}</span>`;}).join('')}</div>`;
}
let PL=null;
function openPull(past,spread,pre){
  const sp=spread?sprBy(spread):null;
  PL={step:sp||pre?2:0,past:!!past,spread:sp,slots:sp?sp.p.map(()=>null):[],active:0,photos:[],q:'',notes:'',date:key(new Date()),search:''};
  if(pre){if(!PL.spread){PL.spread=ONE;PL.slots=[null];}PL.slots[0]={k:pre,rev:false};PL.active=PL.slots.length>1?1:0;}
  renderPull();
}
const PL_STEPS=[['◉','photo'],['✦','spread'],['⟡','cards'],['✧','the read']];
function plGo(n){if(n>=2&&!PL.spread)return toast('pick a spread first ✦');PL.step=n;renderPull();}
function renderPull(){
  const st=PL.step,sp=PL.spread;
  const head=`<div class="gb"></div><div class="pl-steps">${PL_STEPS.map(([g,n],i)=>`<button class="${i===st?'on':''}${i<st?' done':''}" onclick="plGo(${i})">${g} ${n}</button>`).join('')}</div>`;
  let body='',foot='';
  if(st===0){
    body=`<div class="pl-h"><em>${PL.past?'a past':'snap the'}</em> spread</div>
      <div class="pl-sub">a photo keeps it exactly as it fell. you'll name the cards next.</div>
      ${PL.photos.length?`<div class="pl-photo"><img src="${PL.photos[0]}" alt="your spread"></div>
        ${PL.photos.length>1?`<div class="prev">${PL.photos.slice(1).map(x=>`<img src="${x}">`).join('')}</div>`:''}`
      :`<label class="pl-drop"><input type="file" accept="image/*" multiple hidden onchange="plPhoto(this)">
          <span class="pl-cards"><i></i><i></i><i></i></span>
          <span class="t">add a photo of the spread</span><span class="s">take one or pick from your library</span></label>`}
      ${PL.photos.length?`<label class="btn g pl-more"><input type="file" accept="image/*" hidden onchange="plPhoto(this)">+ another photo</label>`:''}`;
    foot=`<button class="btn" onclick="plGo(1)">${PL.photos.length?'next':'skip — lay it out by hand'}</button>`;
  } else if(st===1){
    body=`<div class="pl-h"><em>which</em> spread</div><div class="pl-sub">the shape you laid it in</div>
      ${PL.photos.length?`<img class="pl-ref" src="${PL.photos[0]}" alt="">`:''}
      <div class="pl-list">${[...allSpreads(),FREE].map(x=>`<button class="pl-sp${sp&&sp.n===x.n?' on':''}" onclick="plSpread('${x.n.replace(/'/g,"\\'")}')">
        <span class="pl-mini">${spreadHTML(layoutOf(x.p.length?x:null,x.p.length||3),(x.p.length?x.p:[0,0,0]).map(()=>null),{w:9,mini:1})}</span>
        <span class="pl-sn"><b>${x.n}</b><span>${x.f}</span></span></button>`).join('')}</div>`;
    foot=`<button class="btn g" onclick="plGo(0)">‹ back</button><button class="btn" onclick="plGo(2)">next</button>`;
  } else if(st===2){
    const L=layoutOf(sp.p.length?sp:null,PL.slots.length+(sp.p.length?0:1));
    const slots=sp.p.length?PL.slots:[...PL.slots,null];
    const n=L.length,w=n>=9?34:n>=5?40:n>=3?50:64;
    const a=PL.active,cur=slots[a];
    const posName=sp.p[a]||`card ${a+1}`;
    body=`${PL.photos.length?`<button class="pl-thumb" onclick="plGo(0)"><img src="${PL.photos[0]}" alt="your photo"></button>`:''}
      <div class="pl-h sm"><em>${sp.n}</em></div>
      <div class="pl-stage">${spreadHTML(L,slots,{w,active:a,tap:'plSlot'})}</div>
      <div class="pl-pos"><span class="n">${a+1}</span><span class="p">${posName}</span>
        ${cur?`<span class="c">${byKey(cur.k).n}${cur.rev?' · reversed':''}</span><button class="lk" onclick="plRev()">⟲ ${cur.rev?'upright':'reverse'}</button><button class="lk" onclick="plClear()">clear</button>`:'<span class="c dim">tap a card below</span>'}</div>
      <input class="pl-search" placeholder="search the 78…" value="${esc(PL.search)}" oninput="PL.search=this.value;plPick()">
      <div class="pl-pick" id="plPick"></div>`;
    foot=`<button class="btn g" onclick="plGo(1)">‹ back</button><button class="btn" onclick="plGo(3)">next</button>`;
  } else {
    const cards=PL.slots.map((c,i)=>c?{...c,i}:null).filter(Boolean);
    const L=layoutOf(sp.p.length?sp:null,PL.slots.length);
    body=`<div class="pl-h"><em>the</em> read</div>
      <div class="pl-stage sm">${spreadHTML(L,PL.slots,{w:L.length>=9?24:L.length>=5?30:38})}</div>
      <div class="pl-fields">
        <label><span>date</span><input id="plD" type="date" value="${PL.date}" onchange="PL.date=this.value"></label>
        <label><span>the question</span><input id="plQ" placeholder="what were you asking?" value="${esc(PL.q)}" oninput="PL.q=this.value"></label>
      </div>
      <div class="pl-in">${cards.length?cards.map(c=>{const d=byKey(c.k);return `<button class="pl-row" onclick="openCard('${c.k}',${!!c.rev})">
          <img src="${IMG[c.k]||''}" class="${c.rev?'rv':''}" alt=""><span><span class="pp">${c.i+1} · ${sp.p[c.i]||'card '+(c.i+1)}</span><b>${d.n}${c.rev?' ⟲':''}</b><span class="kw">${(c.rev?d.rv:d.up).split(/[.;]/)[0]}</span></span></button>`;}).join('')
        :'<div class="pl-sub">no cards named — the photo still goes in the book.</div>'}</div>
      <label class="pl-notes"><span>what it said · what you felt</span><textarea id="plN" rows="3" oninput="PL.notes=this.value">${esc(PL.notes)}</textarea></label>`;
    foot=`<button class="btn g" onclick="plGo(2)">‹ back</button><button class="btn" onclick="savePull()">into the book</button>`;
  }
  sheet(`${head}<div class="pl-body">${body}</div><div class="pl-foot">${foot}</div>`);
  if(st===2)plPick();
}
function plPhoto(inp){
  [...inp.files].forEach(f=>{const r=new FileReader();r.onload=x=>{PL.photos.push(x.target.result);renderPull();};r.readAsDataURL(f);});
}
function plSpread(n){
  const sp=n===FREE.n?FREE:sprBy(n);
  const keep=PL.slots.filter(Boolean);
  PL.spread=sp;PL.slots=sp.p.length?sp.p.map((_,i)=>keep[i]||null):keep;
  PL.active=Math.max(0,PL.slots.findIndex(x=>!x));if(PL.active<0||!sp.p.length)PL.active=sp.p.length?0:PL.slots.length;
  PL.step=2;renderPull();
}
function plSlot(i){PL.active=i;renderPull();}
function plRev(){const c=PL.slots[PL.active];if(c){c.rev=!c.rev;renderPull();}}
function plClear(){if(PL.spread.p.length)PL.slots[PL.active]=null;else PL.slots.splice(PL.active,1);renderPull();}
function plPick(){
  const q=(PL.search||'').toLowerCase(),used=new Map(PL.slots.map((c,i)=>c?[c.k,i]:null).filter(Boolean));
  const el=document.getElementById('plPick');if(!el)return;
  el.innerHTML=DECK.filter(c=>!q||c.n.includes(q)).map(c=>{const u=used.get(c.k);
    return `<button class="pc${u!=null?' used':''}" onclick="plCard('${c.k}')" aria-label="${c.n}"><img src="${IMG[c.k]||''}" loading="lazy" alt="">${u!=null?`<span class="b">${u+1}</span>`:''}</button>`;}).join('');
}
function plCard(k){
  const sp=PL.spread,at=PL.slots.findIndex(c=>c&&c.k===k);
  if(at>=0&&at!==PL.active){PL.active=at;return renderPull();}          /* already down — jump to it */
  if(sp.p.length){PL.slots[PL.active]={k,rev:false};
    const nx=PL.slots.findIndex((c,i)=>!c&&i>PL.active),any=PL.slots.findIndex(c=>!c);
    PL.active=nx>=0?nx:any>=0?any:PL.active;}
  else{PL.slots[PL.active]={k,rev:false};PL.active=PL.slots.length;}
  PL.search='';renderPull();
  if(PL.slots.length&&PL.slots.every(Boolean)&&sp.p.length)toast('✦ the spread is laid — reverse any that fell upside down');
}
function savePull(){
  const d=PL.date||key(new Date()),cards=PL.slots.map((c,i)=>c?{...c,pos:PL.spread.p[i]||null,i}:null).filter(Boolean);
  if(!cards.length&&!PL.photos.length)return toast('name a card or snap the spread ✦');
  const dt=parse(d),p=phase(dt),si=signOf(moonLon(dt));
  S.entries.unshift({id:Date.now(),date:d,type:'pull',title:PL.q||PL.spread.n,spread:PL.spread.n,slots:PL.slots.map(c=>c?{k:c.k,rev:c.rev}:null),
    body:PL.notes,photos:[...PL.photos],cards,sky:`${phaseName(p)} in ${SIGNS[si]} ${GLY[si]}`});
  closeSheet();toast(`✦ into the book — stamped ${phaseName(p)} in ${SIGNS[si]}`);sparkleBurst(innerWidth/2,innerHeight/2,10);
  renderGrim();renderJournal();
}
/* kept for older markup: the old picker entry points now open the new flow */
function renderPick(){if(PL&&PL.step===2)plPick();}
function tapCard(k){plCard(k);}

/* ══════════ ENTRIES ══════════ */
let entPhotos=[];
function openEntry(dk,who,pre){
  entPhotos=[];
  sheet(`<div class="gb"></div><div class="xp-eb">✧ · the record · ✧</div><div class="xp-h">new entry</div>
    <div class="fm">
      <div class="fl"><span>what kind</span><div class="fchips" id="etype">
        <button type="button" data-t="note" class="fchip on">✧ note</button><button type="button" data-t="ritual" class="fchip">✧ working</button>
        <button type="button" data-t="cycle" class="fchip">◉ cycle</button><button type="button" data-t="sex" class="fchip">◇ intimacy</button></div></div>
      <div class="frow"><label class="fl" style="flex:0 0 46%"><span>date</span><input id="enD" type="date" value="${dk||key(new Date())}"></label>
        <label class="fl"><span>title</span><input id="enT" placeholder="optional" value="${who?'about '+esc(who):''}"></label></div>
      <label class="fl"><span>what happened</span><textarea id="enB" rows="4" placeholder="${who?'what happened with '+esc(who)+'?':'what you noticed, what the sky was doing…'}">${pre?esc(pre)+'\n\n':''}</textarea></label>
      <div class="fl"><span>photos · optional</span>
        <label class="ph-add"><input type="file" id="enF" accept="image/*" multiple hidden><span class="pl-cards"><i></i><i></i></span><span>add photos — screenshots, spreads, altars, signs</span></label>
        <div class="prev" id="enP"></div></div>
    </div>
    ${who?`<input type="hidden" id="enW" value="${esc(who)}">`:''}
    <button class="btn" onclick="saveEntry()">into the book</button>`);
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
    ${e.spread&&e.slots&&e.slots.some(Boolean)?`<div class="ent-spl">${spreadHTML(layoutOf(sprBy(e.spread)||null,e.slots.length),e.slots,{w:e.slots.length>=9?22:28})}</div>`:''}
    ${!e.spread&&e.cards&&e.cards.length?`<div class="cds">${e.cards.map(c=>`<button class="cdb" onclick="openCard('${c.k}',${!!c.rev})"><img src="${IMG[c.k]}" class="${c.rev?'rv':''}" alt="${byKey(c.k).n}"></button>`).join('')}</div>`:''}
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
  loadPromise();
  const b=big3Of(S.me);
  document.getElementById('natalPromise').innerHTML=
   `your sun is in <b>${SIGNS[b.sun]}</b>, what you are built to become; your moon is in <b>${SIGNS[b.moon]}</b>, what you need in order to feel safe. ${b.sun===b.moon?'they share a sign, which is rare: will and need pull the same way, so when you are on you are fully on, and there is little room to hide when you are not.':'they work in different signs, and the chart asks you to serve both: the sun sets the direction, the moon decides whether you can sustain it.'} with the moon in ${SIGNS[b.moon]}, ${SIGN_READ[SIGNS[b.moon]][0].split(': ')[1]}.${b.rise!=null?` <b>${SIGNS[b.rise]}</b> rising is the doorway people meet first: ${SIGN_READ[SIGNS[b.rise]][0].split(': ')[1]}.`:''}`;
}

/* the written natal promise: generated once per chart on request (/api/read/natal), then kept */
let PROMISE={state:'idle',reading:null,enabled:false,ref:null};
async function loadPromise(){
  const ref=S.me.natal&&S.me.natal.computedAt;if(PROMISE.ref===ref&&PROMISE.state!=='idle')return renderPromise();
  PROMISE={state:'loading',reading:null,enabled:false,ref};renderPromise();
  try{const r=await fetch('/api/read/natal');const j=await r.json();
    PROMISE={state:j.reading?'done':'none',reading:j.reading,enabled:!!j.enabled,ref};}
  catch(e){PROMISE.state='none';}
  renderPromise();
}
async function writePromise(){
  PROMISE.state='writing';renderPromise();
  try{const r=await fetch('/api/read/natal',{method:'POST'});const j=await r.json();
    if(!r.ok)throw new Error(j.error||'the reading didn\'t come through');
    PROMISE.state='done';PROMISE.reading=j.reading;sparkleBurst(innerWidth/2,innerHeight*.4,10);}
  catch(e){PROMISE.state='none';toast(e.message);}
  renderPromise();
}
function renderPromise(){
  const el=document.getElementById('natalRead');if(!el)return;
  const P=PROMISE,teaser=document.getElementById('natalPromise');
  if(P.state==='done'&&P.reading){
    if(teaser)teaser.style.display='none';
    el.innerHTML=`<div class="np"><div class="np-t">${esc(P.reading.title||'your natal promise')}</div>${String(P.reading.body).split(/\n\s*\n/).map(x=>`<p>${esc(x.trim())}</p>`).join('')}
      <div class="np-f">written for your chart by the transit intelligence voice · kept in your record</div></div>`;return;}
  if(teaser)teaser.style.display='';
  if(P.state==='loading'){el.innerHTML='';return;}
  if(P.state==='writing'){el.innerHTML='<div class="np-w">✦ reading your chart… this takes about a minute. you can leave this page — it\'ll be here.</div>';return;}
  el.innerHTML=P.enabled?`<button class="btn" onclick="writePromise()" style="margin-top:12px">✦ read my full natal promise</button><div class="np-n">a full reading of your chart, written once and kept.</div>`
    :`<div class="np-n" style="margin-top:12px">✦ the full written promise switches on once readings are connected.</div>`;
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
const HOUSE_MEAN=['the self: your body, temperament and the first impression you make before you say a word','money and resources: what you earn, own and value, and the self-worth underneath it','the near world: siblings, neighbors, messages, short trips and the way your mind moves day to day','home and roots: family, ancestry, the private foundation you build on','pleasure and creation: romance, play, art, children and the risks you take for joy','daily work and health: routines, service, the body\'s upkeep and the habits that run your days',
 'partnership: marriage, contracts, close collaborators and open rivals, the people across the table','shared resources and depth: other people\'s money, debt, sex, inheritance and what you merge with others','the far horizon: travel, belief, higher learning, law and the search for meaning','career and reputation: your public role, ambitions and what you are known for','community: friends, networks, allies and the future you build with others','the hidden: the unconscious, solitude, endings and what you work through out of sight'];
const PLANET_MEAN={sun:'your core identity: the vitality you run on and the self you are growing into',moon:'your emotional body: what you need to feel safe and how you comfort yourself',mercury:'your mind and voice: how you think, learn, talk and make sense of things',venus:'your way of loving and valuing: what you find beautiful, who you attract and what you hold dear',mars:'your drive: how you want, pursue, compete and fight for what matters',jupiter:'your capacity to grow: where faith, luck and generosity come easily, and where you overdo it',
 saturn:'your principle of limits: where life makes you earn it through discipline, time and fear faced down',uranus:'your break with the pattern: where you rebel, innovate and refuse to be predictable',neptune:'your capacity to dissolve: where you dream, idealize, sense the unseen and lose the edges',pluto:'your depth: where power, obsession, loss and rebirth do their slow work',chiron:'the wound that becomes the medicine: where you hurt and where you learn to heal others',
 north_node:'the direction of growth: the unfamiliar qualities this life asks you to develop',south_node:'the familiar groove: the skills you arrived with and the comfort zone you are outgrowing',lilith:'the part of you that refused to be tamed: raw desire, exile and the power of saying no',asc:'the sign rising on the eastern horizon at birth: your body, your approach to life and the first impression you make',mc:'the highest point of the chart: your public direction, vocation and reputation',dsc:'the point setting in the west at birth: what you seek, and project, in partners',ic:'the lowest point of the chart: your roots, private life and inner foundation'};
const GLOSS={
 retrograde:['℞ retrograde','a planet is retrograde when, seen from earth, it appears to move backward through the zodiac. it isn\'t; earth is overtaking it in orbit, and the stations where it seems to stop are the loudest points. while it\'s retrograde, that planet\'s topics go into review: revisit, repair, reread. launching gets harder and fixing gets easier.'],
 elements:['◐ the element balance','count the seven classical planets by element: fire (aries, leo, sagittarius) acts, earth (taurus, virgo, capricorn) builds, air (gemini, libra, aquarius) connects and talks, water (cancer, scorpio, pisces) feels. whichever element leads sets the day\'s default temperament. the missing one is what everyone forgets to bring.'],
 rising:['↑ the rising','your ascendant is the sign that was rising on the eastern horizon at the minute and place you were born. it anchors every house in the chart and colors how you meet the world, so it needs an exact birth time. the app casts it with the celestine engine; without a time there is no rising, and we won\'t guess one.'],
 sun:['☉︎ the sun','the sun\'s sign, degree and house at your birth. it describes your core identity: what gives you vitality, what you\'re built to become, and where you want to be seen. read it as the purpose the rest of the chart serves.'],
 moon:['☽︎ the moon','the moon\'s sign, degree and house at your birth. it describes your emotional body: what you need to feel safe, how you self-soothe, and how you behave when nobody\'s watching. the sun is who you\'re becoming; the moon is what you need on the way.'],
 wheel:['◎ reading the wheel','the outer band is the zodiac (ARI → PIS), ticked every 5°. the solid line across is your horizon, rising on the left and setting on the right; the dashed line is the MC–IC meridian. the small numbers are your houses, running counter-clockwise from the rising, and each planet sits at its exact degree as a two-letter code (SU sun, MO moon, ME mercury…). lines in the hub are aspects tighter than 4°: solid for squares and oppositions, dashed for sextiles and trines. tap any code to open it.'],
 aspects:['☌ aspects','aspects are the angles between planets, measured along the zodiac: conjunction 0° (fused), sextile 60° (an easy opening), square 90° (friction that builds strength), trine 120° (natural talent), opposition 180° (a seesaw). the orb is the distance from exact; the tighter the orb, the louder the aspect. read the planets first, then the angle tells you how they get along.'],
 placements:['✦ placements','a placement is one body in your chart, read in three parts: the sign (how it operates), the degree (exactly where), and the house (which area of life it works in). ℞ means it was retrograde at your birth, so it tends to work inward first and show outwardly later.'],
 notifications:['◉ notifications','push reminders for void-of-course moons, exact aspects, lunations and your returns are still being built. until then the calendar is the source of truth: everything that would notify you is already on it.'],
 deck:['✦ deck art','the rider–waite–smith deck, from the 1909 original scans of pamela colman smith\'s art. it is in the public domain, so it is yours to keep for good.'],
 layers:['◐ calendar layers','layers are the lenses the calendar can show: the moon, the wider sky, your chart, the people in your orbit, and your own practice. each one adds its events to the same days, so you can see where they stack. turn on what you actually use and the calendar redraws as you go.'],
 porphyry:['◈ porphyry houses','the default house system here. your real angles (ASC, IC, DSC, MC) anchor the four quadrants, and each quadrant is split into three equal houses. it stays stable at every latitude and stays honest to your actual horizon. whole-sign and placidus are available in settings.'],
 void:['⊘ void of course','the moon is void of course from her last major aspect in a sign until she enters the next sign. it can last minutes or most of a day. launches, sends and promises made in a void tend to go nowhere, so use it to rest, edit and wait.'],
 lunation:['● lunations','a lunation is a new or full moon. the new moon, sun and moon together, is for planting intentions; the full moon, sun and moon opposite, is for harvest and things coming to light. an eclipse is a lunation near the moon\'s nodes, with consequences that unfold over months.'],
 flag:['✦ flagged days','a day is flagged when three or more events stack up, or when something major lands, like an eclipse or a station. these are the days worth planning around, not panicking about.'],
 stand:['☉︎ the sun\'s season','the sun spends about a month in each sign, and that sign sets the season everyone is living in. it is the shared backdrop to every personal transit. the arrow shows when the sun moves into the next sign.'],
 stats:['◇ the month at a glance','a count of what\'s on the calendar this month with your current layers, how many days are flagged, and which part of the sky is most active. use it to see whether the month is busy before you read the details.'],
 calendar:['✦ the calendar','this is the cosmic calendar sheet, live. your chart line sits up top, then the layers you have on, the month\'s standing condition in the black bar, each event written into its day, and what to watch underneath. tap any day, event, layer or line to open it.'],
 compare:['☍ synastry & composite','synastry overlays two charts to show where your planets contact theirs, and how each of you lands in the other\'s life. a composite blends both charts into one, the relationship read as its own entity. both need a cast chart for each person.']};
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
    <p class="xp-p"><b>${vibe.split(': ')[1]}.</b> ${read}</p>
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
    <p class="xp-p"><b>${bname(k)}</b> is ${PLANET_MEAN[k]||'a point in the chart'}. in <button class="lk" onclick="explainSign(${si})"><b>${nm}</b></button> it takes on the sign's manner: ${SIGN_READ[nm][0].split(': ')[1]}.</p>
    ${h?`<p class="xp-p">it lives in <button class="lk" onclick="explainHouse(${h})"><b>house ${h}</b></button> — ${HOUSE_MEAN[h-1]}.</p>`:''}
    ${retro?'<p class="xp-p">retrograde at birth: this planet works inward first. its expression arrives later, more considered, and often sharper for it.</p>':''}
    ${asp.length?`<div class="xp-lab">tightest aspects</div>${asp.map(a=>`<button class="nr" onclick="explainAspect('${a.a}','${a.b}','${a.t.n}',${a.orb.toFixed(1)})"><span class="g">${a.t.g}</span><span class="n">${bname(a.a)} ${a.t.n} ${bname(a.b)}</span><span class="w2">${a.orb.toFixed(1)}°</span><span class="c">›</span></button>`).join('')}`:''}
    ${who==='me'?`<button class="btn" onclick="closeSheet();nav('natal')">open my chart ›</button>`:''}`);
}
const ASP_READ={conjunction:'0°, the two planets share one degree and act as a single unit. their topics blend so completely that you rarely get one without the other.',sextile:'60°, two signs of compatible elements in easy contact. it offers cooperation and opportunity, but only pays out when you act on it.',
 square:'90°, two planets in signs of the same mode pulling across each other. it creates friction that forces growth; uncomfortable, productive, and usually where your best work comes from.',trine:'120°, two planets in the same element, flowing without resistance. this is natural talent, so easy you may not notice it, or bother to use it.',opposition:'180°, two planets facing each other across the wheel. you swing between them, often through other people, until you learn to hold both at once.'};
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
      <p class="xp-p">midpoints of both charts — the "us" as its own creature.${rise!=null?` it rises in <b>${SIGNS[rise]}</b>: ${SIGN_READ[SIGNS[rise]][0].split(': ')[1]}.`:''}</p>${rows}`);
  }
}
/* user calendar events — the "+ add to the calendar" sheet */
const ADD_TYPES=[['ritual','✧','working'],['entry','✧','reminder'],['pull','✦','reading'],['cycle','◉','cycle'],['global','☉︎','sky watch']];
function openAdd(dk){
  sheet(`<div class="gb"></div><div class="xp-eb">✧ · add to the calendar · ✧</div><div class="xp-h">something to remember</div>
    <div class="fm">
      <label class="fl"><span>what is it</span><input id="adT" placeholder="a working, a reminder, a date…"></label>
      <label class="fl"><span>when</span><input id="adD" type="date" value="${dk||S.sel||key(new Date())}"></label>
      <div class="fl"><span>what kind</span><div class="fchips" id="adL">${ADD_TYPES.map((t,i)=>`<button type="button" data-l="${t[0]}" class="fchip${i===0?' on':''}" onclick="document.querySelectorAll('#adL button').forEach(x=>x.classList.toggle('on',x===this))">${t[1]} ${t[2]}</button>`).join('')}</div></div>
      <label class="fl"><span>a note · optional</span><textarea id="adN" rows="2" placeholder="for future you"></textarea></label>
    </div>
    <button class="btn" onclick="saveEvent()">put it on the calendar</button>`);
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
    body:JSON.stringify({name:who.name,date:who.date,time:who.time||'',place:who.place||'',lat:who.lat??null,lng:who.lng??null,tzName:who.tzName||null,self:!!self}),
    signal:AbortSignal.timeout(25000)}).catch(e=>{throw new Error(e&&e.name==='TimeoutError'?'the engine took too long. check your connection and try again':'couldn\'t reach the engine. check your connection and try again');});
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
    pending:!ch&&!!p.date&&p.cast!=='failed',
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
  S.people.forEach(p=>{if(p.cast==='casting'&&p.natal)p.cast=null;});
  if(!todo.length)return;
  let me=false;
  for(const [who,self] of todo){
    try{who.natal=await castChart(who,self);if(self)me=true;else who.cast=null;}catch(e){if(!self){who.cast='failed';who.castErr=String(e.message||e).toLowerCase();}}
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
