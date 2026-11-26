import {content, ledger, reportAt, migrationRecords, migrateRecord} from './content.js';
import {createSmoothScroll} from './smooth-scroll.js';
import {createReportChart} from './report-chart.js';
import {initExperienceAccordion} from './experience-accordion.js';
import {createDemoTransition} from './demo-transition.js';
import {initHeroTrail} from './hero-trail.js';
import {initTranslations,numberFormat} from './i18n.js';
import {initHeaderControls} from './header-controls.js';
import {createIntegrationSteps} from './integration-steps.js';
const $ = (selector, root=document) => root.querySelector(selector);
const copy = content.es;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const money = numberFormat;
const lifetime = new AbortController();
const listen = (node,type,fn) => node.addEventListener(type,fn,{signal:lifetime.signal});
const languages=initTranslations({signal:lifetime.signal});
initHeaderControls({setLocale:languages.setLocale,signal:lifetime.signal});
initHeroTrail($('#inicio'),{signal:lifetime.signal});
let smoothScroll;
import('./assets/vendor/lenis.js').then(({default:Lenis})=>{
  if(lifetime.signal.aborted) return;
  smoothScroll = createSmoothScroll(Lenis);
  smoothScroll.setModalOpen($('#case-dialog').open);
}).catch(error=>console.warn('Lenis no disponible; se mantiene el desplazamiento nativo.',error));
let panelLifetime;
let reportChart;
let selectedProblem = 'reports';
let month = 2;
let eventStep = 0;
let migrated = false;
const demoTransition=createDemoTransition($('#demo'),{motion:reducedMotion,signal:lifetime.signal,onResize:()=>smoothScroll?.refreshDimensions()});

listen($('#connect'),'click',()=>{
  const connected = $('#connect').getAttribute('aria-pressed') !== 'true';
  $('#system-stage').classList.toggle('connected',connected);
  $('#connect').setAttribute('aria-pressed',String(connected));
  $('#connect').innerHTML = connected ? 'Separar las piezas <span aria-hidden="true">−</span>' : 'Conectar las piezas <span aria-hidden="true">+</span>';
  $('#connection-status').textContent = connected ? 'Pedido, stock y factura. El equipo comparte el contexto.' : 'Piezas separadas. Contexto incompleto.';
});

$('#problems').innerHTML = copy.problems.map(problem=>`<button class="problem" id="choose-${problem.id}" aria-pressed="${problem.id===selectedProblem}" aria-controls="demo" data-problem="${problem.id}"><span class="problem-copy">${problem.title}</span><span class="problem-icon" aria-hidden="true"></span></button>`).join('');
for(const button of document.querySelectorAll('[data-problem]')) listen(button,'click',()=>{
  if(selectedProblem === button.dataset.problem) return;
  selectedProblem = button.dataset.problem;
  for(const item of document.querySelectorAll('[data-problem]')) item.setAttribute('aria-pressed',String(item===button));
  renderDemo();
  // Keep focus on the chosen control; its relationship with the panel is explicit.
});

