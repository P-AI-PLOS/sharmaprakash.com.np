/**
 * Curated item set for "Triaging Flaky Tests Before Choosing a Fix".
 * Every item's text, zone, and reasoning is drawn from that post's
 * "Applying it to shortest's flaky tests" section — nothing invented.
 */
import type { MatrixItem } from "../AgreementCertaintyMatrix";

export const FLAKY_TEST_ITEMS: MatrixItem[] = [
  {
    id: "flaky-timing-race",
    text: "A generated test asserts on an element before an async render finishes; a shared test-data fixture mutates across parallel runs.",
    zone: "simple",
    why: "These went here almost unanimously and fast. Everyone in the room had seen these exact failure signatures before, everyone agreed on the fix — explicit wait conditions, fixture isolation — and the only real decision was who picked up the ticket that week.",
  },
  {
    id: "flaky-ci-drift",
    text: "CI containers under memory pressure produce different timing than local runs, and browser driver versions drift between environments.",
    zone: "complicated",
    why: "The room agreed these were real, but nobody present actually knew the fix; it needed someone who understood the CI runner configuration deeply. That's a different kind of ticket than \"add a wait\" — it needs an infra specialist brought in, not another engineer guessing at retry counts.",
  },
  {
    id: "flaky-cause-unclear",
    text: "Is this test flaky because the UI is genuinely nondeterministic, because the natural-language test generation produced a brittle assertion, or because the feature itself behaves inconsistently and the test is correctly catching it?",
    zone: "complex",
    why: "No agreement on placement at all, and the debate ran twice as long as everything else combined — different people were confident in different, contradictory explanations. No best practice exists yet because the group doesn't even agree what's causing the symptom. We scoped a two-week experiment to tag a sample of flaky failures by suspected cause, deferring any permanent fix until the probe reported back.",
  },
  {
    id: "flaky-release-freeze-spike",
    text: "A sudden spike in flaky failures right before a customer's release freeze.",
    zone: "chaotic",
    why: "Nothing landed in Chaotic that day, though it's worth noting for shortest specifically: this would belong there — stabilize the pipeline first, understand causes later. The matrix makes that distinction visible before someone tries to run a root-cause investigation during a fire.",
  },
];
