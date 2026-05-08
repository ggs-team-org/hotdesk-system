import { toast } from "sonner";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function runAction(
  action: () => Promise<ActionResult>,
  messages: { loading: string; success: string },
): Promise<void> {
  const promise = action().then((result) => {
    if (!result.ok) throw new Error(result.error);
    return result;
  });

  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: (e: Error) => e.message ?? "Something went wrong",
  });

  await promise.catch(() => {});
}
