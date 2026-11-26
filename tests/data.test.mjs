import test from 'node:test';
import assert from 'node:assert/strict';
import {reportAt,ledger,migrationRecords,migrateRecord} from '../content.js';

test('el acumulado coincide con el resultado del primer mes al iniciar el ejercicio',()=>{
  assert.equal(reportAt(0).period,6000);
  assert.equal(reportAt(0).accumulated,6000);
});
test('el mes y el acumulado usan el mismo conjunto de movimientos',()=>{
  assert.equal(reportAt(2).period,5000);
  assert.equal(reportAt(2).accumulated,19000);
  assert.equal(reportAt(5).accumulated,48000);
  for(let i=1;i<ledger.length;i++) assert.equal(reportAt(i).accumulated-reportAt(i-1).accumulated,reportAt(i).period);
});
test('no acepta meses fuera del ejercicio',()=>{
  for(const invalid of [-1,6,NaN,1.5]) assert.throws(()=>reportAt(invalid),RangeError);
});
test('la adaptación conserva identidad y archivo y traduce los roles',()=>{
  const migrated=migrationRecords.map(migrateRecord);
  assert.equal(migrated.length,migrationRecords.length);
  assert.deepEqual(migrated.map(r=>r.name),migrationRecords.map(r=>r.name));
  assert.equal(migrated[0].customer_rank,1);
  assert.equal(migrated[1].supplier_rank,1);
  assert.equal(migrated[2].active,false);
  assert.equal(migrated[2].customer_rank,0);
  assert.equal(migrated[2].supplier_rank,0);
});
