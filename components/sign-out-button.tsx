"use client";

export function SignOutButton() {
  return (
    <form
      action="/auth/sign-out"
      method="post"
      onSubmit={(e) => {
        if (!window.confirm("Sign out of Tell Me?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        Sign out
      </button>
    </form>
  );
}
