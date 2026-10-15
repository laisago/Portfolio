'use strict';
// A compact mobile disclosure; the desktop navigation stays continuously visible.
(()=>{
 const header=document.querySelector('.site-header');
 const button=document.querySelector('.mobile-menu-toggle');
 const nav=document.getElementById('portfolio-navigation');
 if(!header||!button||!nav)return;
 const mobile=matchMedia('(max-width:800px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let open=false,motion=null;
 function label(){button.setAttribute('aria-label',document.documentElement.lang==='en'?(open?'Close menu':'Open menu'):(open?'Cerrar menú':'Abrir menú'))}
 function stop(){if(motion){motion.cancel();motion=null}}
 function setOpen(next,restoreFocus=false,animate=true){
  stop();open=mobile.matches&&next;
  button.setAttribute('aria-expanded',String(open));header.classList.toggle('mobile-menu-open',open);label();
  if(!mobile.matches){nav.hidden=false;nav.inert=false;nav.removeAttribute('aria-hidden');return}
  nav.inert=!open;nav.setAttribute('aria-hidden',String(!open));
  if(restoreFocus)button.focus({preventScroll:true});
  const canAnimate=animate&&!reduced.matches&&typeof nav.animate==='function';
  if(open){
   nav.hidden=false;
   if(canAnimate)motion=nav.animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.2,.7,.3,1)'});
  }else if(canAnimate&&!nav.hidden){
   const current=motion=nav.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:240,easing:'ease-in',fill:'forwards'});
   current.onfinish=()=>{if(motion===current&&!open){nav.hidden=true;stop()}};
  }else nav.hidden=true;
 }
 button.addEventListener('click',()=>setOpen(!open));
 nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{if(mobile.matches)setOpen(false)}));
 document.addEventListener('click',event=>{if(open&&!header.contains(event.target))setOpen(false)});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&open){event.preventDefault();setOpen(false,true)}});
 document.addEventListener('focusin',event=>{if(open&&!header.contains(event.target))setOpen(false)});
 window.addEventListener('portfolio:languagechange',label);
 mobile.addEventListener('change',()=>setOpen(false,false,false));
 reduced.addEventListener('change',()=>{if(reduced.matches)setOpen(open,false,false)});
 setOpen(false,false,false);
})();
