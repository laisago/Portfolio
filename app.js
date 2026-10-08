'use strict';
const one=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const projectMenu=one('.project-menu');
function closeMenu(restoreFocus=false){if(!projectMenu)return;projectMenu.open=false;if(restoreFocus)one('summary',projectMenu)?.focus()}
if(projectMenu){
 all('a',projectMenu).forEach(link=>link.addEventListener('click',()=>closeMenu()));
 document.addEventListener('click',event=>{if(!projectMenu.contains(event.target))closeMenu()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&projectMenu.open){event.preventDefault();closeMenu(true)}});
}
// Account for the actual header height when navigating on any screen size.
const header=one('.site-header');
function updateHeader(){if(header)document.documentElement.style.setProperty('--header-height',header.offsetHeight+'px')}
updateHeader();if(typeof ResizeObserver!=='undefined'&&header)new ResizeObserver(updateHeader).observe(header);
// A slower eased journey to sections, with manual scrolling always taking priority.
let navigationFrame=0;
const navigationMotion=matchMedia('(prefers-reduced-motion: reduce)');
function cancelNavigation(){cancelAnimationFrame(navigationFrame);navigationFrame=0;document.documentElement.classList.remove('is-programmatic-scroll')}
function navigateToSection(target,slow=false){
 cancelNavigation();updateHeader();
 const start=window.scrollY;
 const destination=Math.max(0,Math.min(document.documentElement.scrollHeight-window.innerHeight,start+target.getBoundingClientRect().top-(header?.offsetHeight||0)-24));
 const distance=destination-start;
 const finish=()=>{cancelNavigation();target.setAttribute('tabindex','-1');target.focus({preventScroll:true})};
 document.documentElement.classList.add('is-programmatic-scroll');
 if(navigationMotion.matches||Math.abs(distance)<2){window.scrollTo({top:destination,behavior:'instant'});finish();return}
 const duration=slow?Math.min(6500,Math.max(3200,Math.sqrt(Math.abs(distance))*56)):Math.min(3800,Math.max(1600,Math.sqrt(Math.abs(distance))*32));
 const began=performance.now();
 function step(now){
  const progress=Math.min(1,(now-began)/duration);
  const eased=.5-.5*Math.cos(Math.PI*progress);
  window.scrollTo({top:start+distance*eased,behavior:'instant'});
  if(progress<1)navigationFrame=requestAnimationFrame(step);else finish();
 }
 navigationFrame=requestAnimationFrame(step);
}
all('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const target=document.getElementById(link.getAttribute('href').slice(1));
 if(!target)return;
 event.preventDefault();closeMenu();
 if(location.hash!==link.hash)history.pushState(null,'',link.hash);
 navigateToSection(target,Boolean(link.closest('.project-menu')));
}));
['wheel','touchstart','pointerdown'].forEach(type=>window.addEventListener(type,cancelNavigation,{passive:true}));
window.addEventListener('keydown',event=>{if(['Escape','Tab','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))cancelNavigation()});
if(navigationMotion.addEventListener)navigationMotion.addEventListener('change',()=>{if(navigationMotion.matches)cancelNavigation()});
const backTop=one('.back-top');if(backTop)backTop.addEventListener('click',()=>{const target=one('#inicio');if(target){history.replaceState(null,'','#inicio');navigateToSection(target)}});
// Resize complete fixed-size figures while editorial text remains fluid.
function fitGraphic(shell){const figure=one('[data-graphic-width]',shell);if(!figure)return;const width=Number(figure.dataset.graphicWidth),height=Number(figure.dataset.graphicHeight);const available=shell.parentElement.clientWidth;const scale=Math.min(1,available/width);shell.style.width=Math.min(available,width)+'px';shell.style.height=height*scale+'px';figure.style.width=width+'px';figure.style.height=height+'px';figure.style.transform=scale<1?'scale('+scale+')':'';}
all('.graphic-shell').forEach(shell=>{fitGraphic(shell);if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>fitGraphic(shell)).observe(shell.parentElement)});
// Asset mapping uses stable keys; the uploaded ZIP can replace the originals later.
function loadAsset(img,path){img.onload=()=>{img.classList.remove('pending-image');img.parentElement.classList.add('asset-ready');img.parentElement.classList.remove('asset-missing')};img.onerror=()=>{img.onload=null;img.onerror=null;img.src='assets/placeholder.svg';img.classList.add('pending-image');img.parentElement.classList.remove('asset-ready');img.parentElement.classList.add('asset-missing')};img.src=path}
fetch('asset-map.json').then(response=>response.ok?response.json():{}).then(mapping=>{all('img[data-asset-key]').forEach(img=>{const path=mapping[img.dataset.assetKey];if(path)loadAsset(img,path)})}).catch(()=>{});
// Story-led reveals: titles, images, ordered steps and insights have distinct motion.
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches||typeof IntersectionObserver==='undefined'||typeof Element.prototype.animate!=='function')return;
 const compact=matchMedia('(max-width:900px)').matches,played=new WeakSet(),running=new Set();
 const groups={
  title:'.hero-copy h1,.reference-title,.ruled-heading,.case-stage-heading,.chapter-inner,.education-heading,.contact-heading,.b2b-header',
  text:'.hero-copy .eyebrow,.hero-disciplines,.expertise,.about-grid,.section-intro,.case-hero-copy,.nco-hero-copy,.nco-lead,.contact-details',
  image:'.hero-portrait,.case-hero-visual,.nco-brand,.brand-gallery,.report-gallery,.marketplace-image,.linkedin-grid img,.instagram-grid img,.nco-article-cards article>img',
  sequence:'.process-card,.method-card,.b2b-steps li,.education-timeline li',
  card:'.tool-card,.case-fact,.case-panel,.nco-summary,.nco-planning-panel,.nco-article-cards article,.education-cards article,.contact-card,.campaign-details',
  insight:'.b2b-insight,.case-takeaway,.case-learning,.education-insight,.lujos-insight,.nco-learning'
 };
 const candidates=[];
 Object.entries(groups).forEach(([kind,selector])=>all(selector).forEach(node=>{if(node.closest('main')){node.dataset.motionKind=kind;candidates.push(node)}}));
 // Keep nested content available for its own story-specific reveal when appropriate.
 const nodes=candidates.filter(node=>!candidates.some(parent=>parent!==node&&parent.contains(node)&&!['image','insight','sequence'].includes(node.dataset.motionKind)));
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   const node=entry.target;if(!entry.isIntersecting||played.has(node))return;
   played.add(node);observer.unobserve(node);if(preference.matches)return;
   const kind=node.dataset.motionKind;
   const siblings=Array.from(node.parentElement.children).filter(child=>child.dataset.motionKind===kind);
   const index=Math.max(0,siblings.indexOf(node));
   const delay=['sequence','card','image'].includes(kind)?Math.min(index,5)*(compact?80:130):0;
   let frames,duration=compact?700:900;
   if(kind==='image'){frames=[{opacity:.3,translate:'0 '+(compact?8:14)+'px',scale:.99},{opacity:1,translate:'0 0',scale:1}];duration=compact?800:1100}
   else if(kind==='insight'){
    const shadow=getComputedStyle(node).boxShadow;
    frames=[{opacity:.35,translate:'0 8px',boxShadow:shadow},{opacity:1,translate:'0 0',boxShadow:'0 0 0 6px rgba(201,55,106,.08)',offset:.65},{opacity:1,translate:'0 0',boxShadow:shadow}];duration=1100;
   }else if(kind==='text'){frames=[{opacity:.15},{opacity:1}];duration=900}
   else{frames=[{opacity:.2,translate:'0 '+(compact?10:18)+'px'},{opacity:1,translate:'0 0'}]}
   const motion=node.animate(frames,{duration,delay,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'});
   running.add(motion);motion.finished.then(()=>running.delete(motion)).catch(()=>running.delete(motion));
  });
 },{threshold:.1,rootMargin:'0px 0px -18px 0px'});
 nodes.forEach(node=>observer.observe(node));
 const stop=()=>{if(preference.matches){observer.disconnect();running.forEach(motion=>motion.cancel());running.clear()}};
 if(preference.addEventListener)preference.addEventListener('change',stop);
})();
// Keep the menu's section highlight aligned with the visible portfolio content.
const menuSections=all('main>section[id]');
let menuFrame=0;
function updateMenuSection(){
 menuFrame=0;const edge=(header?.offsetHeight||100)+80;
 let active='inicio';
 menuSections.forEach(section=>{if(section.getBoundingClientRect().top<=edge)active=section.id});
 const group=['cremia','lujos','nco'].includes(active)?'proyectos':active;
 all('.site-nav>a,.nav-contact-language>a').forEach(link=>{if(link.hash==='#'+group)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
 projectMenu?.classList.toggle('active-section',group==='proyectos');
}
window.addEventListener('scroll',()=>{if(!menuFrame)menuFrame=requestAnimationFrame(updateMenuSection)},{passive:true});
window.addEventListener('resize',updateMenuSection);updateMenuSection();

// Count only published statistics, preserving their exact final formatting.
(()=>{
 const metrics=all('#lujos [data-count-to],#lujos .result-totals strong,#lujos .result-bars strong,#cremia .market-value strong');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches||typeof IntersectionObserver==='undefined')return;
 const played=new WeakSet();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const metric=entry.target;if(!entry.isIntersecting||played.has(metric))return;
  const final=metric.dataset.statEs||metric.textContent.trim(),match=final.match(/^([+]?)([\d.,]+)(%?)$/);if(!match)return;
  const goal=Number(match[2].replace(/\./g,'').replace(',','.'));if(!Number.isFinite(goal))return;
  played.add(metric);observer.unobserve(metric);
  const decimals=match[2].includes(',')?match[2].split(',')[1].length:0;
  const formats={es:new Intl.NumberFormat('es-ES',{useGrouping:true,minimumFractionDigits:decimals,maximumFractionDigits:decimals}),en:new Intl.NumberFormat('en-GB',{useGrouping:true,minimumFractionDigits:decimals,maximumFractionDigits:decimals})};
  const started=performance.now(),duration=1300;
  function frame(now){
   const progress=Math.min(1,(now-started)/duration);
   if(preference.matches||progress===1){metric.textContent=window.portfolioNumber?window.portfolioNumber(final):final;return}
   const value=goal*(1-Math.pow(1-progress,3));
   metric.textContent=match[1]+formats[document.documentElement.lang==='en'?'en':'es'].format(decimals?value:Math.floor(value))+match[3];
   requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
 }),{threshold:.55});
 metrics.forEach(metric=>observer.observe(metric));
})();

