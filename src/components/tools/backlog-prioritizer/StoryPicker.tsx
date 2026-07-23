/**
 * Lists Vertical Slicer stories for the active product that aren't yet plotted,
 * and adds them to the board as `StoryRef` + title snapshot. Items enter only as
 * stories from the slicer — there is no ad-hoc story entry (design.md Non-Goals);
 * the empty state routes upstream to the Vertical Slicer.
 */
import { Plus } from "lucide-react";
import type { SlicerStory } from "./slicer-source";

interface StoryPickerProps {
  /** Unplotted stories only. */
  stories: SlicerStory[];
  /** Whether the product has any stories at all (drives the empty state). */
  hasAnyStories: boolean;
  onAdd: (story: SlicerStory) => void;
}

export default function StoryPicker({ stories, hasAnyStories, onAdd }: StoryPickerProps) {
  return (
    <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
      <p className="text-caption font-semibold text-muted">Add a sliced story</p>

      {!hasAnyStories ? (
        <p className="mt-2 text-caption text-faint">
          No stories yet for this product.{" "}
          <a href="/tools/vertical-slicer/" className="text-accent-700 link-underline">
            Slice one in the Vertical Slicer →
          </a>
        </p>
      ) : stories.length === 0 ? (
        <p className="mt-2 text-caption text-faint">Every sliced story is already on the board.</p>
      ) : (
        <ul className="mt-2 grid gap-1.5">
          {stories.map((story) => (
            <li
              key={story.storyId}
              className="flex items-center justify-between gap-2 rounded-md bg-surface-raised p-2"
            >
              <span className="min-w-0 flex-1 truncate text-caption text-strong">{story.title}</span>
              <button
                type="button"
                onClick={() => onAdd(story)}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
              >
                <Plus size={12} strokeWidth={2.5} />
                Plot
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
