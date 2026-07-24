# pipeline-data-contract Delta — Draft OKR handoff marker

Delta against the `pipeline-data-contract` capability (introduced by the
`donut-crm-pipeline-data-contract` change). Adds the one contract-level shape
OKR Check-In needs that the base contract does not define: the draft marker on
OKR records that carries Stage 06's output back into Stage 01. Added here (not
modified) because it is a new concern layered onto the existing contract, and
the contract's design.md directs tools to extend it via a delta rather than
invent parallel shapes.

## ADDED Requirements

### Requirement: Draft OKR handoff marker
OKR records in OKR Organizer's store (`pm-okr-v1`) SHALL support two optional
contract-level fields: `draft: true`, present only while the record is an
unaccepted draft, and `draftedFrom: { checkinId: string; quarterKey: string }`
identifying the check-in record and closed quarter that produced it. Only OKR
Check-In SHALL create records carrying these fields, and it SHALL create them
through OKR Organizer's store with the contract's OKR record shape — never a
private copy in another store. OKR Organizer SHALL render draft records
visibly distinct from committed entries with an accept action that clears the
`draft` flag (retaining `draftedFrom` as provenance), and records lacking the
`draft` field SHALL behave exactly as before this delta.

#### Scenario: Draft record surfaces in OKR Organizer
- **WHEN** OKR Organizer lists entries for a product that includes a record
  with `draft: true` and `draftedFrom` set
- **THEN** the record is shown marked as a draft produced by a check-in,
  distinct from committed entries

#### Scenario: Accepting a draft commits it
- **WHEN** the visitor accepts a draft OKR record in OKR Organizer
- **THEN** the `draft` flag is cleared, `draftedFrom` is retained, and the
  record thereafter behaves as a normal committed entry

#### Scenario: Records without the field are unaffected
- **WHEN** an OKR record created before this delta (no `draft` field) is
  listed or edited
- **THEN** its behavior is unchanged in every tool that reads OKR records
