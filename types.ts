export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  position?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  basicSalary: number;
  allowances: number;
  grossSalary: number;
  ssnitEmployee: number; // 5.5%
  ssnitEmployer: number; // 13%
  taxableIncome: number;
  paye: number; // GRA Tax
  deductions: number;
  netSalary: number;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
  payPeriod: string; // e.g., "October 2023"
}

export interface KPIStats {
  totalEmployees: number;
  averageSalary: number;
  totalOutstanding: number;
  totalRequests: number;
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}