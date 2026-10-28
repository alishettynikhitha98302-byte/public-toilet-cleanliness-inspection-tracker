-- Run after migration and after at least one operator profile exists.
-- Uses only synthetic facilities and explicitly labeled demonstration records.
insert into public.facilities(name,address,district,facility_type,accessibility,inspection_interval_days,created_by)
select f.name,f.address,f.district,f.facility_type,f.accessibility,f.inspection_interval_days,p.id
from (values
 ('Riverside Gardens Washroom','12 Riverwalk Lane','North Ward','park',true,7),
 ('Central Market Public Conveniences','4 Market Square','Central Ward','market',true,3),
 ('Civic Transit Exchange Restrooms','88 Station Approach','Central Ward','transit',true,2),
 ('Eastbank Community Park Facilities','25 Willow Road','East Ward','park',false,7),
 ('Harbor Promenade Public Toilet','2 Seafront Walk','Harbor Ward','public',true,5),
 ('Old Town Library Washroom','10 Archive Street','Central Ward','public',true,7),
 ('Meadowview Recreation Ground','54 Field Lane','East Ward','park',false,7),
 ('Northgate Bus Terminal','1 Northgate Avenue','North Ward','transit',true,2)
) as f(name,address,district,facility_type,accessibility,inspection_interval_days)
cross join lateral (select id from public.profiles where role in ('operator','admin') order by created_at limit 1) p
on conflict(name,address) do nothing;

insert into public.inspections(facility_id,inspector_id,scheduled_for,status,checklist,notes,result,completed_at)
select f.id,p.id,current_date - ((row_number() over(order by f.name)::int % 6)),'complete',
 case when f.name='Central Market Public Conveniences' then '{"cleanliness":2,"supplies":2,"fixtures":4,"accessibility":4,"safety":3}'::jsonb
 else '{"cleanliness":4,"supplies":5,"fixtures":4,"accessibility":4,"safety":5}'::jsonb end,
 'Synthetic demonstration inspection.',
 case when f.name='Central Market Public Conveniences' then 'fail' else 'pass' end,now()
from public.facilities f
cross join lateral (select id from public.profiles where role in ('operator','admin') order by created_at limit 1) p
where not exists(select 1 from public.inspections i where i.facility_id=f.id and i.notes='Synthetic demonstration inspection.');

insert into public.defects(inspection_id,facility_id,title,description,severity,status,reported_by,due_at)
select i.id,i.facility_id,'Soap dispenser needs attention','Dispenser intermittently fails; refill and check mechanism.','medium','open',i.inspector_id,now()+interval '1 day'
from public.inspections i join public.facilities f on f.id=i.facility_id
where i.notes='Synthetic demonstration inspection.' and f.name='Central Market Public Conveniences'
and not exists(select 1 from public.defects d where d.inspection_id=i.id);
