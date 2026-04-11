import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          We will email you a link to choose a new password.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
