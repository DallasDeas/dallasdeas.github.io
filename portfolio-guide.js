(() => {
  'use strict';
  if (window.PortfolioGuide) return;
  const desktop = Boolean(document.getElementById('workspace'));
  const sources = [
    ['/about/', 'Background & experience', 'about'],
    ['/certifications/', 'Certifications', 'certifications'],
    ['/projects/network/', 'Cisco networking lab', 'project-network'],
    ['/projects/active-directory/', 'Active Directory lab', 'project-directory'],
    ['/projects/azure/', 'Azure cloud lab', 'project-azure'],
    ['/projects/', 'Project archive', 'projects'],
    ['/classic/', 'Portfolio & toolbox', 'skills'],
    ['/contact/', 'Contact Dallas', 'contact'],
  ];
  const stop = new Set('a an the is are was were be been being do does did can could would should will have has had how what which where when why who me i you your he his him it its this that these those tell about more know show find give someone something please dallas deas with and or of to in on at for from as any all website portfolio work done use uses used using get gets take someone back'.split(' '));
  const aliases = { networks:'network', networking:'network', routing:'route', routed:'route', certifications:'certification', certified:'certification', certs:'certification', credentials:'certification', credential:'certification', skills:'skill', tools:'tool', projects:'project', labs:'lab', windows:'windows', resumes:'resume', contact:'contact', email:'contact', reach:'contact', hire:'contact', hiring:'role', jobs:'role', job:'role', education:'college', degree:'college', school:'college', university:'college', azure:'azure', cloud:'azure', identity:'identity', directory:'directory', ad:'directory', gpo:'policy', vlan:'vlans', vlans:'vlans', military:'guard', army:'guard', experience:'experience', background:'experience', erp:'erp', accounting:'accounting' };
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function words(value) {
    return [...new Set((normalize(value).match(/[a-z0-9]+/g) || []).filter(w => !stop.has(w)).map(w => aliases[w] || w))];
  }
  const clean = value => value.replace(/\s+/g, ' ').trim();
  function contentText(element) {
    const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const parts = [];
    while (walker.nextNode()) parts.push(walker.currentNode.textContent);
    return clean(parts.join(' '));
  }
  const manual = [
    {title:'Using desktop and classic view', text:'Desktop view lets you open Terminal, About me, Projects, Toolbox, Credentials, Résumé.pdf, Contact.txt and Appearance from the desktop icons. The dock opens the same windows. Drag a window by its title bar; use its controls to close, minimize or maximize. Classic view is a traditional page layout. The Classic view and Desktop view buttons switch between the two views. Home keeps you in classic view.', path:'/desktop/', app:null, tags:'desktop classic switch view navigate home windows move drag minimize maximize dock icons'},
    {title:'Light mode, dark mode & sound', text:'Light mode shows the daytime skyline and Day shift audio. Dark mode shows the night skyline and Night shift rain and distant sirens. Use the mode button to switch themes, the sound button to play or mute audio, and the volume slider to adjust it. Appearance includes animated rain and wallpaper dimming.', path:'/desktop/', app:'settings', tags:'light dark theme appearance day night shift audio music sound mute volume rain sirens settings wallpaper'},
    {title:'Dallas’s résumé', text:'Open or download Dallas Deas’s résumé as a PDF. The desktop Résumé window displays a preview and links to the original document.', path:'/desktop/assets/Dallas_Deas_Resume.pdf', app:'resume', tags:'resume cv download pdf'},
    {title:'GitHub profile', text:'The GitHub profile button opens Dallas Deas’s GitHub profile and profile README, with his background, tools and project links.', path:'https://github.com/DallasDeas', app:null, tags:'github profile readme repository repos'},
    {title:'About this guide', text:'This guide searches written content on Dallas’s portfolio and shows matching excerpts with source links. It runs in your browser without a paid AI service. It does not invent answers or read text inside screenshots, videos or the résumé PDF. Open the original documents for those details.', path:'/classic/', app:null, tags:'guide assistant ai chatbot cost free search help'},
  ];
  let knowledge;
  let unavailable = 0;
  async function loadKnowledge() {
    if (knowledge) return knowledge;
    knowledge = (async () => {
      unavailable = 0;
      const results = await Promise.allSettled(sources.map(async ([path, title, app]) => {
        const response = await fetch(path, {cache:'no-cache'});
        if (!response.ok) throw new Error('Unavailable source');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const main = doc.querySelector('main');
        if (!main) throw new Error('No source content');
        main.querySelectorAll('script,style').forEach(el => el.remove());
        let heading = title;
        const records = [];
        const toolbox = main.querySelector('.edition-toolbox');
        if (toolbox) records.push({title:'Dallas’s tools & skills',text:contentText(toolbox),path:'/classic/#toolbox-title',app:'skills',tags:'tools skills toolbox'});
        if (path === '/certifications/') records.push({title:'Dallas’s certifications',text:Array.from(main.querySelectorAll('.card h3')).map(h => contentText(h) + ': ' + contentText(h.nextElementSibling)).join(' '),path,app,tags:'certifications credentials'});
        main.querySelectorAll('h1,h2,h3,p,li,.edition-project-row,.credential-card,.skill-group,.edition-toolbox-row,a[href^="mailto:"],a[href*="linkedin.com"]').forEach(el => {
          const text = contentText(el);
          if (/^H[123]$/.test(el.tagName)) {heading = text || title; return;}
          if (text.length < 24 && !el.matches('a')) return;
          const toolbox = Boolean(el.closest('.edition-toolbox'));
          records.push({title:heading, text, path:path + (el.id ? '#' + el.id : ''), app, tags:title + (toolbox ? ' skills tools' : '')});
        });
        if (!records.length) records.push({title,text:contentText(main),path,app,tags:title});
        return records;
      }));
      const records = [...manual];
      results.forEach(result => {if (result.status === 'fulfilled') records.push(...result.value); else unavailable++;});
      if (unavailable === sources.length) knowledge = null;
      return records.map(record => ({...record, tokens:words(record.text), titleTokens:words(record.title+' '+record.tags)}));
    })();
    return knowledge;
  }
  function search(question, records) {
    let tokens = words(question);
    if (!tokens.length && /\bwho\b/i.test(question)) tokens = ['experience'];
    if (!tokens.length) return [];
    const matches = records.map(record => {
      const found = tokens.filter(t => record.tokens.includes(t) || record.titleTokens.includes(t));
      const score = found.reduce((n,t) => n + (record.tokens.includes(t) ? 2 : 0) + (record.titleTokens.includes(t) ? 3 : 0), 0) + (found.includes('contact') && record.text.includes('@') ? 2 : 0);
      return {...record, score, coverage:found.length/tokens.length};
    }).filter(r => r.score >= 2 && r.coverage >= .45).sort((a,b) => b.score-a.score || b.coverage-a.coverage);
    const selected = [];
    matches.forEach(record => {
      if (selected.length >= 3 || selected.some(r => r.text === record.text)) return;
      selected.push(record);
    });
    return selected;
  }
  const sheet = document.createElement('link'); sheet.rel='stylesheet'; sheet.href='/portfolio-guide.css?v=free-guide-20261014'; document.head.append(sheet);
  if (!desktop) {
    const toggle = document.createElement('button'); toggle.type='button'; toggle.id='guide-toggle'; toggle.className='portfolio-guide-launcher'; toggle.textContent='✦ Portfolio guide'; toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls','guide-widget');
    const panel = document.createElement('aside'); panel.className='classic-guide guide-widget'; panel.id='guide-widget'; panel.hidden=true; panel.setAttribute('aria-label','Portfolio guide');
    panel.innerHTML='<header><span>✦ Portfolio guide</span><button type="button" id="guide-close" aria-label="Close portfolio guide">×</button></header><div id="guide-messages" class="guide-messages" role="log" aria-live="polite"></div><div class="guide-options"><button type="button" data-guide="projects">Projects</button><button type="button" data-guide="experience">Background</button><button type="button" data-guide="contact">Contact</button></div><form id="guide-form"><label class="sr-only" for="guide-input">Ask the portfolio guide</label><input id="guide-input" placeholder="Ask about Dallas or a project…" autocomplete="off" maxlength="300"><button type="submit" aria-label="Send question">↗</button></form><small class="guide-note">Answers from this portfolio · No AI service</small>';
    document.body.append(toggle,panel);
    function show(open) {panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open) document.getElementById('guide-input').focus();else toggle.focus();}
    toggle.addEventListener('click',()=>show(panel.hidden)); document.getElementById('guide-close').addEventListener('click',()=>show(false));
    panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();show(false);}});
  }
  const log = document.getElementById('guide-messages');
  log.replaceChildren();
  function paragraph(text, className='guide-response') {const p=document.createElement('p');p.className=className;p.textContent=text;log.append(p);return p;}
  paragraph('Ask about Dallas’s experience, certifications, tools or labs—or how to use either view. I’ll show matching information and its source.');
  const form=document.getElementById('guide-form');
  const input=document.getElementById('guide-input');
  const send=form.querySelector('button');
  let busy=false;
  async function ask(question) {
    question=clean(question).slice(0,300);if(!question || busy) return;
    busy=true;send.disabled=true;form.setAttribute('aria-busy','true');
    paragraph(question,'guide-question');
    const pending=paragraph('Searching the portfolio…');
    try {
      const records=await loadKnowledge();
      const results=search(question,records);
      pending.textContent=results.length ? 'Here’s what the portfolio says:' : (unavailable ? 'Some portfolio pages could not be loaded. Try again, or use the page links below.' : 'I couldn’t find that information in Dallas’s portfolio. Try asking about a project, experience, certifications or contact details.');
      results.forEach(record=>{
        const card=document.createElement('div');card.className='guide-result';
        const title=document.createElement('strong');title.textContent=record.title;
        const excerpt=document.createElement('p');excerpt.textContent=record.text.length>650 ? record.text.slice(0,647)+'…' : record.text;
        const actions=document.createElement('div');actions.className='guide-result-actions';
        const link=document.createElement('a');link.href=record.path;link.textContent='View source ↗';
        if(desktop || record.path.startsWith('https:') || record.path.endsWith('.pdf')){link.target='_blank';link.rel='noopener noreferrer';}
        actions.append(link);
        if(desktop && record.app){const open=document.createElement('button');open.type='button';open.textContent='Open window';open.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('portfolio-guide-open',{detail:record.app})));actions.append(open);}
        card.append(title,excerpt,actions);log.append(card);
      });
      if(!results.length){const links=document.createElement('div');links.className='guide-result-actions';[['Background','/about/'],['Projects','/projects/'],['Contact','/contact/']].forEach(([title,path])=>{const a=document.createElement('a');a.textContent=title;a.href=path;if(desktop){a.target='_blank';a.rel='noopener noreferrer';}links.append(a);});log.append(links);}
      if(unavailable && results.length) paragraph('Some pages are unavailable, so these results may be incomplete.');
    } catch (_) {pending.textContent='The portfolio search is temporarily unavailable. Please try again or use the website navigation.';knowledge=null;}
    finally {busy=false;send.disabled=false;form.removeAttribute('aria-busy');while(log.children.length>45)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;}
  }
  form.addEventListener('submit',event=>{event.preventDefault();if(!busy){const value=input.value;input.value='';ask(value);}});
  document.querySelectorAll('[data-guide]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.guide)));
  window.PortfolioGuide={ask,search,loadKnowledge};
})();
