import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';
import { Employee } from '../types';

export function useEmployees() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['employees'],
    queryFn: () => dataService.getEmployees(),
    staleTime: 1000 * 60,
  });

  const addEmployeeMutation = useMutation({
    mutationFn: (emp: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) =>
      dataService.addEmployee(emp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      dataService.updateEmployee(id, updates),
    onSuccess: (updatedEmployee) => {
      queryClient.setQueryData<Employee[]>(['employees'], (current) =>
        current?.map((employee) => employee.id === updatedEmployee.id ? updatedEmployee : employee)
      );
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
    },
  });

  const toggleEmployeeActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      dataService.updateEmployee(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
    },
  });

  return {
    ...query,
    employees: query.data || [],
    addEmployee: addEmployeeMutation.mutateAsync,
    isAdding: addEmployeeMutation.isPending,
    updateEmployee: updateEmployeeMutation.mutateAsync,
    isUpdating: updateEmployeeMutation.isPending,
    toggleEmployeeActive: toggleEmployeeActiveMutation.mutateAsync,
  };
}
