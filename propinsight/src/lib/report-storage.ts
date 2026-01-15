import { Report } from '@/types';

// In-memory storage for MVP
// In production, this would be replaced with a database (Supabase/Postgres)
const reports = new Map<string, Report>();

export function storeReport(report: Report): void {
  reports.set(report.id, report);
}

export function getReport(reportId: string): Report | undefined {
  return reports.get(reportId);
}

export function getReportsByArea(areaId: string): Report[] {
  return Array.from(reports.values()).filter((r) => r.areaId === areaId);
}

export function getReportsByEmail(email: string): Report[] {
  return Array.from(reports.values()).filter((r) => r.email === email);
}

export function getReportBySessionId(sessionId: string): Report | undefined {
  return Array.from(reports.values()).find((r) => r.stripeSessionId === sessionId);
}

// Generate a unique report ID
export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
