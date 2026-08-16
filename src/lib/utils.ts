import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateAge(dateOfBirth: Date | string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function generateSurveyId(wardNumber?: number, sequence?: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomCode = "";
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SRV-${randomCode}`;
}

export function generateShortSurveyId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomCode = "";
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SRV-${randomCode}`;
}

export function getIncomeRangeLabel(range: string | null | undefined): string {
  const labels: Record<string, string> = {
    PREFER_NOT_TO_DISCLOSE: "Prefer Not To Disclose",
    NO_INCOME: "No Income",
    BELOW_1_LAKH: "Below ₹1 Lakh",
    ONE_TO_THREE_LAKH: "₹1–3 Lakh",
    THREE_TO_FIVE_LAKH: "₹3–5 Lakh",
    FIVE_TO_TEN_LAKH: "₹5–10 Lakh",
    TEN_TO_TWENTY_LAKH: "₹10–20 Lakh",
    ABOVE_TWENTY_LAKH: "Above ₹20 Lakh",
  };
  return range ? (labels[range] ?? "Prefer Not To Disclose") : "Prefer Not To Disclose";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
