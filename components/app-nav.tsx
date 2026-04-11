import Link from "next/link";

const linkClass = "text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100";
const activeClass =
  "text-sm font-medium text-zinc-900 dark:text-zinc-50 border-b border-zinc-900 dark:border-zinc-50 pb-0.5";

export function AppNav({ path }: { path: "/tasks" | "/finance" }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      <nav className="flex gap-6">
        <Link href="/tasks" className={path === "/tasks" ? activeClass : linkClass}>
          Tasks
        </Link>
        <Link href="/finance" className={path === "/finance" ? activeClass : linkClass}>
          Finance
        </Link>
      </nav>
      <form action="/auth/sign-out" method="post">
        <button
          type="submit"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
