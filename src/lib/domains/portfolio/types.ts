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

export interface AdminProjectCategory {
  _id: string;
  name: string;
}

export interface AdminProject {
  _id: string;
  title: string;
  image: string;
  category: AdminProjectCategory[];
  featured: boolean;
  createdAt: string;
  slug: string;
}

export interface CMSDashboardStats {
  projectCount: number;
  featuredCount: number;
  skillCount: number;
  latestProjects: DashboardProjectSummary[];
}
