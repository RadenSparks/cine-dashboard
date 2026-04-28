import { dashboardFooterCopy } from "../../data/dashboardNavigation";

export default function Footer() {
  return (
    <footer className="border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,250,252,0.95)_100%)] backdrop-blur dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.92)_0%,rgba(15,23,42,0.96)_100%)]">
      <div
        className="mx-auto flex w-full max-w-screen-2xl flex-col gap-2 px-4 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8 xl:px-14 dark:text-slate-400"
        style={{ fontFamily: "Red Rose, sans-serif" }}
      >
        <span>Cine Dashboard</span>
        <span className="text-left md:text-right">&copy; {new Date().getFullYear()} {dashboardFooterCopy}.</span>
      </div>
    </footer>
  );
}
