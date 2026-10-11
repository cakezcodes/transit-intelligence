/* debug: surface JS errors on screen during boot (remove once stable) */
window.addEventListener('error',function(e){
  var d=document.createElement('div');d.style.cssText='position:fixed;bottom:60px;left:8px;right:8px;z-index:9999;background:#FF5A36;color:#fff;padding:10px;font:11px/1.4 monospace;border-radius:4px;max-height:30vh;overflow:auto';
  d.textContent='JS error: '+e.message+' @ '+(e.filename||'').split('/').pop()+':'+e.lineno;
  document.body.appendChild(d);setTimeout(function(){d.remove();},12000);
});
const IMG = /*CARDIMGS*/{};

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
  const l1=`the moon's in <b>${ms} ${GLY[SIGNS.indexOf(ms)]}</b> and she's ${vibe}. ${MOOD[pn]}`;
  const l2=read;
  const l3=vd.active?`heads up — she goes void in about ${vd.hrs}h. anything you launch, send, or swear to in that window tends to just… evaporate. wait it out. ◇`:
    `sun's still cooking in <b>${ss}</b>, so that's the background hum under all of it.`;
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
  {id:'global',n:'global transits',d:'what the sky is doing for everyone',c:'#FF9A3C',on:1,gl:'☉︎'},
  {id:'retro',n:'retrogrades',d:'stations, shadows, the whole mess',c:'#C7B0F5',on:0,gl:'℞'},
  {id:'rulers',n:'house rulers on the move',d:'where your chart ruler is walking today',c:'#7FE0B5',on:0,gl:'⌂'}]},
 {g:'cosmic natal',items:[
  {id:'natal',n:'transits to natal',d:'what\'s actually hitting your placements',c:'#F4CC2E',on:1,gl:'✦'},
  {id:'promise',n:'natal promise windows',d:'when the chart finally pays out what it promised',c:'#F4CC2E',on:0,gl:'✧'},
  {id:'theirs',n:'their transits',d:'what each person in orbit is living through',c:'#C7B0F5',on:0,gl:'☍'},
  {id:'syn',n:'synastry hits',d:'when the sky touches both charts at once',c:'#FF90E8',on:0,gl:'◇'},
  {id:'comp',n:'composite transits',d:'the relationship\'s own chart, activated',c:'#C7B0F5',on:0,gl:'◍'}]},
 {g:'cosmic convergence',items:[
  {id:'prof',n:'annual profections',d:'which house is running your year',c:'#D6EC4F',on:0,gl:'◈'},
  {id:'firdaria',n:'firdaria & timelords',d:'the planet holding the keys right now',c:'#D6EC4F',on:0,gl:'♄︎'},
  {id:'zr',n:'zodiacal releasing',d:'chapters, peaks, and loosings of the bond',c:'#FF5A36',on:0,gl:'⟳'},
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
  accent:0, cursor:new Date(2026,6,14), sel:'2026-07-14', jcursor:new Date(2026,6,14), jfilter:'all'
};
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c);};
const fmt=d=>d.toLocaleDateString('en-us',{month:'short',day:'numeric'}).toLowerCase();
const fmtL=d=>d.toLocaleDateString('en-us',{weekday:'long',month:'long',day:'numeric'}).toLowerCase();

