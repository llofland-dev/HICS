-- Staging Manager and Business Continuity Branch Director (plus their
-- sub-units) were seeded as tier='expansion', which hides them behind the
-- "Show expansion positions" checkbox by default. The client's own real
-- HICS org chart (Adventist HealthCare) draws both branches at the same
-- visual weight as the other Operations branches -- nothing marks them as
-- secondary/optional -- so this was a seeding error, not an intentional
-- distinction. Promote both branches and their direct children to core.
update public.positions
set tier = 'core'
where code in (
  'SM', 'PSTL', 'VSTL', 'ESTL', 'MSTL',
  'BCB', 'ITSU', 'SCU', 'RMU'
);
