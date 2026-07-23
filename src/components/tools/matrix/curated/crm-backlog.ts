/**
 * Curated item set for "Sorting a CRM Backlog by How Well It's Actually Understood".
 * Every item's text, zone, and reasoning is drawn from that post's
 * "Running it on Donut CRM's quarter backlog" section — nothing invented.
 */
import type { MatrixItem } from "../AgreementCertaintyMatrix";

export const CRM_BACKLOG_ITEMS: MatrixItem[] = [
  {
    id: "crm-pipeline-view",
    text: "Show last-activity date instead of created date on pipeline deal cards, so reps stop opening deals to check something the list view could tell them at a glance.",
    zone: "simple",
    why: "Everyone agreed within a minute, and the team has shipped a dozen similar list/card tweaks before. No debate, no workshop — put it in next sprint and build it. The only mistake a team makes here is holding a discussion at all.",
  },
  {
    id: "crm-email-deliverability",
    text: "Sequence emails from the CRM are landing in spam for a meaningful slice of one email provider's inboxes.",
    zone: "complicated",
    why: "The team agreed unanimously it needed fixing — nobody disputed the goal — but almost nobody in the room understood SPF, DKIM, and sender-reputation mechanics well enough to say what would fix it. The right move was pulling in someone who actually knows email infrastructure, not more debate.",
  },
  {
    id: "crm-handoff-redesign",
    text: "Redesign the sales-to-marketing handoff: marketing wants every form submission routed through a lead-scoring queue first; sales wants direct access to anything that looks like a hot lead.",
    zone: "complex",
    why: "The note that moved around the board three times. \"Protect lead quality\" versus \"protect response speed\" were in real tension, and nobody was certain which handoff design would produce better outcomes. The group scoped a two-week pilot — score-and-route for one lead segment, both teams watching the same dashboard — as a probe before committing either camp's design.",
  },
  {
    id: "crm-data-integrity-incident",
    text: "A recent import job silently merged several thousand contact records incorrectly, and companies are now missing linked deals.",
    zone: "chaotic",
    why: "That's not a backlog item, it's a fire. It went straight to \"stop the sync job, restore from backup, then talk\" — Chaotic doesn't get a facilitated conversation, it gets an incident response.",
  },
];
