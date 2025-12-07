import { Briefcase, GraduationCap, MoreHorizontal, Rocket } from "lucide-react";
import { ResourceItem } from "./types";

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: "r1",
    type: "Youtube",
    title: "Q3 Town Hall Recording",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "r2",
    type: "Spreadsheet",
    title: "Financial Projections 2024",
    url: "https://docs.google.com/spreadsheets/u/0/",
  },
];

export const DEFAULT_DEPARTMENTS = [
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "General",
];

export const DEFAULT_EVENT_TYPES = ["meeting", "task", "birthday", "reminder"];

export const DEFAULT_RESOURCE_CATEGORIES = [
  "Document",
  "Spreadsheet",
  "Youtube",
  "Google Drive",
  "Dropbox",
  "Notion",
  "Design",
  "Link",
];

export const DEFAULT_USER_ROLES = [
  {
    id: "1",
    name: "Student",
    icon: GraduationCap,
  },
  {
    id: "2",
    name: "Professional",
    icon: Briefcase,
  },
  {
    id: "3",
    name: "Entrepreneur",
    icon: Rocket,
  },
  {
    id: "4",
    name: "Other",
    icon: MoreHorizontal,
  },
];
