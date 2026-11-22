import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';
import { SalaryTransaction } from '../types';

export function useTransactions(monthStr?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', monthStr],
    queryFn: () => dataService.getTransactions(monthStr),
    staleTime: 1000 * 60,
  });

  const addTransactionMutation = useMutation({
    mutationFn: (tx: Omit<SalaryTransaction, 'id' | 'created_at' | 'updated_at'>) =>
      dataService.addTransaction(tx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SalaryTransaction> }) =>
      dataService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteTransaction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const snapshots = queryClient.getQueriesData<SalaryTransaction[]>({ queryKey: ['transactions'] });
      snapshots.forEach(([queryKey, current]) => {
        if (current) {
          queryClient.setQueryData<SalaryTransaction[]>(
            queryKey,
            current.filter((transaction) => transaction.id !== id)
          );
        }
      });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
    },
  });

  return {
    ...query,
    transactions: query.data || [],
    addTransaction: addTransactionMutation.mutateAsync,
    isAdding: addTransactionMutation.isPending,
    updateTransaction: updateTransactionMutation.mutateAsync,
    isUpdating: updateTransactionMutation.isPending,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isDeleting: deleteTransactionMutation.isPending,
  };
}
