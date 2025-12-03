"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  addMonths,
  subMonths,
  differenceInDays,
  endOfYear,
  differenceInWeeks,
} from "date-fns";
import {
  CalendarEvent,
  Department,
  ResourceItem,
  TaskStatus,
  UserRole,
  Subscription,
} from "../types";
import { getDailyHolidays } from "../services/geminiService";
import { useRouter } from "next/navigation";

// --- Types ---

type CalendarViewMode = "day" | "week" | "kanban";
type ActiveView = "calendar" | "subscriptions" | "settings" | "pricing";
type AppState = "loading" | "auth" | "onboarding" | "building" | "app";

interface AppContextType {
  // State
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  toastMsg: string | null;
  showToast: (msg: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  handleDateSelect: (date: Date) => void;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  userRole: UserRole;
  setUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
  trialStartDate: Date | null;
  setTrialStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  couponCode: string;
  setCouponCode: React.Dispatch<React.SetStateAction<string>>;
  isCelebrating: boolean;
  setIsCelebrating: React.Dispatch<React.SetStateAction<boolean>>;
  isUpgraded: boolean;
  setIsUpgraded: React.Dispatch<React.SetStateAction<boolean>>;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  history: CalendarEvent[][];
  redoStack: CalendarEvent[][];
  selectedEventId: string | null;
  setSelectedEventId: React.Dispatch<React.SetStateAction<string | null>>;
  resources: ResourceItem[];
  setResources: React.Dispatch<React.SetStateAction<ResourceItem[]>>;
  holidays: string[];
  loadingHolidays: boolean;
  departments: string[];
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  eventTypes: string[];
  setEventTypes: React.Dispatch<React.SetStateAction<string[]>>;
  resourceCategories: string[];
  setResourceCategories: React.Dispatch<React.SetStateAction<string[]>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeView: ActiveView;
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  calendarViewMode: CalendarViewMode;
  setCalendarViewMode: React.Dispatch<React.SetStateAction<CalendarViewMode>>;
  selectedRoleFilter: Department | "All";
  setSelectedRoleFilter: React.Dispatch<
    React.SetStateAction<Department | "All">
  >;
  selectedStatusFilter: TaskStatus | "all";
  setSelectedStatusFilter: React.Dispatch<
    React.SetStateAction<TaskStatus | "all">
  >;

  // Computed
  daysLeftInYear: number;
  weeksLeft: number;
  yearProgress: number;
  selectedEvent: CalendarEvent | undefined;
  displayResources: ResourceItem[];
  resourceWidgetTitle: string;
  filteredEvents: CalendarEvent[];
  getDaysRemaining: () => number;

  // Actions
  handleLogin: () => void;
  handleOnboardingComplete: (data: {
    role: UserRole;
    name: string;
    location: string;
  }) => void;
  handleRedeemCoupon: () => void;
  handleBuy: () => void;
  handleCancelSubscription: () => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  updateEvents: (newEvents: CalendarEvent[], saveHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  handleSaveEvent: (eventData: Partial<CalendarEvent>) => void;
  handleUpdateEvent: (updatedEvent: CalendarEvent) => void;
  handleDeleteEvent: (eventId: string) => void;
  handleReorderEvents: (reorderedSubset: CalendarEvent[]) => void;
  handleAddResource: (item: ResourceItem) => void;
  handleRemoveResource: (id: string) => void;
  handleDeleteAccount: () => void;
  seedDataByRole: (role: UserRole) => {
    events: CalendarEvent[];
    subscriptions: Subscription[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Constants ---

const INITIAL_RESOURCES: ResourceItem[] = [
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

// --- Helper ---
const seedDataByRole = (role: UserRole) => {
  const events: CalendarEvent[] = [];
  const subscriptions: Subscription[] = [];

  const today = new Date();

  if (role === "Student") {
    events.push(
      {
        id: "s1",
        title: "Calculus Lecture",
        startTime: new Date(today.setHours(9, 0, 0, 0)),
        endTime: new Date(today.setHours(10, 30, 0, 0)),
        type: "meeting",
        department: "General",
        status: "completed",
        recurrence: "weekly",
      },
      {
        id: "s2",
        title: "Study Group",
        startTime: new Date(today.setHours(14, 0, 0, 0)),
        endTime: new Date(today.setHours(16, 0, 0, 0)),
        type: "task",
        department: "General",
        status: "in-progress",
        description: "Review Chapter 4 for finals",
      },
      {
        id: "s3",
        title: "Submit History Paper",
        startTime: new Date(today.setHours(23, 59, 0, 0)),
        type: "task",
        department: "General",
        status: "todo",
      }
    );
    subscriptions.push(
      {
        id: "sub1",
        name: "Spotify Student",
        price: 4.99,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2023-01-01"),
        type: "entertainment",
        isActive: true,
        color: "#1DB954",
        icon: "Music",
      },
      {
        id: "sub2",
        name: "Chegg",
        price: 14.95,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2023-02-15"),
        type: "software",
        isActive: true,
        color: "#F37021",
        icon: "Book",
      },
      {
        id: "sub3",
        name: "Netflix",
        price: 9.99,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2023-03-10"),
        type: "entertainment",
        isActive: true,
        color: "#E50914",
        icon: "Tv",
      }
    );
  } else if (role === "Professional") {
    events.push(
      {
        id: "p1",
        title: "Daily Standup",
        startTime: new Date(today.setHours(10, 0, 0, 0)),
        endTime: new Date(today.setHours(10, 15, 0, 0)),
        type: "meeting",
        department: "Engineering",
        status: "completed",
        recurrence: "daily",
      },
      {
        id: "p2",
        title: "Client Presentation",
        startTime: new Date(today.setHours(13, 0, 0, 0)),
        endTime: new Date(today.setHours(14, 0, 0, 0)),
        type: "meeting",
        department: "Product",
        status: "todo",
        meetLink: "https://meet.google.com/abc-def",
      },
      {
        id: "p3",
        title: "Code Review",
        startTime: new Date(today.setHours(15, 30, 0, 0)),
        type: "task",
        department: "Engineering",
        status: "todo",
      }
    );
    subscriptions.push(
      {
        id: "sub1",
        name: "LinkedIn Premium",
        price: 29.99,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2022-05-01"),
        type: "software",
        isActive: true,
        color: "#0077B5",
        icon: "Briefcase",
      },
      {
        id: "sub2",
        name: "Adobe Cloud",
        price: 54.99,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2022-01-15"),
        type: "software",
        isActive: true,
        color: "#FF0000",
        icon: "Monitor",
      },
      {
        id: "sub3",
        name: "Gym Membership",
        price: 40.0,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2023-01-01"),
        type: "other",
        isActive: true,
        color: "#000000",
        icon: "Dumbbell",
      }
    );
  } else if (role === "Entrepreneur") {
    events.push(
      {
        id: "e1",
        title: "Investor Pitch",
        startTime: new Date(today.setHours(11, 0, 0, 0)),
        endTime: new Date(today.setHours(12, 0, 0, 0)),
        type: "meeting",
        department: "General",
        status: "todo",
        description: "Pitching Series A deck",
      },
      {
        id: "e2",
        title: "Product Launch Prep",
        startTime: new Date(today.setHours(14, 0, 0, 0)),
        endTime: new Date(today.setHours(18, 0, 0, 0)),
        type: "task",
        department: "Product",
        status: "in-progress",
      },
      {
        id: "e3",
        title: "Networking Event",
        startTime: new Date(today.setHours(19, 0, 0, 0)),
        type: "meeting",
        department: "Marketing",
        status: "todo",
        location: "Downtown Hub",
      }
    );
    subscriptions.push(
      {
        id: "sub1",
        name: "AWS",
        price: 120.5,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2022-08-01"),
        type: "software",
        isActive: true,
        color: "#FF9900",
        icon: "Cloud",
      },
      {
        id: "sub2",
        name: "Notion Team",
        price: 16.0,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2022-09-01"),
        type: "software",
        isActive: true,
        color: "#000000",
        icon: "Database",
      },
      {
        id: "sub3",
        name: "Shopify",
        price: 29.0,
        currency: "$",
        billingCycle: "monthly",
        startDate: new Date("2023-01-01"),
        type: "software",
        isActive: true,
        color: "#96BF48",
        icon: "ShoppingBag",
      }
    );
  } else {
    // Default/Other
    events.push({
      id: "d1",
      title: "Welcome to Korizen",
      startTime: new Date(today.setHours(9, 0, 0, 0)),
      type: "task",
      department: "General",
      status: "in-progress",
      description: "Explore your new workspace.",
    });
  }

  return { events, subscriptions };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  // App Phase State
  const [appState, setAppState] = useState<AppState>("loading");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to false, effect will load from local storage

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // User Data
  const [userName, setUserName] = useState("Alex");
  const [userRole, setUserRole] = useState<UserRole>("Other");

  // Trial State
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);

  // Coupon & Subscription State
  const [couponCode, setCouponCode] = useState("");
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);

  // Data
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [history, setHistory] = useState<CalendarEvent[][]>([]);
  const [redoStack, setRedoStack] = useState<CalendarEvent[][]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);

  // Holidays
  const [holidays, setHolidays] = useState<string[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const holidayCache = useRef<Map<string, string[]>>(new Map());

  const [departments, setDepartments] = useState<string[]>([
    "Design",
    "Engineering",
    "Product",
    "Marketing",
    "General",
  ]);

  const [eventTypes, setEventTypes] = useState<string[]>([
    "meeting",
    "task",
    "birthday",
    "reminder",
  ]);

  const [resourceCategories, setResourceCategories] = useState<string[]>([
    "Document",
    "Spreadsheet",
    "Youtube",
    "Google Drive",
    "Dropbox",
    "Notion",
    "Design",
    "Link",
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("calendar");
  const [calendarViewMode, setCalendarViewMode] =
    useState<CalendarViewMode>("day");

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<
    Department | "All"
  >("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    TaskStatus | "all"
  >("all");

  const daysLeftInYear = differenceInDays(endOfYear(new Date()), new Date());
  const weeksLeft = differenceInWeeks(endOfYear(new Date()), new Date());
  const yearProgress = Math.round(((365 - daysLeftInYear) / 365) * 100);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const displayResources = selectedEvent
    ? selectedEvent.resources || []
    : resources;
  const resourceWidgetTitle = selectedEvent
    ? `Hub: ${selectedEvent.title}`
    : "Project Hub";

  // --- Initialization Effect ---
  useEffect(() => {
    // Load local storage data on mount
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("chronos_theme");
      if (savedTheme) setIsDarkMode(JSON.parse(savedTheme));

      const savedUserName = localStorage.getItem("chronos_username");
      if (savedUserName) setUserName(savedUserName);

      const savedRole = localStorage.getItem("chronos_role");
      if (savedRole) setUserRole(savedRole as UserRole);

      const savedTrialStart = localStorage.getItem("chronos_trial_start");
      if (savedTrialStart) setTrialStartDate(new Date(savedTrialStart));

      const savedUpgraded = localStorage.getItem("chronos_is_upgraded");
      if (savedUpgraded) setIsUpgraded(savedUpgraded === "true");

      const savedResources = localStorage.getItem("chronos_resources");
      if (savedResources) setResources(JSON.parse(savedResources));

      const savedDepartments = localStorage.getItem("chronos_departments");
      if (savedDepartments) setDepartments(JSON.parse(savedDepartments));

      const savedEventTypes = localStorage.getItem("chronos_eventtypes");
      if (savedEventTypes) setEventTypes(JSON.parse(savedEventTypes));

      const savedResourceCats = localStorage.getItem("chronos_resourcecats");
      if (savedResourceCats)
        setResourceCategories(JSON.parse(savedResourceCats));
    }

    // Check auth status
    const timer = setTimeout(() => {
      const isLoggedIn = localStorage.getItem("chronos_auth_token") === "true";
      const isSetupComplete =
        localStorage.getItem("chronos_setup_complete") === "true";

      if (!isLoggedIn) {
        setAppState("auth");
        router.push("/auth");
      } else if (!isSetupComplete) {
        setAppState("onboarding");
        router.push("/onboarding");
      } else {
        // Load data
        const savedEvents = localStorage.getItem("chronos_events");
        if (savedEvents) {
          setEvents(
            JSON.parse(savedEvents).map((e: any) => ({
              ...e,
              startTime: new Date(e.startTime),
              endTime: e.endTime ? new Date(e.endTime) : undefined,
            }))
          );
        }

        // Initialize trial for legacy users if missing
        if (!localStorage.getItem("chronos_trial_start")) {
          const now = new Date();
          setTrialStartDate(now);
          localStorage.setItem("chronos_trial_start", now.toISOString());
        }

        setAppState("app");
        // router.push('/'); // Already at root potentially, but good to ensure
      }
    }, 1000); // Reduced delay for better UX
    return () => clearTimeout(timer);
  }, []);

  // PERSISTENCE EFFECTS
  useEffect(() => {
    localStorage.setItem("chronos_theme", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (appState === "app") {
      localStorage.setItem("chronos_events", JSON.stringify(events));
    }
  }, [events, appState]);

  useEffect(() => {
    localStorage.setItem("chronos_resources", JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem("chronos_departments", JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem("chronos_eventtypes", JSON.stringify(eventTypes));
  }, [eventTypes]);

  useEffect(() => {
    localStorage.setItem(
      "chronos_resourcecats",
      JSON.stringify(resourceCategories)
    );
  }, [resourceCategories]);

  useEffect(() => {
    localStorage.setItem("chronos_username", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("chronos_role", userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem("chronos_is_upgraded", String(isUpgraded));
  }, [isUpgraded]);

  useEffect(() => {
    if (trialStartDate) {
      localStorage.setItem("chronos_trial_start", trialStartDate.toISOString());
    }
  }, [trialStartDate]);

  // --- Handlers ---

  const handleLogin = () => {
    localStorage.setItem("chronos_auth_token", "true");
    const isSetupComplete =
      localStorage.getItem("chronos_setup_complete") === "true";
    if (isSetupComplete) {
      const savedEvents = localStorage.getItem("chronos_events");
      if (savedEvents) {
        setEvents(
          JSON.parse(savedEvents).map((e: any) => ({
            ...e,
            startTime: new Date(e.startTime),
            endTime: e.endTime ? new Date(e.endTime) : undefined,
          }))
        );
      }
      setAppState("app");
      router.push("/");
    } else {
      setAppState("onboarding");
      router.push("/onboarding");
    }
  };

  const handleOnboardingComplete = (data: {
    role: UserRole;
    name: string;
    location: string;
  }) => {
    setAppState("building");

    // Seed Data based on input
    const { events: seededEvents, subscriptions: seededSubs } = seedDataByRole(
      data.role
    );

    // Set Trial Start
    const now = new Date();
    setTrialStartDate(now);
    localStorage.setItem("chronos_trial_start", now.toISOString());

    setTimeout(() => {
      setUserName(data.name);
      setUserRole(data.role);
      setEvents(seededEvents);
      localStorage.setItem("weather_location", data.location); // Save location to widget storage
      localStorage.setItem("chronos_subscriptions", JSON.stringify(seededSubs)); // Pre-populate subs
      localStorage.setItem("chronos_setup_complete", "true");
      setAppState("app");
      router.push("/");
    }, 2500); // Wait for building animation
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRedeemCoupon = () => {
    if (couponCode.toUpperCase() === "FAIZ25") {
      localStorage.setItem("chronos_coupon_redeemed", "true");
      setTrialStartDate(new Date()); // Reset clock
      setIsCelebrating(true);
      showToast("Coupon Redeemed! 30 Days Free Trial Active.");
      setTimeout(() => setIsCelebrating(false), 5000);
    } else {
      showToast("Invalid Coupon Code");
    }
  };

  const handleBuy = () => {
    setIsUpgraded(true);
    setIsCelebrating(true);
    showToast("Welcome to Premium!");
    setTimeout(() => setIsCelebrating(false), 5000);
  };

  const handleCancelSubscription = () => {
    setIsUpgraded(false);
    showToast("Subscription Cancelled.");
  };

  const getDaysRemaining = () => {
    if (!trialStartDate) return 7;
    const isExtended =
      localStorage.getItem("chronos_coupon_redeemed") === "true";
    const trialLength = isExtended ? 30 : 7;

    const diff = differenceInDays(new Date(), trialStartDate);
    const remaining = trialLength - diff;
    return remaining > 0 ? remaining : 0;
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (activeView !== "calendar") setActiveView("calendar");
    setSelectedEventId(null);
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      const dateKey = selectedDate.toDateString();
      if (holidayCache.current.has(dateKey)) {
        setHolidays(holidayCache.current.get(dateKey)!);
        return;
      }
      setLoadingHolidays(true);
      const days = await getDailyHolidays(selectedDate);
      holidayCache.current.set(dateKey, days);
      setHolidays(days);
      setLoadingHolidays(false);
    };
    if (appState === "app") fetchHolidays();
  }, [selectedDate, appState]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateEvents = (newEvents: CalendarEvent[], saveHistory = true) => {
    if (saveHistory) {
      setHistory((prev) => [...prev, events]);
      setRedoStack([]);
    }
    setEvents(newEvents);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [events, ...prev]);
    setEvents(previous);
    setHistory((prev) => prev.slice(0, -1));
    showToast("Undo successful");
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, events]);
    setEvents(next);
    setRedoStack((prev) => prev.slice(1));
    showToast("Redo successful");
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: eventData.title!,
      startTime: eventData.startTime!,
      endTime: eventData.endTime,
      type: eventData.type || "meeting",
      department: eventData.department || "General",
      status: eventData.status || "todo",
      description: eventData.description,
      meetLink: eventData.meetLink,
      recurrence: eventData.recurrence || "none",
      order: events.length,
      resources: eventData.resources,
    };
    updateEvents([...events, newEvent]);
    showToast("Event saved successfully");
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    const newEvents = events.map((e) =>
      e.id === updatedEvent.id ? updatedEvent : e
    );
    updateEvents(newEvents);
  };

  const handleDeleteEvent = (eventId: string) => {
    const newEvents = events.filter((e) => e.id !== eventId);
    updateEvents(newEvents);
    if (selectedEventId === eventId) setSelectedEventId(null);
    showToast("Event deleted");
  };

  const handleReorderEvents = (reorderedSubset: CalendarEvent[]) => {
    const newEvents = [...events];
    reorderedSubset.forEach((reItem) => {
      const idx = newEvents.findIndex((e) => e.id === reItem.id);
      if (idx !== -1) newEvents[idx] = reItem;
    });
    updateEvents(newEvents);
  };

  const filteredEvents = events.filter((e) => {
    const roleMatch =
      selectedRoleFilter === "All" || e.department === selectedRoleFilter;
    const statusMatch =
      selectedStatusFilter === "all" || e.status === selectedStatusFilter;
    return roleMatch && statusMatch;
  });

  const handleAddResource = (item: ResourceItem) => {
    if (selectedEventId) {
      const event = events.find((e) => e.id === selectedEventId);
      if (event) {
        const updatedEvent = {
          ...event,
          resources: [...(event.resources || []), item],
        };
        handleUpdateEvent(updatedEvent);
      }
    } else {
      setResources((prev) => [item, ...prev]);
    }
    showToast("Resource added");
  };

  const handleRemoveResource = (id: string) => {
    if (selectedEventId) {
      const event = events.find((e) => e.id === selectedEventId);
      if (event) {
        const updatedEvent = {
          ...event,
          resources: (event.resources || []).filter((r) => r.id !== id),
        };
        handleUpdateEvent(updatedEvent);
      }
    } else {
      setResources((prev) => prev.filter((r) => r.id !== id));
    }
    showToast("Resource removed");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure? This is permanent.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <AppContext.Provider
      value={{
        appState,
        setAppState,
        toastMsg,
        showToast,
        isDarkMode,
        toggleTheme,
        currentDate,
        setCurrentDate,
        selectedDate,
        handleDateSelect,
        userName,
        setUserName,
        userRole,
        setUserRole,
        trialStartDate,
        setTrialStartDate,
        couponCode,
        setCouponCode,
        isCelebrating,
        setIsCelebrating,
        isUpgraded,
        setIsUpgraded,
        events,
        setEvents,
        subscriptions,
        setSubscriptions,
        history,
        redoStack,
        selectedEventId,
        setSelectedEventId,
        resources,
        setResources,
        holidays,
        loadingHolidays,
        departments,
        eventTypes,
        resourceCategories,
        isModalOpen,
        setIsModalOpen,
        activeView,
        setActiveView,
        calendarViewMode,
        setCalendarViewMode,
        selectedRoleFilter,
        setSelectedRoleFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        daysLeftInYear,
        weeksLeft,
        yearProgress,
        selectedEvent,
        displayResources,
        resourceWidgetTitle,
        filteredEvents,
        getDaysRemaining,
        handleLogin,
        handleOnboardingComplete,
        handleRedeemCoupon,
        handleBuy,
        handleCancelSubscription,
        handlePrevMonth,
        handleNextMonth,
        updateEvents,
        undo,
        redo,
        handleSaveEvent,
        handleUpdateEvent,
        handleDeleteEvent,
        handleReorderEvents,
        handleAddResource,
        handleRemoveResource,
        handleDeleteAccount,
        seedDataByRole,
        setDepartments,
        setEventTypes,
        setResourceCategories,
        
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