/* ══════════ NAV ══════════ */
const TAB={sky:'sky',cal:'cal',layers:'cal',event:'cal',grim:'grim',lib:'grim',pat:'grim',journal:'cal',orbit:'orbit',person:'orbit',me:'me',natal:'me'};
function nav(id){
  document.querySelectorAll('.v').forEach(v=>v.classList.remove('on'));
  document.getElementById('v-'+id).classList.add('on');
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.v===TAB[id]));
  window.scrollTo(0,0);
  if(id==='sky')renderSky(); if(id==='cal')renderCal(); if(id==='grim')renderGrim();
  if(id==='journal')renderJournal(); if(id==='pat')renderPat(); if(id==='orbit')renderOrbit();
  if(id==='layers')renderLayers(); if(id==='me')renderMe(); if(id==='natal')renderNatal();
}
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
  stars();
}
const swHTML=()=>ACC.map((A,i)=>`<button class="sw${i===S.accent?' on':''}" data-i="${i}" style="--c1:${A.c1};--c2:${A.c2}" onclick="setAcc(${i})"><span class="d"></span><span class="n">${A.n}</span></button>`).join('');
function setMode(m){document.documentElement.dataset.mode=m;document.querySelectorAll('#meMode button,#obMode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));stars();}
function toggleGrad(){const on=document.documentElement.dataset.grad==='on';document.documentElement.dataset.grad=on?'off':'on';document.getElementById('gradTog').classList.toggle('on',!on);}
const TSUB={clean:'all sans, zero ceremony',balanced:'serif titles + quotes only',ceremony:'full book of shadows — stars, glyphs, ✦'};
document.querySelectorAll('#meType button').forEach(b=>b.onclick=()=>{document.documentElement.dataset.type=b.dataset.t;document.querySelectorAll('#meType button').forEach(x=>x.classList.toggle('on',x===b));toast(TSUB[b.dataset.t]);stars();});
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
function renderSky(){
  const d=new Date(); const p=phase(d),pn=phaseName(p),ml=moonLon(d),si=signOf(ml);
  const r=dailyRead(d), vd=voidWindow(d);
  document.getElementById('skyDate').innerHTML=fmtL(d);
  document.getElementById('skyBody').innerHTML=
   `<div class="today"><div class="hl"></div>
      <div class="mn">${moonSVG(p,58)}</div>
      <div><div class="t1">${pn} in ${SIGNS[si]} ${GLY[si]}</div>
        <div class="t2">${Math.round((1-Math.cos(2*Math.PI*p))/2*100)}% illuminated · ${degIn(ml).toFixed(0)}° ${SIGNS[si]}</div>
        <div class="t3">${vd.active?'⊘ void in '+vd.hrs+'h — hold the send':'☉︎ sun in '+SIGNS[signOf(sunLon(d))]}</div></div>
    </div>
    <div class="read">
      <div class="rl">✦ today's read</div>
      <p>${r.l1}</p><p>${r.l2}</p><p>${r.l3}</p>
      <div class="mv"><b>today's move</b>${r.move}</div>
    </div>`;
  const ups=upcoming(d,4);
  document.getElementById('skyUp').innerHTML=ups.map(e=>evRow(e)).join('')||'<div class="card" style="color:var(--dust);font-size:13px">quiet stretch — nothing loud incoming ✧</div>';
  const today=S.entries.filter(e=>e.date===key(d));
  const rit=RIT.find(x=>x.ph.includes(pn));
  document.getElementById('skyDay').innerHTML=
   `<div class="tr"><span class="g">✧</span><div><div class="a">journal prompt</div><div class="b">${prompt(pn,SIGNS[si])}</div></div></div>
    <div class="tr"><span class="g">✧</span><div><div class="a">matched working · ${rit.n}</div><div class="b">${rit.v}</div></div><span class="n">${pn.split(' ')[0]}</span></div>
    <div class="tr" style="cursor:pointer" onclick="openEntry()"><span class="g">+</span><div><div class="a" style="color:var(--deep)">add to today</div><div class="b">${today.length} ${today.length===1?'entry':'entries'} logged</div></div></div>`;
}
const PROMPTS={'new moon':'what are you actually planting — not what sounds good out loud?','waxing crescent':'what would you protect if someone tried to talk you out of it?',
 'first quarter':'where\'s the resistance, and is it a wall or a door?','waxing gibbous':'what needs editing, not abandoning?','full moon':'what can you see now that you couldn\'t two weeks ago?',
 'waning gibbous':'what truth are you circling but not saying?','last quarter':'what have you outgrown but kept out of habit?','waning crescent':'what are you still feeding after it already ended?'};
const prompt=(pn,s)=>PROMPTS[pn];

/* ══════════ EVENTS ENGINE ══════════ */
function evForDate(d){
  const out=[];const k=key(d),p=phase(d),pn=phaseName(p),ml=moonLon(d),si=signOf(ml);
  const pv=phase(new Date(d.getTime()-86400000));
  const cross=(a,b,t)=>(a<t&&b>=t)||(a>b&&(b>=t));
  if(LON.lunation){
    if(pv>.9&&p<.1)out.push({id:'nm-'+k,lay:'lunation',gl:'●',t:`new moon in ${SIGNS[si]}`,s:`${degIn(ml).toFixed(0)}° ${GLY[si]} · the month's seed`,date:k});
    if(pv<.5&&p>=.5)out.push({id:'fm-'+k,lay:'lunation',gl:'○',t:`full moon in ${SIGNS[si]}`,s:`${degIn(ml).toFixed(0)}° ${GLY[si]} · everything gets lit`,date:k});
  }
  if(LON.lunar&&signOf(moonLon(new Date(d.getTime()-86400000)))!==si)
    out.push({id:'ms-'+k,lay:'lunar',gl:'☽︎',t:`moon enters ${SIGNS[si]}`,s:`${MOOD[pn].split('.')[0]} · ${SIGN_READ[SIGNS[si]][0]}`,date:k});
  if(LON.void){const v=voidWindow(d);if(v.active)out.push({id:'v-'+k,lay:'void',gl:'⊘',t:'moon goes void',s:`~${v.hrs}h before she changes signs — don't launch`,date:k});}
  if(LON.natal&&S.me.date){ /* transit to natal: moon conjunct natal sun/moon by sign */
    const nb=parse(S.me.date), nsun=signOf(sunLon(nb)), nmoon=signOf(moonLon(nb));
    if(si===nsun)out.push({id:'tn-'+k,lay:'natal',gl:'✦',t:'moon conjunct your natal sun',s:'the month\'s emotional reset lands on your identity',date:k});
    else if(si===nmoon)out.push({id:'lr-'+k,lay:'lunret',gl:'☾',t:'lunar return',s:'the moon came home — your monthly reboot',date:k});
  }
  if(LON.lunation&&k==='2026-08-12')out.push({id:'ec',lay:'lunation',gl:'✦',t:'total solar eclipse · 21° leo',s:'a door slams and a spotlight turns on in the same second',date:k,big:1});
  if(LON.retro&&k==='2026-07-23')out.push({id:'md',lay:'retro',gl:'℞',t:'mercury stations direct',s:'the fog lifts. send it after.',date:k});
  if(LON.ritual){const r=RIT.find(x=>x.ph.includes(pn));if(r&&(pn==='new moon'||pn==='full moon'))out.push({id:'r-'+k,lay:'ritual',gl:'✧',t:`matched working · ${r.n}`,s:r.v,date:k});}
  if(LON.prof&&d.getDate()===1)out.push({id:'pf-'+k,lay:'prof',gl:'◈',t:'profection check-in',s:'which house is running your year — and who rules it',date:k});
  if(LON.sixmo&&pn==='new moon')out.push({id:'6-'+k,lay:'sixmo',gl:'◐',t:'six-month checkpoint',s:'new moon = plan review. what shipped, what stalled?',date:k});
  S.cal.filter(c=>c.date===k).forEach(c=>{if(LON[c.lay!==undefined?c.lay:'entry'])out.push({...c,gl:c.gl||'✧',lay:c.lay||'ritual'});});
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

let CV='dots';S.notes={};
const ccDot=c=>`<i class="cc-dot" style="background:${c}"></i>`;
const lc=e=>(layMeta(e.lay)||{c:'var(--c-sky)'}).c;
const layGroup=id=>{for(const g of LAYERS)if(g.items.some(i=>i.id===id))return g.g.replace(/^(the|your) /,'');return'sky';};
const lunOf=d=>{const p=phase(d),pv=phase(new Date(d.getTime()-864e5));return pv>.9&&p<.1?'●':pv<.5&&p>=.5?'○':'';};
const CC_LEG_GROUPS=[
 {n:'moon',ids:['lunar','lunation','void','lunret','cycle'],c:'#8FD0F2'},
 {n:'sky',ids:['global','retro','rulers'],c:'#FF9A3C'},
 {n:'natal',ids:['natal','promise','theirs','syn','comp'],c:'#F4CC2E'},
 {n:'convergence',ids:['prof','firdaria','zr','sixmo'],c:'#D6EC4F'},
 {n:'divination',ids:['pull','entry'],c:'#C7B0F5'},
 {n:'ritual',ids:['ritual','sex'],c:'#FF5A36'}
];
document.querySelectorAll('#ccView button').forEach(b=>b.onclick=()=>{CV=b.dataset.v;document.querySelectorAll('#ccView button').forEach(x=>x.classList.toggle('on',x===b));renderCal();});
function ccToday(){const t=new Date();S.cursor=new Date(t.getFullYear(),t.getMonth(),1);S.sel=key(t);renderCal();}
/* ══════════ CALENDAR VIEW ══════════ */
function renderCal(){
  const c=S.cursor,y=c.getFullYear(),m=c.getMonth(),dim=new Date(y,m+1,0).getDate(),tk=key(new Date());
  const D=[];for(let dd=1;dd<=dim;dd++){const d=new Date(y,m,dd),ev=evForDate(d);D.push({d,dd,k:key(d),ev,lun:lunOf(d),flag:ev.some(e=>e.big)||ev.length>=3});}
  const all=D.flatMap(x=>x.ev),nf=D.filter(x=>x.flag).length,grp={};
  all.forEach(e=>{const g=layGroup(e.lay);grp[g]=(grp[g]||0)+1;});
  const lonN=Object.values(LON).filter(Boolean).length,layN=Object.keys(LON).length;
  document.getElementById('ccMeta').innerHTML=`porphyry · ${S.me.place||'location pending'}<br>${lonN} of ${layN} layers on`;
  const me=S.me;let nat;
  if(me.date){const nb=parse(me.date),su=signOf(sunLon(nb)),mo=signOf(moonLon(nb));
    nat=`☉︎ ${SIGNS[su]} ${GLY[su]} · ☽︎ ${SIGNS[mo]} ${GLY[mo]}${me.time?' · born '+me.time:''}${me.place?' · '+me.place:''}`;}
  else nat='natal chart not cast · <b>add birth data ›</b> to see transits to natal';
  document.getElementById('ccNatal').innerHTML=nat;
  document.getElementById('mTitle').innerHTML=`<em>${c.toLocaleDateString('en-us',{month:'long'})}</em> ${y}`;
  document.getElementById('ccStats').innerHTML=`${all.length} ${all.length===1?'entry':'entries'} · ${nf} flagged<br>${Object.entries(grp).map(([g,n])=>g+' '+n).join(' · ')||'a quiet month'}`;
  const s0=signOf(sunLon(D[0].d)),ing=D.find(x=>signOf(sunLon(x.d))!==s0);
  const luns=D.filter(x=>x.lun).map(x=>`${x.lun} ${x.lun==='●'?'nm':'fm'} ${x.dd}`);
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
      const body=CV==='words'?x.ev.slice(0,3).map(e=>`<span class="cc-ev">${ccDot(lc(e))}<span>${e.t}</span></span>`).join('')
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
  document.getElementById('dSelLab').innerHTML=`${fmtL(sd)}<span>${phaseName(p)} · ${GLY[si]} ${SIGNS[si]}</span>`;
  document.getElementById('dSel').innerHTML=ev.length?ev.map(e=>evRow(e)).join('')
    :`<div class="card" style="font-size:13px;color:var(--dust)">nothing on the books. the sky's quiet — ${MOOD[phaseName(p)].toLowerCase()}</div>`;
  const nt=document.getElementById('ccNote');if(document.activeElement!==nt)nt.value=S.notes[S.sel]||'';
  nt.placeholder=`what happened on ${fmt(sd)}? the record keeps it.`;
  document.getElementById('ccNoteDay').textContent=fmt(sd);
  const W=[];
  if(ing)W.push({k:ing.k,d:ing.d,c:'var(--c-sky)',t:`sun enters ${SIGNS[(s0+1)%12]} ${GLY[(s0+1)%12]}`,s:'the season turns'});
  D.forEach(x=>x.ev.forEach(e=>{if(e.big||['lunation','retro','natal','lunret','zr','promise'].includes(e.lay))W.push({k:x.k,d:x.d,id:e.id,c:lc(e),t:e.t,s:e.s});}));
  D.filter(x=>x.flag&&!W.some(w=>w.k===x.k)).forEach(x=>W.push({k:x.k,d:x.d,c:'var(--oxblood)',t:`${x.ev.length} things stack up`,s:x.ev.slice(0,3).map(e=>e.t).join(' · ')}));
  W.sort((a,b)=>a.d-b.d);
  document.getElementById('ccWatch').innerHTML=W.length?W.slice(0,6).map(w=>`<button class="cc-wi" onclick="${w.id?`openEv('${w.k}','${w.id}')`:`pickDay('${w.k}')`}">
    <span class="cc-wd">${fmt(w.d)}</span><span><span class="cc-wt">${ccDot(w.c)}${w.t}</span><span class="cc-ws">${w.s}</span></span></button>`).join('')
    :'<div class="cc-ws" style="padding:8px 0">nothing loud this month with the layers you have on.</div>';
  document.getElementById('ccFootL').textContent=`${me.name||'you'} · master event list`;
  document.getElementById('ccFootR').textContent=`sheet ${m+1} of 12`;
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
function openEv(dk,id){
  const d=parse(dk), ev=evForDate(d).find(e=>e.id===id)||{t:'the sky',s:'',lay:'global',gl:'☉︎'};
  const p=phase(d),pn=phaseName(p),si=signOf(moonLon(d));
  const rit=RIT.find(x=>x.ph.includes(pn))||RIT[0];
  const r=dailyRead(d);
  document.getElementById('evBody').innerHTML=
   `<div class="eb"><span class="cer">✧ · </span>${(layMeta(ev.lay)||{n:'the sky'}).n}<span class="cer"> · ✧</span></div>
    <div class="h1"><em>${ev.t.split(' ')[0]}</em> ${ev.t.split(' ').slice(1).join(' ')}</div>
    <div class="h1s">${fmtL(d)} · ${pn} in <b>${SIGNS[si]} ${GLY[si]}</b></div>
    <div class="pnl"><div class="rl cap" style="font-size:9.5px;color:var(--deep);font-weight:600">✦ the astrology first</div>
      <p style="font-size:14px;margin-top:9px">${r.l1}</p>
      <p style="font-size:14px;margin-top:8px;color:var(--dust)">${r.l2}</p></div>
    <div class="lab">work with this sky</div>
    <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✧ working</b>
      <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.n}</div>
      <div style="font-size:12.5px;color:var(--dust)">${rit.v}</div>
      <button class="btn g" onclick="nav('lib');setShelf('work');setTimeout(()=>jumpRit('${rit.n}'),80)">open the working ›</button></div>
    <div class="card"><b class="cap" style="font-size:9px;color:var(--deep)">✦ spread</b>
      <div style="font-size:16px;font-weight:700;margin-top:4px">${rit.pair}</div></div>
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
      <div><div style="font-size:18px;font-weight:700">${m.name||'you'}</div><div style="font-size:12px;color:var(--dust)">${m.place||'—'} · ${m.date}</div></div></div>
    ${big3(m)}<button class="btn g" onclick="nav('natal')">open my chart ›</button>`
   :`<div class="empty"><div class="eg">☉︎</div><div class="et">no chart yet</div>
      <div class="ed">add your birth data and every transit in this app starts talking to <i>you</i> specifically.</div>
      <button class="btn" onclick="obReplay()">cast my chart</button></div>`;
  document.getElementById('orbitList').innerHTML= S.people.length? S.people.map((p,i)=>
   `<button class="row" onclick="openPerson(${i})"><span class="disc" style="flex:0 0 40px;height:40px;font-size:16px">${(p.name||'?')[0]}</span>
     <span><span class="t">${p.name}</span><div class="s">${p.date?`☉︎ ${SIGNS[signOf(sunLon(parse(p.date)))]} · ☽︎ ${SIGNS[signOf(moonLon(parse(p.date)))]}`:'birth data pending'}</div></span><span class="c">›</span></button>`).join('')
   :`<div class="card"><div class="empty" style="padding:20px 8px"><div class="eg">☍</div><div class="et">orbit's empty</div>
      <div class="ed">add the people whose charts you actually care about. their transits become a calendar layer you can toggle on.</div></div></div>`;
}
function big3(p){
  if(!p.date)return'';
  const d=parse(p.date),ss=signOf(sunLon(d)),ms=signOf(moonLon(d));
  return `<div class="b3"><div><div class="g">☉︎</div><div class="k">sun</div><div class="v">${SIGNS[ss]}</div></div>
    <div><div class="g">☽︎</div><div class="k">moon</div><div class="v">${SIGNS[ms]}</div></div>
    <div><div class="g">↑</div><div class="k">rising</div><div class="v">${p.time?SIGNS[(ss+Math.floor((parseInt(p.time)||12)/2))%12]:'add time'}</div></div></div>`;
}
function openPerson(i){
  if(i===undefined){
    sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">☍ · add to orbit · ☍</div>
     <div class="sf" style="font-size:24px;text-align:center;margin-top:4px">someone new</div>
     <div class="ob-f" style="margin-top:14px">
       <input id="pN" placeholder="name"><input id="pD" type="date"><input id="pT" type="time"><input id="pP" placeholder="birth place">
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
    <div class="pnl">${big3(p)}</div>
    <div class="lab">their sky today</div>
    <div class="card">${p.date?theirSky(p):'<div style="font-size:13px;color:var(--dust)">add their birth date to read their transits</div>'}</div>
    <div class="lab">entanglement</div>
    <button class="row" onclick="toast('synastry — needs your chart + theirs ◇')"><span class="ic">◇</span><span><span class="t">synastry</span><div class="s">how your charts touch</div></span><span class="c">›</span></button>
    <button class="row" onclick="toast('composite — the relationship\\'s own chart ◍')"><span class="ic">◍</span><span><span class="t">composite</span><div class="s">the relationship as its own being</div></span><span class="c">›</span></button>
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
  const d=new Date(),nb=parse(p.date),si=signOf(moonLon(d));
  const nsun=signOf(sunLon(nb)),nmoon=signOf(moonLon(nb));
  const hit=si===nsun?'the moon is sitting on their sun today — they\'re feeling extremely themselves. handle accordingly.'
    :si===nmoon?'lunar return for them. they\'re raw, resetting, and probably won\'t admit it.'
    :`moon in ${SIGNS[si]} for them too — ${SIGN_READ[SIGNS[si]][1]}`;
  return `<div class="tr"><span class="g">☽︎</span><div><div class="a">moon in ${SIGNS[si]} ${GLY[si]}</div><div class="b">${hit}</div></div></div>`;
}
function savePerson(){
  const n=document.getElementById('pN').value.trim();if(!n)return toast('name them first ☍');
  S.people.push({name:n,date:document.getElementById('pD').value,time:document.getElementById('pT').value,place:document.getElementById('pP').value,rel:document.getElementById('pR').value});
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
    :'<div class="card" style="flex:1;font-size:12.5px;color:var(--dust)">log a few pulls and the repeats show up here — with the actual card art ✦</div>';
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
function openEntry(dk,who){
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
      <textarea id="enB" rows="4" placeholder="${who?'what happened with '+who+'?':'what happened, what you noticed, what the sky was doing…'}"></textarea>
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
      <div><div class="d">${fmt(parse(e.date))} · ${e.type}</div></div>
      <span class="sky">${e.sky||''}</span></div>
    ${e.title?`<div class="tt">${e.title}</div>`:''}
    ${e.body?`<div class="bd">${e.body}</div>`:''}
    ${e.cards&&e.cards.length?`<div class="cds">${e.cards.map(c=>`<img src="${IMG[c.k]}" class="${c.rev?'rv':''}" title="${byKey(c.k).n}">`).join('')}</div>`:''}
    ${e.photos&&e.photos.length?`<div class="ph">${e.photos.map(p=>`<img src="${p}">`).join('')}</div>`:''}</div>`;
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
      <span class="pips" style="position:relative">${[...new Set(es.map(e=>e.type))].slice(0,4).map(t=>`<span class="pip" style="background:var(--moon);opacity:.4"></span>`).join('')}</span></button>`;
  }
  document.getElementById('jGrid').innerHTML=h;
  const F=['all','note','pull','ritual','cycle','sex'];
  document.getElementById('jFilter').innerHTML=F.map(f=>`<button class="chip${S.jfilter===f?' on':''}" onclick="S.jfilter='${f}';renderJournal()">${f==='all'?'all':(EG[f]+' '+f)}</button>`).join('');
  const list=S.entries.filter(e=>S.jfilter==='all'||e.type===S.jfilter);
  document.getElementById('jLab').textContent=`${list.length} ${list.length===1?'entry':'entries'}`;
  document.getElementById('jList').innerHTML=list.length?list.map(entHTML).join('')
    :`<div class="card"><div class="empty"><div class="eg">✧</div><div class="et">the book is empty</div>
       <div class="ed">every pull, working, note, and photo you log lands here — stamped with the sky it happened under. that's what makes it usable data later.</div>
       <button class="btn" onclick="openEntry()">write the first one</button></div></div>`;
}
function jShift(n){S.jcursor=new Date(S.jcursor.getFullYear(),S.jcursor.getMonth()+n,1);renderJournal();}
function jPick(k){const es=S.entries.filter(e=>e.date===k);if(!es.length)return openEntry(k);
  sheet(`<div class="gb"></div><div class="cap" style="font-size:9.5px;color:var(--deep);text-align:center">✧ · ${fmt(parse(k))} · ✧</div>
    <div class="sf" style="font-size:22px;text-align:center;margin-top:3px">${es.length} ${es.length===1?'entry':'entries'}</div>
    ${es.map(entHTML).join('')}<button class="btn g" onclick="closeSheet();openEntry('${k}')">+ add another</button>`);}

/* ══════════ NATAL ══════════ */
const PLAN=[['☉︎','sun',0],['☽︎','moon',1],['☿︎','mercury',2],['♀︎','venus',3],['♂︎','mars',4],['♃︎','jupiter',5],['♄︎','saturn',6]];
function renderNatal(){
  if(!S.me.date){document.getElementById('natalSub').textContent='no chart yet';
    document.getElementById('wheelWrap').innerHTML='<div class="empty"><div class="eg">☉︎</div><div class="et">cast your chart first</div><div class="ed">the wheel needs a date, a time, and a place.</div><button class="btn" onclick="obReplay()">cast it</button></div>';
    document.getElementById('natalRows').innerHTML='';document.getElementById('natalPromise').textContent='';return;}
  const d=parse(S.me.date), ss=signOf(sunLon(d)), ms=signOf(moonLon(d));
  document.getElementById('natalSub').innerHTML=`${S.me.date} · ${S.me.time||'—'} · ${S.me.place||'—'}`;
  /* wheel */
  /* wheel - styled after astrocake chart prints */
  const R=140,C=160,IR=R-28,HR=R-74;
  const ascLon=S.me.asc||0;
  const rot=a=>(a-ascLon-180)*Math.PI/180;
  const px=(a,r)=>C+Math.cos(rot(a))*r, py=(a,r)=>C+Math.sin(rot(a))*r;
  let w=`<svg class="wheel" width="320" height="320" viewBox="0 0 320 320" style="max-width:100%">`;
  w+=`<circle cx="${C}" cy="${C}" r="${R+8}" fill="none" stroke="var(--line)" stroke-width=".3" stroke-dasharray="2,3"/>`;
  w+=`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="var(--line)" stroke-width="1.5"/>`;
  w+=`<circle cx="${C}" cy="${C}" r="${IR}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
  w+=`<circle cx="${C}" cy="${C}" r="${HR}" fill="none" stroke="var(--line)" stroke-width=".5"/>`;
  w+=`<circle cx="${C}" cy="${C}" r="22" fill="none" stroke="var(--line)" stroke-width=".5"/>`;
  for(let i=0;i<12;i++){
    const a1=i*30,am=i*30+15;
    w+=`<line x1="${px(a1,IR)}" y1="${py(a1,IR)}" x2="${px(a1,R)}" y2="${py(a1,R)}" stroke="var(--line)" stroke-width=".8"/>`;
    w+=`<text x="${px(am,(IR+R)/2)}" y="${py(am,(IR+R)/2)+4}" text-anchor="middle" font-size="13" fill="var(--dust)">${GLY[i]}</text>`;
  }
  const houses=(S.me.houses||[0,30,60,90,120,150,180,210,240,270,300,330].map(h=>(ascLon+180+h)%360));
  for(let i=0;i<12;i++){
    const h=houses[i],isAng=(i%3===0);
    w+=`<line x1="${px(h,HR)}" y1="${py(h,IR)}" x2="${px(h,IR)}" y2="${py(h,IR)}" stroke="var(--line)" stroke-width="${isAng?'1.5':'.5'}"/>`;
    const hm=((houses[i]+((houses[(i+1)%12]-houses[i]+360)%360)/2))%360;
    w+=`<text x="${px(hm,(HR+IR)/2)}" y="${py(hm,(HR+IR)/2)+4}" text-anchor="middle" font-size="9" fill="var(--faint)">${i+1}</text>`;
  }
  w+=`<line x1="${px(houses[0],R+12)}" y1="${py(houses[0],R+12)}" x2="${px(houses[6],R+12)}" y2="${py(houses[6],R+12)}" stroke="var(--line)" stroke-width="1.5"/>`;
  const labels=[{i:0,t:'ASC',a:'end'},{i:6,t:'DSC',a:'start'}];
  labels.forEach(l=>{w+=`<text x="${px(houses[l.i],R+18)}" y="${py(houses[l.i],R+18)+3}" text-anchor="${l.a}" font-size="7" font-weight="700" fill="var(--moon)" letter-spacing=".08em">${l.t}</text>`;});
  w+=`<text x="${C}" y="${Math.min(py(houses[9],R+16),C-R-4)}" text-anchor="middle" font-size="7" font-weight="700" fill="var(--moon)">MC</text>`;
  w+=`<text x="${C}" y="${Math.max(py(houses[3],R+16),C+R+10)}" text-anchor="middle" font-size="7" font-weight="700" fill="var(--moon)">IC</text>`;
  const sLon=sunLon(d),mLon=moonLon(d);
  const planets=[{gl:'\u2609',lon:sLon},{gl:'\u263D',lon:mLon}];
  if(S.me.planets)planets.push(...S.me.planets);
  planets.forEach(p=>{
    w+=`<text x="${px(p.lon,IR-18)}" y="${py(p.lon,IR-18)+5}" text-anchor="middle" font-size="12" fill="var(--moon)">${p.gl}</text>`;
    w+=`<line x1="${px(p.lon,IR-1)}" y1="${py(p.lon,IR-1)}" x2="${px(p.lon,IR-5)}" y2="${py(p.lon,IR-5)}" stroke="var(--moon)" stroke-width="1"/>`;
    w+=`<text x="${px(p.lon,IR-32)}" y="${py(p.lon,IR-32)+3}" text-anchor="middle" font-size="7" fill="var(--faint)">${Math.floor(p.lon%30)}\u00B0</text>`;
  });
  w+=`</svg>`;
  document.getElementById('wheelWrap').innerHTML=w;

  document.getElementById('natalRows').innerHTML=
   `<div class="nr"><span class="g">☉︎</span><span class="n">sun</span><span class="w2">${SIGNS[ss]} ${GLY[ss]} · ${degIn(sunLon(d)).toFixed(0)}°</span></div>
    <div class="nr"><span class="g">☽︎</span><span class="n">moon</span><span class="w2">${SIGNS[ms]} ${GLY[ms]} · ${degIn(moonLon(d)).toFixed(0)}°</span></div>
    <div class="nr"><span class="g">↑</span><span class="n">rising</span><span class="w2">${S.me.time?'calculating from '+S.me.time:'add exact birth time'}</span></div>
    <div class="nr"><span class="g">◈</span><span class="n">house system</span><span class="w2">porphyry</span></div>`;
  document.getElementById('natalPromise').innerHTML=
   `your sun's in <b>${SIGNS[ss]}</b> and your moon's in <b>${SIGNS[ms]}</b> — so the thing you're built to become and the thing you actually need are ${ss===ms?'the same department, which is rare and means when you\'re on, you\'re fully on, and when you\'re off, there\'s nowhere to hide':'running on different frequencies. that\'s not a flaw, that\'s the whole tension the chart is asking you to metabolize'}. ${SIGN_READ[SIGNS[ms]][1]}`;
}

/* ══════════ ME ══════════ */
function renderMe(){
  document.getElementById('meSw').innerHTML=swHTML();
  document.getElementById('meName').innerHTML='<em>'+(S.me.name||'you')+'</em>';
  document.getElementById('meSub').textContent=S.me.date?`${S.me.date} · ${S.me.time||'—'} · ${S.me.place||'—'}`:'no chart cast yet';
  if(S.me.date){const d=parse(S.me.date);
    document.getElementById('meBig3').textContent=`☉︎ ${SIGNS[signOf(sunLon(d))]} · ☽︎ ${SIGNS[signOf(moonLon(d))]}`;}
}
function exportBook(){
  const blob=new Blob([JSON.stringify({me:S.me,people:S.people,entries:S.entries,cal:S.cal},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='the-book.json';a.click();
  toast('↓ exported. it\'s yours forever.');
}

/* ══════════ SHEET ══════════ */
function sheet(h){document.getElementById('sht').innerHTML=h;document.getElementById('scr').classList.add('on');document.getElementById('sht').classList.add('on');}
function closeSheet(){document.getElementById('scr').classList.remove('on');document.getElementById('sht').classList.remove('on');}

/* ══════════ ONBOARDING ══════════ */
const LANES=['transits','tarot','rituals','synastry','journaling','moon tracking','cycle','shadow work'];
let obS=0;const OBL=["let's begin","next ✧","next ✧","read my stars ✦"];
/* ══════ CITY AUTOCOMPLETE ══════ */
const CITIES=[
 {n:'New York, NY',lat:40.71,lng:-74.01,tz:-5},{n:'Los Angeles, CA',lat:34.05,lng:-118.24,tz:-8},
 {n:'Chicago, IL',lat:41.88,lng:-87.63,tz:-6},{n:'Houston, TX',lat:29.76,lng:-95.37,tz:-6},
 {n:'Phoenix, AZ',lat:33.45,lng:-112.07,tz:-7},{n:'Philadelphia, PA',lat:39.95,lng:-75.17,tz:-5},
 {n:'San Antonio, TX',lat:29.42,lng:-98.49,tz:-6},{n:'San Diego, CA',lat:32.72,lng:-117.16,tz:-8},
 {n:'Dallas, TX',lat:32.78,lng:-96.80,tz:-6},{n:'Austin, TX',lat:30.27,lng:-97.74,tz:-6},
 {n:'Jacksonville, FL',lat:30.33,lng:-81.66,tz:-5},{n:'San Francisco, CA',lat:37.77,lng:-122.42,tz:-8},
 {n:'Indianapolis, IN',lat:39.77,lng:-86.16,tz:-5},{n:'Columbus, OH',lat:39.96,lng:-82.99,tz:-5},
 {n:'Charlotte, NC',lat:35.23,lng:-80.84,tz:-5},{n:'Seattle, WA',lat:47.61,lng:-122.33,tz:-8},
 {n:'Denver, CO',lat:39.74,lng:-104.99,tz:-7},{n:'Nashville, TN',lat:36.16,lng:-86.78,tz:-6},
 {n:'Louisville, KY',lat:38.25,lng:-85.76,tz:-5},{n:'Portland, OR',lat:45.51,lng:-122.68,tz:-8},
 {n:'Las Vegas, NV',lat:36.17,lng:-115.14,tz:-8},{n:'Memphis, TN',lat:35.15,lng:-90.05,tz:-6},
 {n:'Baltimore, MD',lat:39.29,lng:-76.61,tz:-5},{n:'Milwaukee, WI',lat:43.04,lng:-87.91,tz:-6},
 {n:'Albuquerque, NM',lat:35.08,lng:-106.65,tz:-7},{n:'Tucson, AZ',lat:32.22,lng:-110.97,tz:-7},
 {n:'Fresno, CA',lat:36.74,lng:-119.77,tz:-8},{n:'Sacramento, CA',lat:38.58,lng:-121.49,tz:-8},
 {n:'Atlanta, GA',lat:33.75,lng:-84.39,tz:-5},{n:'Miami, FL',lat:25.76,lng:-80.19,tz:-5},
 {n:'New Orleans, LA',lat:29.95,lng:-90.07,tz:-6},{n:'Detroit, MI',lat:42.33,lng:-83.05,tz:-5},
 {n:'Minneapolis, MN',lat:44.98,lng:-93.27,tz:-6},{n:'Boston, MA',lat:42.36,lng:-71.06,tz:-5},
 {n:'Jeffersonville, IN',lat:38.28,lng:-85.74,tz:-5},{n:'New Albany, IN',lat:38.29,lng:-85.82,tz:-5},
 {n:'Lexington, KY',lat:38.04,lng:-84.50,tz:-5},{n:'Cincinnati, OH',lat:39.10,lng:-84.51,tz:-5},
 {n:'St. Louis, MO',lat:38.63,lng:-90.20,tz:-6},{n:'Kansas City, MO',lat:39.10,lng:-94.58,tz:-6},
 {n:'Pittsburgh, PA',lat:40.44,lng:-80.00,tz:-5},{n:'Tampa, FL',lat:27.95,lng:-82.46,tz:-5},
 {n:'Raleigh, NC',lat:35.78,lng:-78.64,tz:-5},{n:'Omaha, NE',lat:41.26,lng:-95.94,tz:-6},
 {n:'Cleveland, OH',lat:41.50,lng:-81.69,tz:-5},{n:'Virginia Beach, VA',lat:36.85,lng:-75.98,tz:-5},
 {n:'Oakland, CA',lat:37.80,lng:-122.27,tz:-8},{n:'Tulsa, OK',lat:36.15,lng:-95.99,tz:-6},
 {n:'Honolulu, HI',lat:21.31,lng:-157.86,tz:-10},{n:'London, UK',lat:51.51,lng:-0.13,tz:0},
 {n:'Toronto, ON',lat:43.65,lng:-79.38,tz:-5},{n:'Berlin, Germany',lat:52.52,lng:13.41,tz:1},
 {n:'Paris, France',lat:48.86,lng:2.35,tz:1},{n:'Tokyo, Japan',lat:35.68,lng:139.69,tz:9},
 {n:'Sydney, Australia',lat:-33.87,lng:151.21,tz:10},{n:'Mexico City, Mexico',lat:19.43,lng:-99.13,tz:-6}
];
let obCity=null;
function placeSearch(q){
  const el=document.getElementById('obPlaceList');
  if(q.length<2){el.classList.remove('on');return;}
  const ql=q.toLowerCase();
  const hits=CITIES.filter(c=>c.n.toLowerCase().includes(ql)).slice(0,6);
  if(!hits.length){el.classList.remove('on');return;}
  el.innerHTML=hits.map(c=>`<button onclick="pickCity('${c.n}',${c.lat},${c.lng},${c.tz})">${c.n}</button>`).join('');
  el.classList.add('on');
}
function pickCity(n,lat,lng,tz){
  document.getElementById('obPlace').value=n;
  document.getElementById('obPlaceList').classList.remove('on');
  obCity={n,lat,lng,tz};
}

function obR(){
  document.querySelectorAll('.ob-s').forEach(s=>s.classList.toggle('on',+s.dataset.s===obS));
  document.getElementById('obDots').innerHTML=[0,1,2,3].map(i=>`<span class="dt${i===obS?' on':''}"></span>`).join('');
  document.getElementById('obNext').textContent=OBL[obS];
}
try{
document.getElementById('obLanes').innerHTML=LANES.map(l=>`<button class="chip${S.me.lanes.includes(l)?' on':''}" onclick="this.classList.toggle('on')">${l}</button>`).join('');
document.getElementById('obSw').innerHTML=swHTML();
document.getElementById('obNext').onclick=()=>{
  if(obS===0){S.me.name=document.getElementById('obName').value.trim()||'you';}
  if(obS===3){
    S.me.date=document.getElementById('obDate').value;
    S.me.time=document.getElementById('obTime').value;
    S.me.place=document.getElementById('obPlace').value.trim();
  }
  if(obS<3){obS++;obR();}else obDone();
};
}catch(e){console.error('ob init:',e);}
function obDone(){
  /* save birth data from onboarding */
  const n=document.getElementById('obName').value;
  const d=document.getElementById('obDate').value;
  const t=document.getElementById('obTime').value;
  const p=document.getElementById('obPlace').value;
  const e=document.getElementById('obEmail');
  if(n)S.me.name=n;
  if(e&&e.value)S.me.email=e.value;
  if(d)S.me.date=d;
  if(t)S.me.time=t;
  if(p)S.me.place=p;
  if(obCity){S.me.lat=obCity.lat;S.me.lng=obCity.lng;S.me.tz=obCity.tz;}
  S.onboarded=true;
  if(window.tiCloud){window.tiCloud.saveProfile(S.me).catch(()=>{});tiFlush();}
  /* calculate approximate ASC from time + place */
  if(d&&t&&obCity){
    const dt=new Date(d+'T'+t);
    const lst=(dt.getHours()+(dt.getMinutes()/60)+obCity.lng/15+obCity.tz)%24;
    S.me.asc=((lst/24)*360+obCity.lat*0.5)%360;
  }
  const ob=document.getElementById('ob');ob.classList.add('off');
  setTimeout(()=>ob.classList.remove('on'),520);
  /* show chart loading if birth data was entered */
  if(d){
    const cl=document.getElementById('chartLoad');cl.classList.add('on');
    const msgs=['reading the ephemeris','finding your rising','drawing the houses','placing the planets','checking the aspects','almost there'];
    let mi=0;
    const iv=setInterval(()=>{mi++;if(mi<msgs.length)document.getElementById('clTxt').textContent=msgs[mi];},500);
    setTimeout(()=>{
      clearInterval(iv);
      cl.classList.add('off');
      setTimeout(()=>{cl.classList.remove('on','off');},400);
      renderSky();renderCal();renderGrim();renderJournal();renderOrbit();renderNatal();renderMe();
      toast('welcome in ✦ the sky\'s been waiting');
    },3200);
  } else {
    renderSky();renderCal();renderGrim();renderJournal();renderOrbit();renderMe();
    toast('welcome in ✦ the sky\'s been waiting');
  }
}
function obReplay(){obS=0;obR();const ob=document.getElementById('ob');ob.classList.remove('off');ob.classList.add('on');}

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
  const _run=[['stars',stars],['obR',obR],['renderSky',renderSky],['renderCal',renderCal],['renderShelf',renderShelf],['renderJournal',renderJournal],['renderGrim',renderGrim],['renderOrbit',renderOrbit],['renderMe',renderMe]];
  for(const [n,fn] of _run){try{fn();}catch(e){console.error('tiBoot crash in '+n+':',e);}}
  try{healTz();}catch(e){console.error('healTz:',e);}
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
/* next injects these scripts after the page 'load' event has already fired,
   so the splash runs by explicit call from tiBoot, not a load listener */
function tiSplash(){
  /* sparkle swipe on INTELLIGENCE */
  setTimeout(()=>{const sw=document.getElementById('spSwipe');if(sw)sw.classList.add('glow');},1400);
  const returning=S.onboarded;
  if(returning){
    /* returning user: brand splash → sky-aware greeting toast → straight into the app */
    const g=greetLine();
    setTimeout(()=>{document.getElementById('splash').classList.add('off');},1800);
    setTimeout(()=>{toast(g[0]+' '+g[1]);},2200);
  } else {
    /* new user: brand splash → onboarding */
    setTimeout(()=>{document.getElementById('ob').classList.add('on');},2400);
    setTimeout(()=>{document.getElementById('splash').classList.add('off');},2900);
  }
}
