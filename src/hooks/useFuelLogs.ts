import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FuelLog } from '../types';
import { dataService } from '../lib/dataService';

export function useFuelLogs() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['fuel-logs'],
    queryFn: () => dataService.getFuelLogs(),
    staleTime: 1000 * 60,
  });

  const addMutation = useMutation({
    mutationFn: (log: Omit<FuelLog, 'id' | 'created_at' | 'updated_at'>) =>
      dataService.addFuelLog(log),
    onSuccess: (saved) => {
      queryClient.setQueryData<FuelLog[]>(['fuel-logs'], (current) => [saved, ...(current || [])]);
    },
  });

  return {
    ...query,
    fuelLogs: query.data || [],
    addFuelLog: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
  };
}
