/* CAP Budget — projets illustrés, données locales, octobre 2026 */
(function () {
  'use strict';
  const KEY = 'capBudgetGoals';
  const el = id => document.getElementById(id);
  const form = el('cap-project-add-form');
  const gallery = el('cap-project-gallery');
  const feedback = el('cap-project-message');
  if (!form || !gallery) return;
  const euros = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(n)||0);
  function getGoals() {
    try { const data=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(data)?data:[]; }
    catch (_) { return []; }
  }
  function saveGoals(goals) {
    try { localStorage.setItem(KEY, JSON.stringify(goals)); }
    catch (_) { feedback.textContent='Espace de stockage insuffisant : le projet ou sa photo n’a pas été enregistré.';return false; }
    window.dispatchEvent(new Event('capGoalsChanged'));
    el('v6-refresh')?.click();
    window.dispatchEvent(new Event('capBudgetChanged'));
    return true;
  }
  // Récupérer l'ancien projet Voyage une seule fois, sans effacer sa cagnotte.
  try {
    if (!localStorage.getItem('cap_projects_legacy_import_v1')) {
      const data=JSON.parse(localStorage.getItem('cap_state_v4')||'null');
      const trip=data&&data.trip;
      if (trip && typeof trip.dest==='string' && Number(trip.goal)>0) {
        const goals=getGoals();
        if (!goals.some(g=>String(g.name||'').trim().toLowerCase()===trip.dest.trim().toLowerCase())) {
          const saved=(Array.isArray(trip.contribs)?trip.contribs:[]).reduce((sum,c)=>sum+(Number(c.amount)>0?Number(c.amount):0),0);
          goals.push({name:trip.dest.trim(),target:Number(trip.goal),saved:Math.round(saved*100)/100,date:trip.date||''});
          if (saveGoals(goals)) localStorage.setItem('cap_projects_legacy_import_v1','1');
        } else localStorage.setItem('cap_projects_legacy_import_v1','1');
      } else localStorage.setItem('cap_projects_legacy_import_v1','1');
    }
  } catch (_) { /* Aucun ancien projet à importer. */ }

  function imageToThumbnail(file) {
    return new Promise((resolve,reject)=>{
      if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) {
        reject(new Error('Choisis une photo JPG, PNG ou WebP.'));return;
      }
      if (file.size>10*1024*1024) { reject(new Error('Cette photo est trop volumineuse (10 Mo maximum).'));return; }
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('Impossible de lire cette photo.'));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('Ce fichier ne contient pas une photo utilisable.'));
        img.onload=()=>{
          const canvas=document.createElement('canvas');
          canvas.width=320;canvas.height=240;
          const ctx=canvas.getContext('2d');
          if (!ctx) { reject(new Error('Impossible de préparer la miniature.'));return; }
          const scale=Math.max(320/img.width,240/img.height);
          const w=img.width*scale,h=img.height*scale;
          ctx.fillStyle='#13291f';ctx.fillRect(0,0,320,240);
          ctx.drawImage(img,(320-w)/2,(240-h)/2,w,h);
          let uri=canvas.toDataURL('image/jpeg',0.72);
          if (uri.length>150000) uri=canvas.toDataURL('image/jpeg',0.48);
          if (uri.length>180000) { reject(new Error('Photo trop lourde après réduction. Essaie une autre image.'));return; }
          resolve(uri);
        };
        img.src=String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
  function button(label,onClick,cls) {
    const b=document.createElement('button');b.type='button';b.textContent=label;
    b.className=cls||'cap-project-action';b.addEventListener('click',onClick);return b;
  }
  function render() {
    gallery.replaceChildren();
    const goals=getGoals();
    if (!goals.length) {
      const p=document.createElement('p');p.className='cap-project-empty';
      p.textContent='Aucun projet pour le moment. Ajoute ton premier projet et sa photo.';
      gallery.append(p);
      return;
    }
    goals.forEach((g,index)=>{
      if (!g || typeof g!=='object') return;
      const article=document.createElement('article');article.className='cap-project-tile';
      const picture=document.createElement('div');picture.className='cap-project-picture';
      if (typeof g.photo==='string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(g.photo)) {
        const img=document.createElement('img');img.src=g.photo;img.alt='Photo du projet '+String(g.name||'');
        img.loading='lazy';picture.append(img);
      } else {
        const empty=document.createElement('span');empty.textContent='🎯';empty.setAttribute('aria-hidden','true');picture.append(empty);
      }
      const name=document.createElement('h3');name.textContent=String(g.name||'Projet sans nom');
      const progress=document.createElement('p');progress.className='cap-project-progress';
      const target=Math.max(0,Number(g.target)||0),saved=Math.max(0,Number(g.saved)||0);
      progress.textContent=euros(saved)+' / '+euros(target);
      const meter=document.createElement('progress');meter.max=100;
      meter.value=target?Math.min(100,Math.round(saved/target*100)):0;
      meter.setAttribute('aria-label','Avancement de '+String(g.name||'ce projet'));
      const actions=document.createElement('div');actions.className='cap-project-tile-actions';
      actions.append(button('Voir l’objectif',()=>{
        const goalButton=document.querySelector('#v6-goals [data-goal="'+index+'"]');
        const item=goalButton?.closest('.cap-v6-item')||el('v6-goals');
        item?.scrollIntoView({behavior:'smooth',block:'center'});
      }));
      const picker=document.createElement('input');picker.type='file';picker.accept='image/jpeg,image/png,image/webp';picker.hidden=true;
      picker.setAttribute('aria-label','Choisir une photo pour '+String(g.name||'ce projet'));
      picker.addEventListener('change',async()=>{
        const file=picker.files&&picker.files[0];if(!file)return;
        feedback.textContent='Préparation de la photo…';
        try {
          const photo=await imageToThumbnail(file);
          const fresh=getGoals();
          if (!fresh[index] || fresh[index].name!==g.name) throw new Error('Le projet a changé : réessaie.');
          fresh[index]={...fresh[index],photo};
          if (saveGoals(fresh)) feedback.textContent='Photo enregistrée pour '+String(g.name||'ce projet')+'.';
        } catch (err) { feedback.textContent=err.message||'Impossible d’enregistrer la photo.'; }
      });
      actions.append(button(g.photo?'Changer la photo':'Ajouter une photo',()=>picker.click()));
      if(g.photo) actions.append(button('Retirer la photo',()=>{
        const fresh=getGoals();
        if(!fresh[index]||fresh[index].name!==g.name)return;
        const changed={...fresh[index]};delete changed.photo;fresh[index]=changed;
        if(saveGoals(fresh))feedback.textContent='Photo retirée. Le projet est conservé.';
      }));
      actions.append(picker);
      article.append(picture,name,progress,meter,actions);gallery.append(article);
    });
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const name=el('cap-project-name').value.trim();
    const target=Number(el('cap-project-target').value);
    const saved=el('cap-project-saved').value.trim()===''?0:Number(el('cap-project-saved').value);
    const date=el('cap-project-date').value;
    const photoInput=el('cap-project-photo'),file=photoInput.files&&photoInput.files[0];
    if(!name || name.length>80 || !Number.isFinite(target) || target<=0 || target>=100000000 || !Number.isFinite(saved) || saved<0 || saved>=100000000) {
      feedback.textContent='Indique un nom, un objectif supérieur à 0 € et un montant épargné valide.';return;
    }
    const submit=el('cap-project-submit');submit.disabled=true;
    try {
      let photo;
      if(file) {feedback.textContent='Préparation de la photo…';photo=await imageToThumbnail(file);}
      const goals=getGoals();
      goals.push({name,target:Math.round(target*100)/100,saved:Math.round(saved*100)/100,date,...(photo?{photo}:{})});
      if(saveGoals(goals)) {form.reset();feedback.textContent='Projet « '+name+' » ajouté. Tu peux en créer un autre.';}
    } catch(err){feedback.textContent=err.message||'Impossible d’ajouter le projet.';}
    finally{submit.disabled=false;}
  });
  window.addEventListener('capGoalsChanged',render);
  window.addEventListener('storage',e=>{if(e.key===KEY)render();});
  render();
})();