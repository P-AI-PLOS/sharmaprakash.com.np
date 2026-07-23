/**
 * The worked example from the story mapping post: the onboarding journey,
 * re-sliced from "three sprints inside the first column" into a crude but
 * complete first release.
 *
 * Fixed narrative content — the essay refers back to it by name — so it is
 * hardcoded, read-only, and deliberately store-free: it never reads from or
 * writes to story-map-store, and a reader's own map at /tools/story-map/
 * can't change what this shows.
 */
import StoryMapGrid from "./StoryMapGrid";
import type { BackboneStep, ReleaseSlice, StoryCard } from "~/utils/story-map-store";

const steps: BackboneStep[] = [
  { id: "step-signup", text: "Sign up", order: 0 },
  { id: "step-project", text: "Set up project", order: 1 },
  { id: "step-invite", text: "Invite team", order: 2 },
  { id: "step-core", text: "Do core work", order: 3 },
  { id: "step-share", text: "Share result", order: 4 },
];

const slices: ReleaseSlice[] = [
  { id: "slice-mvp", name: "MVP", order: 0 },
  { id: "slice-r2", name: "Release 2", order: 1 },
];

const card = (
  id: string,
  stepId: string,
  sliceId: string | null,
  text: string,
  order: number,
): StoryCard => ({ id, stepId, sliceId, text, order });

const cards: StoryCard[] = [
  // The first slice: a complete journey, crudely.
  card("c1", "step-signup", "slice-mvp", "Sign up with an email and password", 0),
  card("c2", "step-project", "slice-mvp", "Create one project with a name", 0),
  card("c3", "step-invite", "slice-mvp", "Invite a teammate by email link", 0),
  card("c4", "step-core", "slice-mvp", "Add and edit the first item", 0),
  card("c5", "step-share", "slice-mvp", "Share a read-only link", 0),
  // The second slice thickens the same journey instead of lengthening one column.
  card("c6", "step-signup", "slice-r2", "Sign in with Google", 0),
  card("c7", "step-project", "slice-r2", "Start from a project template", 0),
  card("c8", "step-invite", "slice-r2", "Bulk-invite from a CSV", 0),
  card("c9", "step-core", "slice-r2", "Comment and assign work", 0),
  card("c10", "step-share", "slice-r2", "Export to PDF", 0),
  // Still unsliced — the polish that used to occupy three whole sprints.
  card("c11", "step-signup", null, "Password strength meter and email verification", 0),
  card("c12", "step-signup", null, "SSO and domain capture", 1),
  card("c13", "step-project", null, "Custom project fields", 0),
];

export default function StoryMapExample() {
  return (
    <section
      aria-label="Worked example: the onboarding story map"
      className="not-prose my-10 rounded-xl border border-ink-200 bg-surface-raised p-5 lg:p-7 shadow-md"
    >
      <p className="eyebrow mb-1">Worked example</p>
      <h3 className="text-h4 text-strong">The onboarding map, re-sliced</h3>
      <p className="mt-2 text-body text-muted">
        The same backbone read left to right as a user's day, cut into two releases. The first
        slice is complete but crude end to end; the second thickens it. What used to be three
        sprints of signup polish is still on the map — it just sits in the backlog band, where its
        real priority is visible.
      </p>
      <div className="mt-5">
        <StoryMapGrid steps={steps} slices={slices} cards={cards} readOnly />
      </div>
      <p className="mt-4 text-caption text-muted">
        <a href="/tools/story-map/" className="link-underline font-semibold text-accent-700">
          Build your own map →
        </a>
      </p>
    </section>
  );
}
