import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';

export function useSalaryRecords(monthStr: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['monthly-records', monthStr],
    queryFn: () => dataService.calculateMonthlyRecords(monthStr),
    staleTime: 1000 * 60,
  });

  const regenerateMutation = useMutation({
    mutationFn: () => dataService.generateMonthlyRecords(monthStr),
    onSuccess: (data) => {
      queryClient.setQueryData(['monthly-records', monthStr], data);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    ...query,
    records: query.data || [],
    regenerate: regenerateMutation.mutateAsync,
    isRegenerating: regenerateMutation.isPending,
  };
}
