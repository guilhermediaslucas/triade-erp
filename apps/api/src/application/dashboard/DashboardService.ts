import type { DashboardRepository, ResumoDashboard } from '../../domain/dashboard/Dashboard.js';
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}
  resumo(schema: string): Promise<ResumoDashboard> { return this.repo.resumo(schema); }
}
