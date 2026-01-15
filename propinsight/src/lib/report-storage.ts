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
  // For MVP, we'll need to track email associations
  // This is a simplified version - in production, use a proper join table
  return Array.from(reports.values());
}

// Generate a unique report ID
export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
