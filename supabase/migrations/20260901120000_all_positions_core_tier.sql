-- Every position still marked tier='expansion' was individually checked
-- against the client's real HICS org chart (Adventist HealthCare) and found
-- to have a real, equal-weight box there -- Command's M/T Specialist,
-- Finance's Compensation/Cost/Procurement units, all of Logistics's unit
-- leaders, the remaining Operations branch sub-units, and Planning's
-- Demobilization/tracking-manager positions. The chart draws nothing as
-- optional, so nothing in this taxonomy should render as hidden-by-default
-- either. Promote everything remaining to core.
update public.positions
set tier = 'core'
where tier = 'expansion';
