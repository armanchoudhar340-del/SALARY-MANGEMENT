import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';
import { AttendanceRecord } from '../types';

export function useAttendance(monthStr?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['attendance', monthStr],
    queryFn: () => dataService.getAttendance(monthStr),
    staleTime: 1000 * 30,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: (rec: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>) =>
      dataService.markAttendance(rec),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
    },
  });

  const bulkMarkMutation = useMutation({
    mutationFn: (records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]) =>
      dataService.bulkMarkAttendance(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
    },
  });

  return {
    ...query,
    attendance: query.data || [],
    markAttendance: markAttendanceMutation.mutateAsync,
    isMarking: markAttendanceMutation.isPending,
    bulkMarkAttendance: bulkMarkMutation.mutateAsync,
    isBulkMarking: bulkMarkMutation.isPending,
  };
}
