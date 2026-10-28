import test from 'node:test';
import assert from 'node:assert/strict';
import { facilitySchema, inspectionSchema, defectSchema } from '../src/lib/validation.js';

test('facility accepts valid values and rejects mass assignment',()=>{
 const good={name:'Riverside Gardens',address:'12 Riverwalk Lane',district:'North Ward',facility_type:'park',accessibility:true,inspection_interval_days:7};
 assert.equal(facilitySchema.parse(good).name,'Riverside Gardens');
 assert.equal(facilitySchema.safeParse({...good,role:'admin'}).success,false);
 assert.equal(facilitySchema.safeParse({...good,inspection_interval_days:0}).success,false);
});
test('inspection requires all bounded checklist scores',()=>{
 const good={facility_id:'00000000-0000-4000-8000-000000000000',scheduled_for:'2026-10-28',checklist:{cleanliness:4,supplies:3,fixtures:5,accessibility:4,safety:5},notes:''};
 assert.equal(inspectionSchema.safeParse(good).success,true);
 assert.equal(inspectionSchema.safeParse({...good,checklist:{cleanliness:9}}).success,false);
});
test('defect validates severity, due date and strict fields',()=>{
 const good={inspection_id:'00000000-0000-4000-8000-000000000000',title:'Leaking basin tap',description:'',severity:'medium',due_at:'2026-10-29T08:00:00.000Z'};
 assert.equal(defectSchema.safeParse(good).success,true);
 assert.equal(defectSchema.safeParse({...good,severity:'urgent'}).success,false);
 assert.equal(defectSchema.safeParse({...good,facility_id:'bad'}).success,false);
});
