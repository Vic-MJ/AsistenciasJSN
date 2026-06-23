import { Employee, Schedule, Area } from '../../lib/api';

export interface BaseModalProps {
  onClose: () => void;
}

export interface EmployeeManagementState {
  employees: Employee[];
  schedules: Schedule[];
  areas: Area[];
  users: any[];
  loading: boolean;
  selectedIds: string[];
}
