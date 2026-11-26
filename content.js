import {translateText} from './i18n.js';
// Spanish is canonical; all three locales use the same translation catalogue.
export const supportedLocales = ['es','en','fr'];
export const plannedLocales = [];
export const content = {
  es: {
    problems: [
      {id:'reports', title:'Los números no me cuadran.', label:'Reportes', heading:'El mes cuenta una parte.\nEl acumulado, la historia.', description:'Separar el movimiento del período del saldo acumulado cambia la lectura. Explora la diferencia con el mismo conjunto de datos.'},
      {id:'integrations', title:'Mis sistemas no se hablan.', label:'Integraciones', heading:'Un evento fuera.\nUna acción dentro.', description:'Una llamada entrante se transforma en contexto dentro de Odoo. Recorre el evento para entender qué recibe el equipo.'},
      {id:'migrations', title:'Evolucionar sin perder\nlo que funciona.', label:'Migraciones', heading:'Cambiar la estructura.\nConservar el sentido.', description:'Mover registros no basta: también hay que adaptar las reglas que hacen que esos datos sean útiles.'}
    ],
    experience: [
      ['2026 — Actualidad', 'TechNuCom', 'Odoo de punta a punta: backend, interfaces OWL, reportes financieros y automatización.'],
      ['2025', 'Maubius', 'Integraciones REST, telefonía 3CX y tableros operativos en OWL.'],
      ['2023 — 2025', 'MICROCOM #Technologies', 'Python, PostgreSQL y contribuciones a OCA / OpenUpgrade.'],
      ['2018 — 2023', 'Quanam', 'Módulos de contabilidad, ventas y reportes. Integraciones con plataformas externas.'],
      ['2013 — 2018', 'Desoft', 'Desarrollo e implementación de soluciones ERP completas.']
    ]
  }
};
for(const locale of ['en','fr']) content[locale]={
  problems:content.es.problems.map(problem=>Object.fromEntries(Object.entries(problem).map(([key,value])=>[key,key==='id'?value:translateText(value,locale)]))),
  experience:content.es.experience.map(row=>row.map(value=>translateText(value,locale))),
};
// Fictitious revenue and expense entries in CAD, January–June. No client data.
export const ledger = [
  {month:'Enero', income:18000, expense:12000},
  {month:'Febrero', income:22500, expense:14500},
  {month:'Marzo', income:21000, expense:16000},
  {month:'Abril', income:28000, expense:18000},
  {month:'Mayo', income:25500, expense:17500},
  {month:'Junio', income:32000, expense:21000}
];
export function reportAt(index) {
  if (!Number.isInteger(index) || index < 0 || index >= ledger.length) throw new RangeError('Mes inválido');
  const period = ledger[index].income-ledger[index].expense;
  const accumulated = ledger.slice(0,index+1).reduce((sum,row)=>sum+row.income-row.expense,0);
  return {...ledger[index], period, accumulated};
}
export const migrationRecords = [
  {name:'Taller Norte', legacy:'customer = true', role:'Cliente', active:true},
  {name:'Suministros Sur', legacy:'supplier = true', role:'Proveedor', active:true},
  {name:'Archivo Este', legacy:'active = false', role:'Archivado', active:false}
];
export function migrateRecord(record) {
  return {name:record.name, customer_rank:record.role==='Cliente'?1:0, supplier_rank:record.role==='Proveedor'?1:0, active:record.active};
}
