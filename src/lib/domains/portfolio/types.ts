/**
 * Portfolio / CMS Domain Types
 */

export interface DashboardProjectCategory {
  _id: string;
  name: string;
}

export interface DashboardProjectSummary {
  _id: string;
  title: string;
  category?: DashboardProjectCategory[];
  createdAt: string;
}

export interface CMSDashboardStats {
  projectCount: number;
  featuredCount: number;
  skillCount: number;
  latestProjects: DashboardProjectSummary[];
}
