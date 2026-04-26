import TopBarBlock from "./components/UI/TopBarBlock";
import TimelineBlock from "./components/UI/TimelineBlock";
import MainFieldBlock from "./components/UI/MainFieldBlock";
import BottomBlock from "./components/UI/BottomBlock";
import ActionsBar from "./components/UI/ActionsBar";
import RightBlock from "./components/UI/RightBlock";
import { ToastStack } from "./components/UI/NotificationProvider";

export default function Home() {
  return (
    <main className="flex h-screen max-h-screen overflow-hidden bg-slate-950 text-gray-100">
      {/* Left rail — matches right rail chrome (accent border + gradient) */}
      <aside className="sticky top-0 z-20 flex h-screen shrink-0 flex-col overflow-hidden border-r-2 border-cyan-500/55 bg-linear-to-b from-gray-900 to-gray-950">
        <div className="min-h-0 w-fit min-w-[18rem] max-w-md flex-1 overflow-hidden">
          <TimelineBlock />
        </div>
      </aside>

      {/* Center column — top bar, main field, bottom deck bar share this width */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 z-40 border-b border-slate-800/80 bg-slate-950/80 shadow-md shadow-black/30 backdrop-blur-md">
          <TopBarBlock />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <MainFieldBlock />
        </div>

        {/* Deck + selection strip: in-bounds for pile "click outside" (don’t close when using Actions bar, etc.) */}
        <div className="flex shrink-0 flex-col" data-bottom-deck-skip-outside>
          <ActionsBar />
          <div className="relative z-30 shrink-0">
            <ToastStack />
            <BottomBlock />
          </div>
        </div>
      </div>

      {/* Right rail — full height, width fits content */}
      <aside className="sticky top-0 z-20 flex h-screen shrink-0 flex-col overflow-hidden border-l-2 border-amber-600/70 bg-linear-to-b from-gray-900 to-gray-950">
        <div className="min-h-0 w-fit min-w-[20rem] max-w-md flex-1 overflow-y-auto overflow-x-hidden">
          <RightBlock />
        </div>
      </aside>
    </main>
  );
}
