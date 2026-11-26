import {ledger,reportAt} from './content.js';
import {translateText,monthLabels,numberFormat} from './i18n.js';

let library;
const loadChart = () => library ??= import('./assets/vendor/chart.js').then(()=>globalThis.Chart);
const money = numberFormat;
const animation = {duration:450,easing:'easeOutQuart'};
const font = {family:"'Geist Mono', monospace",size:12,weight:500};

export function reportDatasets(month) {
  return [
    {label:translateText('Resultado del mes'),data:ledger.map((_,i)=>i<=month?reportAt(i).period:null),backgroundColor:'#40998E',hoverBackgroundColor:'#68B0A7'},
    {label:translateText('Acumulado'),data:ledger.map((_,i)=>i<=month?reportAt(i).accumulated:null),backgroundColor:'#E5C572',hoverBackgroundColor:'#EED69D'},
  ];
}

export function createReportChart(canvas,month,{signal,motion}) {
  let chart;
  let currentMonth=month;
  let visible=true;
  const events=new AbortController();
  const shouldAnimate=()=>!motion.matches&&!document.hidden&&visible;
  function redraw(){
    if(!chart) return;
    chart.stop();
    chart.data.datasets=reportDatasets(currentMonth);
    chart.options.animation=shouldAnimate()?animation:false;
    chart.update(shouldAnimate()?undefined:'none');
  }
  function destroy(){
    events.abort();
    observer?.disconnect();
    chart?.destroy();
    chart=undefined;
  }
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(!visible) chart?.stop();
    else redraw();
  }):undefined;
  observer?.observe(canvas);
  signal.addEventListener('abort',destroy,{once:true});
  motion.addEventListener('change',redraw,{signal:events.signal});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) chart?.stop();else redraw();
  },{signal:events.signal});

  loadChart().then(Chart=>{
    if(signal.aborted||!canvas.isConnected) return;
    chart=new Chart(canvas,{
      type:'bar',
      data:{labels:monthLabels().map(month=>month.slice(0,3)),datasets:reportDatasets(currentMonth)},
      options:{
        responsive:true,maintainAspectRatio:false,
        animation:shouldAnimate()?animation:false,
        interaction:{mode:'index',intersect:false},
        datasets:{bar:{borderWidth:0,borderRadius:2,maxBarThickness:24,categoryPercentage:.72,barPercentage:.82}},
        plugins:{
          legend:{display:false},
          tooltip:{
            titleFont:font,bodyFont:font,padding:12,
            backgroundColor:'#F2F0E9',titleColor:'#29434F',bodyColor:'#29434F',
            callbacks:{label:context=>`${context.dataset.label}: ${money(context.parsed.y)} CAD`},
          },
        },
        scales:{
          x:{grid:{display:false},border:{color:'#F2F0E94D'},ticks:{color:'#F2F0E9',font,maxRotation:0,minRotation:0}},
          y:{beginAtZero:true,max:50000,border:{display:false},grid:{color:'#F2F0E91F'},ticks:{stepSize:25000,color:'#F2F0E9',font,callback:value=>value===0?'0':`${value/1000}k`}},
        },
      },
    });
    document.fonts?.ready.then(()=>{if(!signal.aborted) chart?.update('none');});
  }).catch(error=>{
    canvas.closest('.report-chart')?.setAttribute('hidden','');
    console.warn('No se pudo cargar la gráfica; los datos siguen disponibles en la tabla.',error);
  });
  if(signal.aborted) destroy();
  return {setMonth(value){currentMonth=value;redraw();}};
}
