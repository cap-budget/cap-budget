
/* Accueil initial : n'efface jamais les données existantes, ne lance aucun paiement. */
(function(){
 const modal=document.getElementById('onboarding-modal'),choices=document.getElementById('cw-choices'),form=document.getElementById('cw-form'),fields=document.getElementById('cw-fields');
 const key='cap_visited';let mode='quick';
 const preview=new URLSearchParams(location.search).get('onboarding')==='preview';
 const defaults={income:2500,fixed:1100,food:350,leisure:150,projects:200,other:100};
 const stored=(()=>{try{return JSON.parse(localStorage.getItem('capBudgetEngine')||'null')}catch(_){return null}})();
 const hasPriorData=(()=>{
   try{
     // Seules les donnees utilisateur explicites comptent : les cles techniques
     // creees automatiquement au chargement ne doivent pas masquer l'accueil.
     const changedBudget=stored&&Object.keys(defaults).some(k=>Number(stored[k]??defaults[k])!==defaults[k]);
     const nonEmpty=k=>{const value=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(value)?value.length>0:!!(value&&typeof value==='object'&&Object.keys(value).length);};
     return !!changedBudget||nonEmpty('capBudgetGoals')||nonEmpty('capBudgetOperations');
   }catch(_){return true;}
 })();
 if(!modal||!choices||!form||!fields)return;
 // Placer le bandeau avant le tableau de bord, sans cacher le contenu.
 const dashboard=document.querySelector('.cap-dash')||document.querySelector('.cap-dash-main')||document.body.firstElementChild;
 if(dashboard&&dashboard!==modal)dashboard.parentNode.insertBefore(modal,dashboard);
 // Le mode aperçu permet de vérifier l'accueil sans modifier les données existantes.
 if(!preview&&((()=>{try{return localStorage.getItem(key)==='true'||!!localStorage.getItem('cap_onboarding_v1');}catch(_){return false;}})()||hasPriorData)){modal.hidden=true;return;}
 const steps=[
  {title:'1 / 8 — Revenus',help:'Quel est votre revenu mensuel total ?',inputs:[['income','Revenus mensuels (€)']]},
  {title:'2 / 8 — Charges fixes',help:'Quel montant prévoyez-vous pour le logement, les factures et abonnements ?',inputs:[['fixed','Charges fixes mensuelles (€)']]},
  {title:'3 / 8 — Courses et repas',help:'Quel budget mensuel prévoyez-vous pour les courses et repas ?',inputs:[['food','Courses et repas (€)']]},
  {title:'4 / 8 — Loisirs',help:'Quel budget mensuel souhaitez-vous consacrer aux loisirs ?',inputs:[['leisure','Loisirs (€)']]},
  {title:'5 / 8 — Transports et autres',help:'Quel budget prévoyez-vous pour le transport et les autres dépenses ?',inputs:[['other','Transports et autres (€)']]},
  {title:'6 / 8 — Réserve investissement',help:'Combien souhaitez-vous mettre de côté chaque mois ? Cette réserve reste une prévision, sans placement automatique.',inputs:[['investment','Réserve investissement / épargne (€)']]},
  {title:'7 / 8 — Projets et voyages',help:'Quel montant mensuel prévoyez-vous pour vos projets ou voyages ?',inputs:[['projects','Projets et voyages (€)']]},
  {title:'8 / 8 — Vérification',help:'Vérifiez votre budget avant de l’enregistrer. Aucun montant n’est modifié avant confirmation.',inputs:[]}
 ];
 let step=0;const answers={income:'',fixed:'0',food:'0',leisure:'0',other:'0',investment:'0',projects:'0',goalName:'',goalTarget:''};
 const action=form.querySelector('button[type="submit"]');
 const nav=document.createElement('div');nav.style.cssText='display:flex;gap:10px;align-items:center;justify-content:space-between;margin:12px 0';
 const previous=document.createElement('button');previous.type='button';previous.textContent='← Étape précédente';previous.className='cw-link';previous.onclick=()=>{collect();if(step>0){step--;renderStep();}else{form.hidden=true;choices.hidden=false;}};
 nav.append(previous);fields.after(nav);
 function collect(){fields.querySelectorAll('input').forEach(input=>{answers[input.name]=input.value;});}
 function validate(){
  collect();const current=steps[step];
  for(const [id] of current.inputs){if(id==='goalName'||id==='goalTarget')continue;const n=Number(answers[id]);if(!answers[id]||!Number.isFinite(n)||n<0||(id==='income'&&n<=0)){document.getElementById('cw-error').textContent='Saisissez un montant valide'+(id==='income'?' supérieur à zéro':'')+'.';return false;}}
  if(step===6&&answers.goalName.trim()&&!(Number(answers.goalTarget)>0)){document.getElementById('cw-error').textContent='Indiquez le montant cible du projet.';return false;}
  return true;
 }
 function renderStep(){
  const current=steps[step];fields.replaceChildren();
  const heading=document.createElement('h2');heading.textContent=current.title;fields.appendChild(heading);
  const help=document.createElement('p');help.textContent=current.help;fields.appendChild(help);
  current.inputs.forEach(([id,title])=>{const label=document.createElement('label');label.htmlFor='cw-'+id;label.textContent=title;const input=document.createElement('input');input.id='cw-'+id;input.name=id;input.type=id==='goalName'?'text':'number';if(input.type==='number'){input.min='0';input.step='0.01';}input.value=answers[id];input.required=!['goalName','goalTarget'].includes(id);fields.append(label,input);});
  if(step===7){const total=['fixed','food','leisure','other','investment','projects'].reduce((sum,k)=>sum+Number(answers[k]||0),0);const recap=document.createElement('p');recap.textContent='Revenus : '+Number(answers.income).toLocaleString('fr-FR')+' € · Budget et épargne prévus : '+total.toLocaleString('fr-FR')+' € · Marge prévisionnelle : '+(Number(answers.income)-total).toLocaleString('fr-FR')+' €';fields.append(recap);}
  previous.hidden=step===0;action.textContent=step===7?'✓ Confirmer et ouvrir mon tableau de bord':'Continuer →';
  document.getElementById('cw-error').textContent='';fields.querySelector('input')?.focus();
 }
 const show=(which)=>{mode=which;choices.hidden=true;form.hidden=false;
  if(which==='quick'){fields.replaceChildren();const p=document.createElement('p');p.textContent='Explorer avec un budget fictif de 2 500 € de revenus, sans enregistrer de nouvelles données. Les chiffres sont des exemples.';fields.append(p);nav.hidden=true;action.textContent='Explorer la démonstration';return;}
  nav.hidden=false;step=0;renderStep();
 };
 const close=()=>{modal.hidden=true;document.body.classList.remove('cap-wizard-active');try{localStorage.setItem('cap_visited','true');localStorage.setItem('cap_onboarding_v1','done');}catch(_){/* Le navigateur peut interdire le stockage, mais la fermeture reste possible. */}};
 const goDashboard=()=>{close();const target=document.querySelector('.cap-dash')||document.querySelector('.cap-dash-main')||document.querySelector('#dashboard')||document.querySelector('main');if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}else{window.scrollTo({top:0,behavior:'smooth'});}};
 const quickStart=()=>{try{sessionStorage.setItem('cap_demo_mode','1');}catch(_){}goDashboard();};
 document.getElementById('btn-quick-setup').onclick=quickStart;
 document.getElementById('btn-detailed-setup').onclick=()=>show('detail');
 const sharePanel=document.getElementById('cw-share-panel');
 const appUrl='https://cap-budget.github.io/cap-budget/';
 const invite='Découvrez CAP Budget : pour organiser budget, repas et projets de voyage en famille. '+appUrl;
 const shareStatus=document.getElementById('cw-share-status');
 const whatsapp=document.getElementById('cw-whatsapp');
 const sms=document.getElementById('cw-sms');
 if(whatsapp)whatsapp.href='https://wa.me/?text='+encodeURIComponent(invite);
 if(sms)sms.href='sms:?body='+encodeURIComponent(invite);
 document.getElementById('btn-share-cap').onclick=()=>{
   if(!sharePanel)return;
   choices.hidden=true;form.hidden=true;sharePanel.hidden=false;
   document.getElementById('cw-copy-link')?.focus();
 };
 document.getElementById('cw-share-back').onclick=()=>{sharePanel.hidden=true;choices.hidden=false;document.getElementById('btn-share-cap')?.focus();};
 document.getElementById('cw-copy-link').onclick=async()=>{
   try{
     if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(appUrl);}
     else{
       const input=document.createElement('textarea');input.value=appUrl;input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();
       if(!document.execCommand('copy'))throw Error('copy unsupported');input.remove();
     }
     shareStatus.textContent='Lien copié ! Vous pouvez le coller dans un message.';
   }catch(_){shareStatus.textContent='Copiez ce lien : '+appUrl;}
 };
 
 document.getElementById('cw-close').onclick=goDashboard;
 document.getElementById('cw-dashboard-access')?.addEventListener('click',goDashboard);
 document.getElementById('cw-back').onclick=()=>{form.hidden=true;choices.hidden=false;};
 form.onsubmit=e=>{
  e.preventDefault();const error=document.getElementById('cw-error');
  if(mode==='quick'){
    try{sessionStorage.setItem('cap_demo_mode','1');}catch(_){}
    goDashboard();return;
  }
  if(!validate())return;
  if(step<7){step++;renderStep();return;}
  if(preview){goDashboard();return;}
  const income=Number(answers.income),investment=Number(answers.investment);
  const total=['fixed','food','leisure','other','projects','investment'].reduce((n,k)=>n+Number(answers[k]),0);
  if(total>income){error.textContent='Attention : vos enveloppes et votre épargne dépassent vos revenus. Revenez corriger les montants avant de continuer.';return;}
  try{
    const next={income,fixed:Number(answers.fixed),food:Number(answers.food),leisure:Number(answers.leisure),other:Number(answers.other),projects:Number(answers.projects)+investment};
    // Le moteur historique ne possède qu'une enveloppe projets : on y inclut la réserve,
    // mais on conserve son détail séparément pour éviter de la compter deux fois.
    for(const [k,v] of Object.entries(next)){const input=document.getElementById('cap-'+k);if(!input)throw Error('Champ absent : '+k);input.value=String(v);}
    document.getElementById('cap-calc-btn')?.click();
    document.getElementById('cap-save-btn')?.click();
    localStorage.setItem('cap_investment_reserve_v1',JSON.stringify({monthly:investment,updatedAt:new Date().toISOString()}));
    if(answers.goalName.trim()){const name=document.getElementById('v6-goal-name'),target=document.getElementById('v6-goal-target');if(name&&target){name.value=answers.goalName.trim();target.value=String(Number(answers.goalTarget));document.getElementById('v6-add-goal')?.click();}}
    close();location.reload();
  }catch(_){error.textContent='Enregistrement impossible : vos données précédentes ont été conservées. Réessayez.';}
 };
 document.body.classList.add('cap-wizard-active');modal.hidden=false;
})();
