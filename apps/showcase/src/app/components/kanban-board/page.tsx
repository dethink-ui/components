import type { Metadata } from "next";
import {
  DocsPage,
  DocsSection,
  InstallationSection,
} from "@/components/docs-page";
import { ExampleBlock } from "@/components/example-block";
import { PropsTable } from "@/components/props-table";
import { KanbanHandle } from "@/examples/kanban-board/handle";
import { KanbanSprintBoard } from "@/examples/kanban-board/sprint-board";
import {
  kanbanBoardProps,
  kanbanCardStateProps,
  kanbanColumnProps,
} from "@/lib/props/kanban-board";

export const metadata: Metadata = {
  title: "KanbanBoard",
  description:
    "A kanban board with physical drag, keyboard moves, WIP limits, swimlanes, and optimistic saves that roll back.",
};

export default function KanbanBoardPage() {
  return (
    <DocsPage
      name="KanbanBoard"
      description="Move work between stages. Cards lift, tilt with your hand, and spring into place. Every drag has a keyboard and menu equivalent, WIP limits push back, and failed saves spring home."
    >
      <InstallationSection
        registryName="kanban-board"
        importCode={'import { KanbanBoard } from "@dethink/components";'}
      />
      <DocsSection
        id="examples"
        title="Examples"
        description="Controlled items, async saves, and cards you render yourself."
      >
        <div className="space-y-10">
          <ExampleBlock
            wide
            file="kanban-board/sprint-board.tsx"
            title="Sprint board"
            description="In progress has a hard limit of three, so it refuses a fourth card. In review has a soft limit and warns when it's over. Group by assignee for swimlanes. Turn on failed saves to see a card spring back with a retry."
          >
            <KanbanSprintBoard />
          </ExampleBlock>
          <ExampleBlock
            wide
            file="kanban-board/handle.tsx"
            title="Drag handle"
            description='With dragHandle="handle", only the grip starts a pointer drag, so card text stays selectable. Keyboard and menu moves still work on the whole card.'
          >
            <KanbanHandle />
          </ExampleBlock>
        </div>
      </DocsSection>
      <DocsSection id="api" title="API">
        <div className="space-y-8">
          <PropsTable caption="KanbanBoard props" rows={kanbanBoardProps} />
          <PropsTable caption="KanbanColumn" rows={kanbanColumnProps} />
          <PropsTable caption="renderCard state" rows={kanbanCardStateProps} />
        </div>
      </DocsSection>
      <DocsSection id="behavior" title="Moves, limits, and saves">
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            Items are one ordered array. Each item has an id, a columnId, and an
            optional laneId, and array order sets the order inside each cell.
            Every move is reported as a KanbanMove with a from and to location.
            You can use applyKanbanMove to apply one to your own store.
          </p>
          <p>
            If onMove returns a Promise, the board shows the card in its new
            place and marks it as saving until the Promise settles. When it
            resolves, the board calls onItemsChange. When it rejects, the card
            springs back to its last saved place, shows the message from
            getErrorMessage, and offers Retry. Re-applying a move is idempotent,
            so a store that also updates optimistically stays consistent.
          </p>
          <p>
            A numeric wipLimit is soft: the header meter turns red and says the
            column is over its limit, but drops still go through. A hard limit
            refuses cards that would push the column past its max, and explains
            why in the header, the move menu, and the live region. Reordering
            inside a full column always works. Use canMove for your own rules,
            and return a string to explain a refusal.
          </p>
        </div>
      </DocsSection>
      <DocsSection id="accessibility" title="Accessibility">
        <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
          <p>
            The board is a labelled region, each column a group, and each cell a
            list. Cards share one tab stop. Use the arrow keys to move between
            cards, and Home or End to jump to the ends of a column.
          </p>
          <p>
            Press Space or Enter to pick up a card. The arrow keys then move it
            within the column, into the next swimlane at the column&apos;s
            edges, or across columns, skipping columns that refuse it. Space or
            Enter drops the card, and Escape puts it back. Every step is
            announced with the column name and a one-based position.
          </p>
          <p>
            Each card also has a Move menu with up, down, top, bottom, column,
            and lane destinations. This gives single-pointer and switch users
            the same result without dragging, which WCAG 2.2 SC 2.5.7 requires.
            Pointer drags start after 5px with a mouse, or after a 180ms press
            on touch, so the page still scrolls. Reduced motion removes the
            tilt, lift, and springs, but keeps the announcements.
          </p>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
