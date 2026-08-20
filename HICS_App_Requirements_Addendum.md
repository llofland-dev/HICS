# Addendum: Multi-Facility Scale, ICS 213, and AAR Export

Builds on `HICS_App_Carryover_Spec.md`. Covers four requirements that change or extend the
original data model — read this before schema design goes further, since #1 affects almost
every other table.

## 1. Multi-facility / system-wide incidents (the "9/11 scenario")

**The problem with the original model:** it assumed one incident = one facility = one HICS
activation. A system-wide event means multiple hospitals within the same health system are
each running their own HICS activation *simultaneously*, in response to the *same* event —
and someone at the system level needs visibility across all of them.

**Recommended structure — two levels, not one:**

- `organizations` — the health system itself, and each member facility as a row
  (id, name, type: "system" | "facility", parent_org_id for facility → system linkage)
- `events` — the system-wide incident (id, name, date, type, status) — this is the "9/11" or
  "regional mass casualty" level record
- `incidents` — a facility's own HICS activation, now with an `event_id` foreign key linking it
  to the parent event (nullable — most incidents are single-facility and never need a parent
  event) and a `facility_org_id` identifying which facility this activation belongs to

Each facility's `incidents` row keeps everything already speced: its own IC, its own org chart,
its own assignments, its own messages, its own AAR. Nothing about a single facility's HICS
activation changes. What's new is the option to link several of those under one `event_id`.

**System-level view (new):** a rollup screen scoped to an `event_id` showing, across all linked
facility incidents: which facilities have activated, who each facility's IC is, aggregate
position-fill status, and a merged/filterable message log across facilities (see ICS 213 below).
This is a read-only aggregation, not a new layer of HICS positions — there's no "system IC"
position in the standard taxonomy to invent; system-level coordination in real HICS/NIMS happens
through Liaison Officers and inter-facility messaging, not a new command tier.

**Permissions implication — resolved design, based on ICS Unity of Command:**
This mirrors how Task Force Leaders operate in US&R: any facility IC can see the system-level
rollup, but editing stays strictly confined to your own facility.

- **View:** any facility IC (or authorized facility staff) can see the read-only system-level
  rollup for events their facility is linked to — aggregate status, other facilities' ICs, the
  cross-facility message log.
- **Edit — facility scope:** a facility's staff can only create/modify assignments, messages, and
  AAR data for their *own* `incident_id`. No facility can write into another facility's incident
  data, regardless of role. Each facility retains full command authority over its own HICS
  activation — this is Unity of Command, not a gap to close.
- **Edit — event scope (separate, narrow permission):** creating an event, linking/unlinking a
  facility's incident to it, and closing the event out are their own limited set of actions, held
  by a distinct system-level role (health system EOC/emergency management staff, most likely) —
  not general edit access to any facility's data.
- **Cross-facility coordination happens through ICS 213 messages, not direct edits.** If one
  facility needs something from another, that's a message between them, not a write into the
  other facility's records.

In Supabase terms, this is enforceable directly with Row Level Security: edit policies scoped by
matching the user's assigned `facility_org_id` to the record's `facility_org_id`, a separate read
policy for anything linked to an `event_id` the user's facility participates in, and a distinct
role/claim for the small set of event-management actions.

## 2. ICS 213 — General Message

Verified against the actual FEMA ICS-213 form. Fields, exactly as the real form uses them:

- Incident Name *(optional)*
- To — Name and Position
- From — Name and Position
- Subject
- Date
- Time
- Message *(body text)*
- Approved By — Name, Signature, Position/Title
- Reply *(text)*
- Replied By — Name, Position/Title, Signature
- Reply Date / Time

**Real-world purpose (per FEMA):** used to record and route messages between ICS positions when
verbal communication isn't practical, or when a written record is needed — e.g., resource
requests, coordination notices, status updates between positions or between facilities in a
system event. A copy is always retained by the Documentation Unit for the incident record.

**Suggested table:** `messages` (id, incident_id, event_id nullable — for cross-facility messages
in a system event, to_name, to_position_code, from_name, from_position_code, subject, sent_date,
sent_time, body, approved_by_name, approved_by_signature, approved_by_position, reply_body,
replied_by_name, replied_by_position, reply_date, reply_time, created_at).

This should support both intra-facility messages (between positions at one hospital) and, for a
linked `event_id`, inter-facility messages (e.g., one hospital's IC messaging another hospital's
IC or the system-level coordinator) — same table, same form, just scoped differently.

## 3. Expansion as the incident grows

Already covered in the base spec (core/expansion position tiers) — now applies at two levels
simultaneously:
- **Within a facility:** more positions activated as that facility's incident scales up (unchanged
  from the original spec).
- **Across the system:** more facilities' incidents get linked under the same `event_id` as the
  event's scope widens. The system rollup view should update automatically as facilities join.

## 4. Export for formal AAR

A facility's AAR export should include everything tied to its `incident_id`: narrative fields
(summary, what went well, needs improvement, action items), the full position roster at time of
incident (who was assigned where, qualified or not), and the complete ICS 213 message log for
that incident.

For a system-wide event, there should additionally be a **combined export scoped to `event_id`**
— every linked facility's AAR data plus the cross-facility message log, assembled into one
package. This is the artifact that would actually get used for a real system-wide after-action
review meeting.

**Format:** support both a formatted, readable export (PDF, print-ready, EPS-branded per the
copyright footer standard already noted in the base spec) and a structured raw-data export
(CSV/JSON per incident or per event) — the formatted version is for the AAR meeting itself, the
raw export is for archiving or feeding into further analysis.
