import type {
  User,
  Household,
  FamilyMember,
  Ward,
  Area,
  Street,
  Building,
  Notification,
  CorrectionRequest,
  AuditLog,
} from "@/generated/prisma/client";

// ─── API Response Types ──────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Extended Types with Relations ───────────────────

export type HouseholdWithRelations = Household & {
  ward: Ward;
  area: Area;
  street: Street;
  building?: Building | null;
  familyMembers: FamilyMember[];
  users?: User[];
};

export type FamilyMemberWithHousehold = FamilyMember & {
  household: Household & {
    ward: Ward;
  };
};

export type UserWithHousehold = User & {
  household?: Household | null;
};

export type CorrectionRequestWithRelations = CorrectionRequest & {
  user: Pick<User, "id" | "name" | "email">;
  household: Pick<Household, "id" | "surveyId" | "houseNumber">;
};

export type AuditLogWithUser = AuditLog & {
  user: Pick<User, "id" | "name" | "email" | "role">;
};

// ─── Statistics Types ────────────────────────────────

export interface CityStatistics {
  totalPopulation: number;
  totalHouseholds: number;
  totalMale: number;
  totalFemale: number;
  totalOther: number;
  totalChildren: number;
  totalAdults: number;
  totalSeniors: number;
  totalStudents: number;
  totalWorking: number;
  totalUnemployed: number;
  totalLivingAbroad: number;
  totalSurveyCompleted: number;
  totalSurveyPending: number;
}

export interface WardStatistics extends CityStatistics {
  wardId: string;
  wardName: string;
  wardNumber: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

// ─── Search Types ────────────────────────────────────

export interface SearchParams {
  query: string;
  type?: "name" | "phone" | "surveyId" | "householdId" | "ward" | "street" | "area" | "houseNumber";
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  type: "household" | "member" | "user";
  id: string;
  title: string;
  subtitle: string;
  metadata: Record<string, string>;
}

// ─── Dashboard Types ─────────────────────────────────

export interface DashboardCard {
  title: string;
  value: number | string;
  description?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

// ─── Form Types ──────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

// ─── Report Types ────────────────────────────────────

export interface ReportFilter {
  type: string;
  format: "PDF" | "EXCEL" | "CSV";
  wardId?: string;
  dateFrom?: string;
  dateTo?: string;
}
