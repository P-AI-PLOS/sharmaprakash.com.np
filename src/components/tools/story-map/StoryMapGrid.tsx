/**
 * Visual story-map grid: backbone (activities) across the top,
 * tasks below each activity, stories below tasks, release slices.
 * Purely presentational — receives data from StoryMapBuilder.
 */
import { GripVertical, Trash2 } from "lucide-react";

export interface StoryMapActivity {
  id: string;
  label: string;
  tasks: StoryMapTask[];
}

export interface StoryMapTask {
  id: string;
  label: string;
  stories: StoryMapStory[];
}

export interface StoryMapStory {
  id: string;
  text: string;
  activityId: string;
  taskId: string;
  releaseIdx: number;
}

interface StoryMapGridProps {
  activities: StoryMapActivity[];
  releases: string[];
  onDeleteStory: (storyId: string) => void;
  onDeleteTask: (activityId: string, taskId: string) => void;
  onDeleteActivity: (activityId: string) => void;
}

export default function StoryMapGrid({
  activities,
  releases,
  onDeleteStory,
  onDeleteTask,
  onDeleteActivity,
}: StoryMapGridProps) {
  if (activities.length === 0) return null;

  // Find max stories in any column for row count
  const maxStories = Math.max(
    1,
    ...activities.flatMap((a) => a.tasks.map((t) => t.stories.length)),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-caption">
        {/* Release labels as row headers */}
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-20 bg-surface-raised px-2 py-1 text-left text-muted">
              Release
            </th>
            {activities.map((activity) => (
              <th
                key={activity.id}
                colSpan={Math.max(1, activity.tasks.length)}
                className="border border-ink-200 bg-accent-50 px-3 py-2 text-center font-semibold text-accent-700"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="truncate">{activity.label}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteActivity(activity.id)}
                    aria-label={`Delete activity: ${activity.label}`}
                    className="shrink-0 text-accent-400 transition-colors hover:text-accent-700"
                  >
                    <Trash2 size={11} strokeWidth={2} />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Task headers */}
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-surface-raised px-2 py-1 text-left text-muted" />
            {activities.map((activity) =>
              activity.tasks.length > 0
                ? activity.tasks.map((task) => (
                    <th
                      key={task.id}
                      className="border border-ink-200 bg-surface-raised px-3 py-2 text-center font-semibold text-muted"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="truncate">{task.label}</span>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(activity.id, task.id)}
                          aria-label={`Delete task: ${task.label}`}
                          className="shrink-0 text-faint transition-colors hover:text-accent-700"
                        >
                          <Trash2 size={10} strokeWidth={2} />
                        </button>
                      </div>
                    </th>
                  ))
                : (
                    <th key={`empty-${activity.id}`} className="border border-ink-200 bg-surface-raised px-3 py-2 text-center text-faint">
                      (no tasks)
                    </th>
                  ),
            )}
          </tr>
        </thead>

        {/* Story rows */}
        <tbody>
          {Array.from({ length: maxStories }, (_, rowIdx) => (
            <tr key={rowIdx}>
              <td className="sticky left-0 z-10 bg-surface-raised px-2 py-1 text-muted">
                {releases[rowIdx] ?? `Row ${rowIdx + 1}`}
              </td>
              {activities.map((activity) =>
                activity.tasks.map((task) => {
                  const story = task.stories[rowIdx];
                  return (
                    <td
                      key={`${activity.id}-${task.id}-${rowIdx}`}
                      className="border border-ink-200 bg-surface-base px-2 py-1.5 align-top"
                    >
                      {story ? (
                        <div className="flex items-start gap-1 rounded-md bg-surface-raised px-2 py-1.5">
                          <GripVertical size={12} className="mt-0.5 shrink-0 text-faint" />
                          <span className="flex-1 text-muted leading-snug">{story.text}</span>
                          <button
                            type="button"
                            onClick={() => onDeleteStory(story.id)}
                            aria-label={`Delete story: ${story.text}`}
                            className="shrink-0 text-faint transition-colors hover:text-accent-700"
                          >
                            <Trash2 size={10} strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <span className="block h-8" />
                      )}
                    </td>
                  );
                }),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