function renderDemo(){
  demoTransition.replace(drawDemo);
}
function drawDemo(){
  panelLifetime?.abort();
  reportChart=undefined;
  panelLifetime = new AbortController();
  const problem = copy.problems.find(item=>item.id===selectedProblem);
  const demo = $('#demo');
  $('.demo-content',demo).innerHTML = `<div class="demo-top"><span>${problem.label.toUpperCase()}</span><span>Demostración ilustrativa</span></div><h3 id="demo-title">${problem.heading}</h3><p class="demo-desc">${problem.description}</p><div id="demo-controls"></div>`;
  if(selectedProblem === 'reports') renderReport();
  else if(selectedProblem === 'integrations') renderIntegration();
  else renderMigration();
}
function panelListen(node,type,fn){node.addEventListener(type,fn,{signal:panelLifetime.signal});}
function renderReport(){
  $('#demo-controls').innerHTML = `<div class="report-controls"><label for="month">Período de lectura</label><select id="month">${ledger.map((row,i)=>`<option value="${i}" ${i===month?'selected':''}>${row.month}</option>`).join('')}</select></div><div class="report-data" aria-live="polite" aria-atomic="true" id="report-values"></div><div class="report-chart"><canvas id="report-chart" role="img" aria-label="Resultado mensual y acumulado en CAD" aria-describedby="ledger-note">Consulta los valores en la tabla de datos situada debajo.</canvas></div><div class="chart-caption"><span>CAD</span><div class="chart-legend"><span>Mes</span><span>Acumulado</span></div></div><p class="demo-note" id="ledger-note"></p><details class="chart-data"><summary>Ver datos de la gráfica</summary><table><caption>Datos ficticios en CAD</caption><thead><tr><th scope="col">Mes</th><th scope="col">Período</th><th scope="col">Acumulado</th></tr></thead><tbody id="chart-table-body"></tbody></table></details>`;
  reportChart=createReportChart($('#report-chart'),month,{signal:panelLifetime.signal,motion:reducedMotion});
  panelListen($('#month'),'change',event=>{month=Number(event.target.value); updateReport();});
  updateReport();
}
function updateReport(){
  const data=reportAt(month);
  $('#report-values').innerHTML=`<div><span>Resultado de ${data.month.toLowerCase()}</span><strong>${money(data.period)}</strong> <small>CAD</small></div><div><span>Acumulado ene–${data.month.slice(0,3).toLowerCase()}</span><strong>${money(data.accumulated)}</strong> <small>CAD</small></div>`;
  reportChart?.setMonth(month);
  $('#report-chart').setAttribute('aria-label',`Resultados mensuales y acumulados de enero a ${data.month.toLowerCase()}. ${data.month}: ${money(data.period)} CAD; acumulado: ${money(data.accumulated)} CAD.`);
  $('#chart-table-body').innerHTML=ledger.slice(0,month+1).map((_,i)=>{
    const row=reportAt(i);
    return `<tr><th scope="row">${row.month}</th><td>${money(row.period)}</td><td>${money(row.accumulated)}</td></tr>`;
  }).join('');
  $('#ledger-note').textContent=`Datos ficticios · ${data.month}: ingresos ${money(data.income)} − gastos ${money(data.expense)} = ${money(data.period)} CAD. Acumulado: suma de resultados desde enero.`;
}
function renderIntegration(){
  createIntegrationSteps($('#demo-controls'),{
    initialStep:eventStep,onStepChange:step=>{eventStep=step;},
    signal:panelLifetime.signal,motion:reducedMotion,onResize:()=>smoothScroll?.refreshDimensions(),
  });
}
function renderMigration(){
  $('#demo-controls').innerHTML=`<table class="migration-table"><caption class="skip-table">Ejemplo de adaptación de contactos entre esquemas</caption><thead><tr><th scope="col">CONTACTO</th><th scope="col" id="migration-col">ESQUEMA DE ORIGEN</th></tr></thead><tbody id="migration-body"></tbody></table><p class="demo-note" id="migration-result" aria-live="polite"></p><button class="demo-button" id="migrate"></button><p class="demo-note">Ejemplo simplificado con datos ficticios. Una migración real necesita análisis por versión y pruebas de integridad.</p>`;
  panelListen($('#migrate'),'click',()=>{migrated=!migrated;updateMigration();});
  updateMigration();
}
function updateMigration(){
  $('#migration-col').textContent=migrated?'ESQUEMA ADAPTADO':'ESQUEMA DE ORIGEN';
  $('#migration-body').innerHTML=migrationRecords.map(record=>{
    const result=migrateRecord(record);
    const value=migrated?(result.active?(result.customer_rank?'customer_rank = 1':'supplier_rank = 1'):'active = false · conservado'):record.legacy;
    return `<tr><td>${record.name}</td><td>${value}</td></tr>`;
  }).join('');
  $('#migration-result').textContent=migrated?'3 registros conservados. Roles adaptados; el contacto archivado sigue archivado.':'Los roles de cliente y proveedor se expresan como indicadores. ¿Cómo conservarlos al cambiar de esquema?';
  $('#migrate').textContent=migrated?'Volver al origen':'Adaptar reglas y datos';
}
renderDemo();
listen(document,'site:languagechange',()=>{drawDemo();smoothScroll?.refreshDimensions();});
$('#experience').innerHTML=copy.experience.map(([date,name,description],index)=>`<div class="experience-item"><button type="button" class="experience-trigger" id="experience-trigger-${index}" aria-expanded="false" aria-controls="experience-panel-${index}"><span class="experience-date">${date}</span><span>${name}</span><span class="experience-icon" aria-hidden="true"><span class="experience-icon-horizontal"></span><span class="experience-icon-vertical"></span></span></button><div class="experience-panel" id="experience-panel-${index}" role="region" aria-labelledby="experience-trigger-${index}" hidden inert><div class="experience-panel-body"><p>${description}</p></div></div></div>`).join('');
initExperienceAccordion($('#experience'),{
  motion:reducedMotion,signal:lifetime.signal,
  onResize:()=>smoothScroll?.refreshDimensions(),
  ensureVisible:button=>smoothScroll?.ensureVisible(button),
});

const dialog=$('#case-dialog');
const preview=$('#case-preview');
const detail=$('#case-detail');
let savedScroll=0;
let transitioning=false;
async function transitionCase(open){
  if(transitioning || dialog.open===open) return;
  transitioning=true;
  if(open){smoothScroll?.setModalOpen(true);savedScroll=window.scrollY;}
  const update=()=>{
    preview.style.viewTransitionName=open?'none':'case-surface';
    detail.style.viewTransitionName=open?'case-surface':'none';
    if(open){dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';}
    else{
      dialog.close();document.body.style.overflow='';
      if(smoothScroll){smoothScroll.setModalOpen(false);smoothScroll.restore(savedScroll);}
      else window.scrollTo({top:savedScroll,behavior:'instant'});
      $('#open-case').focus({preventScroll:true});
    }
  };
  try{
    if(document.startViewTransition && !reducedMotion.matches){
      const transition=document.startViewTransition(update);
      await transition.finished;
    }else update();
  }catch{
    // An interrupted animation must never prevent access or closing.
    if(dialog.open!==open) update();
  }finally{transitioning=false;}
}
listen($('#open-case'),'click',()=>transitionCase(true));
listen($('#close-case'),'click',()=>transitionCase(false));
listen($('#return-case'),'click',()=>transitionCase(false));
listen(dialog,'cancel',event=>{event.preventDefault();transitionCase(false);});
listen(dialog,'click',event=>{
  if(event.target!==dialog) return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) transitionCase(false);
});
listen(window,'pagehide',event=>{if(!event.persisted){lifetime.abort();panelLifetime?.abort();}});
