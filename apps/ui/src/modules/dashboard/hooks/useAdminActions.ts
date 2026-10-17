import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  resetWindow,
  adjustLimit,
  resetLimitToDefault,
  addExtra,
  pauseUser,
  unlockUser,
  queryKeys,
} from "../../../lib/api";

function useAdminActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

  const resetWindowMutation = useMutation({
    mutationFn: resetWindow,
    onSuccess: invalidate,
  });

  const adjustLimitMutation = useMutation({
    mutationFn: ({ userId, limit }: { userId: string; limit: number }) =>
      adjustLimit(userId, limit),
    onSuccess: invalidate,
  });

  const resetLimitMutation = useMutation({
    mutationFn: resetLimitToDefault,
    onSuccess: invalidate,
  });

  const addExtraMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
      addExtra(userId, amount),
    onSuccess: invalidate,
  });

  const pauseMutation = useMutation({
    mutationFn: ({ userId, seconds }: { userId: string; seconds: number }) =>
      pauseUser(userId, seconds),
    onSuccess: invalidate,
  });

  const unlockMutation = useMutation({
    mutationFn: unlockUser,
    onSuccess: invalidate,
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
