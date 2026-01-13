
import { PayrollRecord } from '../types';

// Ghana Revenue Authority (GRA) Tax Bands (Monthly - 2023/2024)
const calculatePAYE = (chargeableIncome: number): number => {
  let tax = 0;
  let remainingIncome = chargeableIncome;

  // Band 1: First 490 (0%)
  if (remainingIncome <= 490) return 0;
  remainingIncome -= 490;

  // Band 2: Next 110 (5%)
  const band2 = 110;
  if (remainingIncome <= band2) return tax + (remainingIncome * 0.05);
  tax += band2 * 0.05;
  remainingIncome -= band2;

  // Band 3: Next 130 (10%)
  const band3 = 130;
  if (remainingIncome <= band3) return tax + (remainingIncome * 0.10);
  tax += band3 * 0.10;
  remainingIncome -= band3;

  // Band 4: Next 3000 (17.5%)
  const band4 = 3000;
  if (remainingIncome <= band4) return tax + (remainingIncome * 0.175);
  tax += band4 * 0.175;
  remainingIncome -= band4;

  // Band 5: Next 16395 (25%)
  const band5 = 16395;
  if (remainingIncome <= band5) return tax + (remainingIncome * 0.25);
  tax += band5 * 0.25;
  remainingIncome -= band5;

  // Band 6: Next 29875 (30%)
  const band6 = 29875;
  if (remainingIncome <= band6) return tax + (remainingIncome * 0.30);
  tax += band6 * 0.30;
  remainingIncome -= band6;

  // Band 7: Exceeding (35%)
  tax += remainingIncome * 0.35;

  return parseFloat(tax.toFixed(2));
};

export const calculatePayroll = (
  employeeId: string,
  name: string,
  dept: string,
  role: string,
  basic: number,
  allowances: number
): PayrollRecord => {
  const gross = basic + allowances;
  
  // SSNIT Tier 1 (Employee 5.5%)
  const ssnitEmp = parseFloat((basic * 0.055).toFixed(2));
  
  // SSNIT Tier 2/Employer (13%)
  const ssnitEmplr = parseFloat((basic * 0.13).toFixed(2));
  
  // Taxable Income (Basic + Allowances - SSNIT Employee Contribution)
  const taxableIncome = parseFloat((gross - ssnitEmp).toFixed(2));
  
  const paye = calculatePAYE(taxableIncome);
  
  const net = parseFloat((gross - ssnitEmp - paye).toFixed(2));

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
    employeeId: employeeId,
    employeeName: name,
    department: dept,
    position: role,
    basicSalary: basic,
    allowances: allowances,
    grossSalary: gross,
    ssnitEmployee: ssnitEmp,
    ssnitEmployer: ssnitEmplr,
    taxableIncome: taxableIncome,
    paye: paye,
    deductions: 0,
    netSalary: net,
    status: 'PROCESSING',
    payPeriod: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  };
};

/**
 * Parses an uploaded file to extract payroll data.
 * In a full production env, this would send the File to the Backend for OCR/Parsing.
 * For this client-side secure version, we read the file metadata and allow manual processing.
 */
export const processPayrollDocument = async (file: File, targetUser: any): Promise<PayrollRecord[]> => {
  
  // Real world: Verify file type strictness
  if (file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Only PDF documents are authorized.');
  }

  // NOTE: Without a backend OCR service, we default to standard salary structure for the user.
  // In V2, integrate Tesseract.js or a Server-Side parser here.
  
  // No fake delays. Immediate processing.
  
  // We use a default structure based on the target user's metadata or defaults
  // This allows the Admin to "upload" a PDF (for record keeping) and generate the entry.
  const baseSalary = 5000; // Standard Base
  const allowance = 0;

  const record = calculatePayroll(
    targetUser.employeeId || 'EMP-UNK',
    targetUser.name,
    'General Staff',
    targetUser.position || 'Staff',
    baseSalary,
    allowance
  );
  
  record.status = 'PAID'; 

  return [record];
};
