import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  resetWindow,
  adjustLimit,
  resetLimitToDefault,
  addExtra,
  pauseUser,
  unlockUser,
  queryKeys,
} from "../../../lib/api";

function extractServerErrorMessage(error: unknown): string | undefined {
  if (error !== null && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;
    const message = response?.data?.message;
    if (typeof message === "string") return message;
  }
  return undefined;
}

function showErrorToast(title: string, error: unknown) {
  const serverMessage = extractServerErrorMessage(error);
  toast.error(title, { description: serverMessage });
}

function useAdminActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

  const resetWindowMutation = useMutation({
    mutationFn: resetWindow,
    onSuccess: (_data, userId) => {
      invalidate();
      toast.success(`${userId} window reset`);
    },
    onError: (error, userId) =>
      showErrorToast(`Failed to reset ${userId} window`, error),
  });

  const adjustLimitMutation = useMutation({
    mutationFn: ({ userId, limit }: { userId: string; limit: number }) =>
      adjustLimit(userId, limit),
    onSuccess: (_data, { userId }) => {
      invalidate();
      toast.success(`${userId} limit adjusted`);
    },
    onError: (error, { userId }) =>
      showErrorToast(`Failed to adjust ${userId} limit`, error),
  });

  const resetLimitMutation = useMutation({
    mutationFn: resetLimitToDefault,
    onSuccess: (_data, userId) => {
      invalidate();
      toast.success(`${userId} limit reset to default`);
    },
    onError: (error, userId) =>
      showErrorToast(`Failed to reset ${userId} limit`, error),
  });

  const addExtraMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
      addExtra(userId, amount),
    onSuccess: (_data, { userId }) => {
      invalidate();
      toast.success(`${userId} extra requests added`);
    },
    onError: (error, { userId }) =>
      showErrorToast(`Failed to add extra requests for ${userId}`, error),
  });

  const pauseMutation = useMutation({
    mutationFn: ({ userId, seconds }: { userId: string; seconds: number }) =>
      pauseUser(userId, seconds),
    onSuccess: (_data, { userId }) => {
      invalidate();
      toast.success(`${userId} paused`);
    },
    onError: (error, { userId }) =>
      showErrorToast(`Failed to pause ${userId}`, error),
  });

  const unlockMutation = useMutation({
    mutationFn: unlockUser,
    onSuccess: (_data, userId) => {
      invalidate();
      toast.success(`${userId} unlocked`);
    },
    onError: (error, userId) =>
      showErrorToast(`Failed to unlock ${userId}`, error),
  });

  return {
    resetWindowMutation,
    adjustLimitMutation,
    resetLimitMutation,
    addExtraMutation,
    pauseMutation,
    unlockMutation,
  };
}

export { useAdminActions };
