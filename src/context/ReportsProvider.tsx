import React, { createContext, useContext, useEffect, useState } from 'react';
import { CreateReportInput } from '../services';
import { reportsService } from '../services';
import { SafetyReport } from '../types/safety';

export interface ReportsContextValue {
  reports: SafetyReport[];
  isLoading: boolean;
  refreshReports: () => Promise<void>;
  createReport: (input: CreateReportInput) => Promise<SafetyReport>;
  corroborateReport: (reportId: string) => Promise<void>;
  flagReport: (reportId: string, reason: string) => Promise<void>;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    try {
      const data = await reportsService.getReports();
      setReports(data);
    } catch {
      // Safe fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const createReport = async (input: CreateReportInput): Promise<SafetyReport> => {
    const report = await reportsService.createReport(input);
    await fetchReports();
    return report;
  };

  const corroborateReport = async (reportId: string): Promise<void> => {
    await reportsService.corroborateReport(reportId);
    await fetchReports();
  };

  const flagReport = async (reportId: string, reason: string): Promise<void> => {
    await reportsService.flagReport(reportId, reason);
    await fetchReports();
  };

  const value: ReportsContextValue = {
    reports,
    isLoading,
    refreshReports: fetchReports,
    createReport,
    corroborateReport,
    flagReport,
  };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};

export const useReports = (): ReportsContextValue => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
