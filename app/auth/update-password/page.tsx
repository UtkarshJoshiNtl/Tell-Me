import { UpdatePasswordForm } from "@/components/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New password</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Choose a password for your account.</p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
