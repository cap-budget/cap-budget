
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
 // Le mode aperçu permet de vérifier l'accueil sans modifier les données existantes.
 if(!preview&&((()=>{try{return localStorage.getItem(key)==='true'||!!localStorage.getItem('cap_onboarding_v1');}catch(_){return false;}})()||hasPriorData)){modal.hidden=true;modal.style.setProperty('display','none','important');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';return;}
 const show=(which)=>{
   mode=which;choices.hidden=true;form.hidden=false;fields.replaceChildren();
   const add=(id,title,value,required=true)=>{
     const label=document.createElement('label');label.htmlFor='cw-'+id;label.textContent=title;
     const input=document.createElement('input');input.id='cw-'+id;input.name=id;input.required=required;input.type=id==='goalName'?'text':'number';
     if(input.type==='number'){input.min='0';input.step='0.01';}input.value=value;
     fields.append(label,input);
   };
   add('income','Revenu mensuel (€)','');
   if(which==='detail'){
     add('fixed','Charges fixes (€)','0');add('food','Alimentation (€)','0');
     add('other','Transport et autres (€)','0');add('leisure','Loisirs (€)','0');
     add('projects','Projets / épargne (€)','0');
   }
   add('goalName','Nom de votre objectif principal (facultatif)','',false);
   add('goalTarget','Montant cible de votre objectif (€)','',false);
   document.getElementById('cw-error').textContent='';
   fields.querySelector('input')?.focus();
 };
 const close=()=>{modal.hidden=true;modal.style.setProperty('display','none','important');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';try{localStorage.setItem('cap_visited','true');localStorage.setItem('cap_onboarding_v1','done');}catch(_){/* Le navigateur peut interdire le stockage, mais la fermeture reste possible. */}};
 document.getElementById('btn-quick-setup').onclick=()=>show('quick');
 document.getElementById('btn-detailed-setup').onclick=()=>show('detail');
 document.getElementById('btn-demo-mode').onclick=close;
 document.getElementById('cw-close').onclick=close;
 document.getElementById('cw-back').onclick=close;
 form.onsubmit=e=>{
   e.preventDefault();
   if(preview){close();return;}
   const read=id=>fields.querySelector('[name="'+id+'"]')?.value||'';
   const income=Number(read('income'));
   if(!Number.isFinite(income)||income<=0){document.getElementById('cw-error').textContent='Indiquez un revenu mensuel supérieur à zéro.';return;}
   const goalName=read('goalName').trim(),goalTarget=Number(read('goalTarget'));
   if(goalName&&(!Number.isFinite(goalTarget)||goalTarget<=0)){document.getElementById('cw-error').textContent='Indiquez un montant cible supérieur à zéro pour cet objectif.';return;}
   const next={income,fixed:0,food:0,leisure:0,projects:0,other:0};
   if(mode==='detail')for(const k of ['fixed','food','leisure','projects','other']){
     const n=Number(read(k));if(!Number.isFinite(n)||n<0){document.getElementById('cw-error').textContent='Vérifiez les montants du budget.';return;}next[k]=n;
   }
   try{
     // Synchronise le moteur existant via ses champs et son bouton de calcul.
     for(const [k,v] of Object.entries(next)){const input=document.getElementById('cap-'+k);if(input)input.value=String(v);}
     document.getElementById('cap-calc-btn')?.click();
     document.getElementById('cap-save-btn')?.click();
     if(goalName){
       const name=document.getElementById('v6-goal-name'),target=document.getElementById('v6-goal-target');
       if(name&&target){name.value=goalName;target.value=String(goalTarget);document.getElementById('v6-add-goal')?.click();}
     }
     // Ne marquer l'accueil termine qu'apres enregistrement du budget.
     close();
     // Les vues existantes relisent le moteur au rechargement.
     location.reload();
   }catch(_){document.getElementById('cw-error').textContent='Impossible d’enregistrer cette configuration. Réessayez.';}
 };
 modal.removeAttribute('aria-hidden');modal.hidden=false;modal.style.display='flex';document.body.style.overflow='hidden';document.getElementById('btn-quick-setup').focus();
})();
