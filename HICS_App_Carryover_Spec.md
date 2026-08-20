# Carryover from the EPS HICS Excel Tool → App Build

This documents the parts of the existing EPS HICS Activation System (Excel) that are directly
reusable for the app, so the core logic doesn't need to be re-derived from scratch. Position
taxonomy itself is in `hics_positions_seed.json` / `.csv` — this doc covers everything else.

## 1. Data model patterns that already work

**Staff Roster + Qualification Matrix**
The Excel tool models qualification as: one row per staff member, one column per HICS position,
`Y` if that person is trained/qualified for that role. In relational terms this is:

- `staff` (id, name, role_title, phone, email, notes)
- `positions` (code, title, section, reports_to_code, tier, description) — this is the seed data
- `staff_qualifications` (staff_id, position_code, qualified boolean) — join table

This structure held up well and should carry over as-is.

**Incidents as first-class records**
Each incident (or drill) needs its own activation record — who was assigned to which position,
for that specific event. In Excel this was one "Incident Activation" tab per file/session; in the
app this is naturally: `incidents` (id, name, date, type, status) → `assignments` (incident_id,
position_code, staff_id, assigned_at).

## 2. Core business logic to preserve

**Soft-flag qualification check (this is the central feature of the whole tool)**
Any staff member can be assigned to any position — schools/hospitals are short-staffed during a
real incident, so hard-blocking isn't realistic. But if the assigned person isn't marked qualified
for that position, the UI should show a clear warning indicator next to their name. This check
should run live as soon as an assignment is made, not just on save.

**Tiered activation (core vs. expansion)**
Positions are tagged `core` (shown by default — the initial command structure for almost any
incident) or `expansion` (hidden by default, activated as the incident grows). The UI should not
show all 67 positions at once — default view shows core positions only, with an obvious way to
pull in expansion positions as needed. This was originally framed as "school-appropriate trimming"
but it's really just "typical initial activation vs. full incident scale-up," which applies to
hospitals too.

**Custom/local positions**
Beyond the standard HICS taxonomy, there should be a way to add an ad-hoc position specific to one
facility that isn't in the standard list at all — free-text title, assign a staff member, no
qualification tracking (since there's no seed data to check against).

## 3. Derived views worth building as reports, not re-entry

**Communications List (Name / Position / Normal Role / Phone)**
Once positions are assigned in an incident, this view should generate itself — no manual re-entry.
It's just a join across `assignments` → `staff` → `positions`, filtered to assigned (non-null)
rows. This maps to the real HICS 205A form.

**Org chart (visual)**
Command Staff at top, four Section Chiefs below, branches/units nested under their chief,
color-coded by section (Command / Operations / Planning / Logistics / Finance). Should update live
as assignments change. This is a good reference for initial UI layout, not a pixel-perfect spec.

**After Action Review (AAR)**
Per-incident narrative fields (summary, what went well, what needs improvement, action items) plus
the position roster at time of incident, formatted as a printable/exportable report.

## 4. What NOT to carry over

- Anything about column widths, print page setup, cell merging — that's Excel-specific plumbing,
  not a real requirement.
- The single-file-per-session model — the whole point of the app is to fix this with a real
  database and incident history/search, which Excel couldn't do.

## 5. Branding standard (applies to any exported document)

Any PDF/report the app generates (AAR export, communications list export, etc.) should include a
footer copyright statement attributing only Emergency Preparedness Solutions, LLC — e.g.
"© [year] Emergency Preparedness Solutions, LLC" — never a client organization.
