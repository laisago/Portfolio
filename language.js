'use strict';
// Translate existing text nodes in place to preserve markup, focus and interactions.
(()=>{
 const dictionary=window.portfolioTranslations||{};
 const buttons=Array.from(document.querySelectorAll('[data-language]'));
 const metrics=Array.from(document.querySelectorAll('#lujos [data-count-to],#lujos .result-totals strong,#lujos .result-bars strong,#cremia .market-value strong'));
 metrics.forEach(metric=>{metric.dataset.statEs=metric.textContent.trim()});
 const texts=[],attributes=[];
 const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode,source=node.nodeValue,key=source.trim();
  if(!key||node.parentElement.closest('script,style,.language-switch')||metrics.some(metric=>metric.contains(node)))continue;
  if(Object.prototype.hasOwnProperty.call(dictionary,key))texts.push({node,source,key});
 }
 document.querySelectorAll('[alt],[aria-label],[title],meta[name="description"]').forEach(node=>{
  if(node.closest('.language-switch'))return;
  ['alt','aria-label','title','content'].forEach(name=>{
   const source=node.getAttribute(name);
   if(source&&Object.prototype.hasOwnProperty.call(dictionary,source))attributes.push({node,name,source});
  });
 });
 window.portfolioNumber=source=>document.documentElement.lang==='en'?(dictionary[source]||source):source;
 function setLanguage(language,save=false){
  const english=language==='en';
  document.documentElement.lang=english?'en':'es';
  document.querySelectorAll('img[data-src-es][data-src-en]').forEach(image=>{const source=english?image.dataset.srcEn:image.dataset.srcEs;if(image.getAttribute('src')!==source)image.setAttribute('src',source)});
  texts.forEach(({node,source,key})=>{node.nodeValue=english?source.replace(key,dictionary[key]):source});
  attributes.forEach(({node,name,source})=>node.setAttribute(name,english?dictionary[source]:source));
  metrics.forEach(metric=>{metric.textContent=window.portfolioNumber(metric.dataset.statEs)});
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
  if(save){try{localStorage.setItem('portfolio-language',language)}catch{}}
  // A translated header can wrap differently; refresh navigation offsets immediately.
  const header=document.querySelector('.site-header');
  if(header)document.documentElement.style.setProperty('--header-height',header.offsetHeight+'px');
  window.dispatchEvent(new Event('portfolio:languagechange'));
 }
 buttons.forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language,true)));
 let initial='es';
 try{const saved=localStorage.getItem('portfolio-language');if(saved==='en'||saved==='es')initial=saved}catch{}
 setLanguage(initial);
})();
