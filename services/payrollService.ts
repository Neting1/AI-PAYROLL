
import { PayrollRecord } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

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

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Parses an uploaded file to extract payroll data using Gemini API.
 */
export const processPayrollDocument = async (file: File, targetUser: any): Promise<PayrollRecord[]> => {
  
  // Check for API Key
  if (!process.env.API_KEY || process.env.API_KEY.includes('YOUR_')) {
     console.warn("Gemini API Key missing. Using fallback manual processing.");
     // Fallback to default manual entry if no key
     const baseSalary = 5000;
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
  }

  try {
      const base64Str = await fileToBase64(file);
      // Remove data:application/pdf;base64, prefix
      const base64Data = base64Str.split(',')[1];
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Use gemini-3-flash-preview as it supports multimodal inputs (like PDFs/Images) efficiently
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: file.type, // e.g. 'application/pdf'
                        data: base64Data
                    }
                },
                {
                    text: "Extract payroll details from this document. Return JSON with keys: basicSalary (number), allowances (number), employeeId (string), employeeName (string), position (string)."
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    basicSalary: { type: Type.NUMBER },
                    allowances: { type: Type.NUMBER },
                    employeeId: { type: Type.STRING },
                    employeeName: { type: Type.STRING },
                    position: { type: Type.STRING }
                },
                required: ["basicSalary", "allowances"]
            }
        }
      });

      const data = JSON.parse(response.text);

      const record = calculatePayroll(
        data.employeeId || targetUser.employeeId,
        data.employeeName || targetUser.name,
        'General Staff',
        data.position || targetUser.position || 'Staff',
        data.basicSalary || 0,
        data.allowances || 0
      );
      
      record.status = 'PAID';
      return [record];

  } catch (error) {
      console.error("Gemini Extraction Failed:", error);
      throw new Error("Failed to process document with AI. Please check your API Key or file format.");
  }
};
