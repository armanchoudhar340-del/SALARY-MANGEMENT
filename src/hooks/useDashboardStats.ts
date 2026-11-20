import { useQuery } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';

export function useDashboardStats(monthStr: string) {
  return useQuery({
    queryKey: ['dashboard-stats', monthStr],
    queryFn: () => dataService.getDashboardStats(monthStr),
    staleTime: 1000 * 20,
    refetchInterval: 30000, // 30 sec auto-refresh
  });
}