// A few large hero images drift by at most six pixels on pointer-based devices.
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),pointer=matchMedia('(hover:hover) and (pointer:fine)');
 if(preference.matches||!pointer.matches||typeof IntersectionObserver==='undefined')return;
 const images=all('.hero-portrait>img,.cremia-hero-photo>img,.lujos-case .automotive-hero'),visible=new Set();
 let pending=0;
 function update(){
  pending=0;if(preference.matches||!pointer.matches)return;
  const height=window.innerHeight;
  visible.forEach(image=>{const box=image.getBoundingClientRect();const progress=Math.max(-1,Math.min(1,(box.top+box.height/2-height/2)/(height/2+box.height/2)));image.style.setProperty('--image-drift',(-progress*6).toFixed(2)+'px')});
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(update)}
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target)});schedule()},{rootMargin:'80px'});
 images.forEach(image=>{image.classList.add('subtle-scroll-image');observer.observe(image)});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 function stop(){if(preference.matches||!pointer.matches){cancelAnimationFrame(pending);pending=0;observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);images.forEach(image=>image.style.removeProperty('--image-drift'))}}
 if(preference.addEventListener)preference.addEventListener('change',stop);
 if(pointer.addEventListener)pointer.addEventListener('change',stop);
})();

// Grow campaign bars to their existing values once the chart enters view.
(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||typeof IntersectionObserver==='undefined')return;
 const charts=all('#lujos .result-bars'),played=new WeakSet();
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting||played.has(entry.target))return;
   played.add(entry.target);
   observer.unobserve(entry.target);
   all('.result-bar',entry.target).forEach((bar,index)=>{
    bar.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:1050,delay:index*95,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'});
   });
  });
 },{threshold:.35});
 charts.forEach(chart=>observer.observe(chart));
})();

// Dismiss the contact downloads when leaving the disclosure.
(()=>{
 const downloads=document.querySelector('.contact-downloads');
 if(!downloads)return;
 document.addEventListener('click',event=>{if(!downloads.contains(event.target))downloads.open=false});
 downloads.addEventListener('keydown',event=>{if(event.key==='Escape'){downloads.open=false;downloads.querySelector('summary').focus()}});
 downloads.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{downloads.open=false}));
})();

// Touch and keyboard users can bring forward the same cards as mouse users.
(()=>{
 const gallery=document.querySelector('#lujos .social-gallery');
 if(!gallery)return;
 const cards=Array.from(gallery.querySelectorAll('.publication-card'));
 function clear(){cards.forEach(card=>{card.classList.remove('is-active');card.setAttribute('aria-pressed','false')})}
 cards.forEach(card=>card.addEventListener('click',()=>{
  const activate=!card.classList.contains('is-active');clear();
  if(activate){card.classList.add('is-active');card.setAttribute('aria-pressed','true')}
 }));
 document.addEventListener('click',event=>{if(!gallery.contains(event.target))clear()});
 gallery.addEventListener('keydown',event=>{if(event.key==='Escape')clear()});
})();
