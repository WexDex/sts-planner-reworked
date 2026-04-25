import TopBarBlock from "./components/UI/TopBarBlock";
import TimelineBlock from "./components/UI/TimelineBlock";
import MainFieldBlock from "./components/UI/MainFieldBlock";
import BottomBlock from "./components/UI/BottomBlock";
import ActionsBar from "./components/UI/ActionsBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-gray-100 flex pb-28">
      <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
        <TimelineBlock />
      </div>
      <div className="flex-1 flex flex-col">
        <TopBarBlock />
        <div className="flex-1 p-4">
          <MainFieldBlock />
        </div>
        <div className="w-full">
          <BottomBlock />
        </div>
      </div>
      <ActionsBar />
    </main>
  );
}
