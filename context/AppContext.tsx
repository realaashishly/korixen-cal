"use client";
import {
  createDefaultUserAssets,
  getUserAssets,
  updateUserAssets,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getSubscriptions,
  createSubscription,
  deleteSubscription,
  updateUserPreferences,
} from "@/app/actions";
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_EVENT_TYPES,
  DEFAULT_RESOURCE_CATEGORIES,
  INITIAL_RESOURCES,
} from "@/constants";
import { authClient } from "@/lib/auth-client";
import {
  AppState,
  CalendarEvent,
  ResourceItem,
  Subscription,
  UserRole,
} from "@/types";
import { usePathname, useRouter } from "next/navigation";
import React, {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import useUser from "./useUser";

export interface AppContextType {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  user: typeof authClient.$Infer.Session.user | null;
  toastMsg: string | null;
  showToast: (msg: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isCelebrating: boolean;
  setIsCelebrating: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Data
  resources: ResourceItem[];
  departments: string[];
  eventTypes: string[];
  resourceCategories: string[];
  events: CalendarEvent[];
  subscriptions: Subscription[];

  // Actions
  seedDataByRole: (role: UserRole) => void;
  handleAddResource: (resource: ResourceItem) => void;
  handleRemoveResource: (resourceId: string) => void;
  handleDeleteAccount: () => void;
  
  // Event & Subscription Actions
  handleCreateEvent: (event: Partial<CalendarEvent>) => Promise<void>;
  handleUpdateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  handleDeleteEvent: (id: string) => Promise<void>;
  handleCreateSubscription: (sub: Partial<Subscription>) => Promise<void>;
  handleDeleteSubscription: (id: string) => Promise<void>;
  handleUpdateResourceCategories: (categories: string[]) => Promise<void>;

  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setResourceCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const AppContextContext = createContext<AppContextType | undefined>(undefined);

const seedDataByRoleHelper = (role: UserRole) => {
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
        description: "Review Chapter 4 for finals",
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

export default function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const pathname = usePathname();
  const router = useRouter();

  const [appState, setAppState] = useState<AppState>("loading");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Data State
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [eventTypes, setEventTypes] = useState<string[]>(DEFAULT_EVENT_TYPES);
  const [resourceCategories, setResourceCategories] = useState<string[]>(
    DEFAULT_RESOURCE_CATEGORIES
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Initialization ---

  // Check Onboarding
  const updateUserAssetsOnOnboarding = async () => {
    // Create default assets if not exists
    await createDefaultUserAssets();
  };

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      setAppState("auth");
      if (pathname !== "/signup" && pathname !== "/signin") {
        router.replace("/signin");
      }
      return;
    }

    if (!user.isOnboardingComplete) {
      setAppState("onboarding");
      if (pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
      return;
    }

    setAppState("app");

    if (
      user &&
      (pathname === "/signin" ||
        pathname === "/signup" ||
        pathname === "/onboarding")
    ) {
      updateUserAssetsOnOnboarding();
      router.replace("/dashboard");
    }
  }, [user, isPending, pathname, router]);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        // Load Assets
        const assets = await getUserAssets();
        if (assets) {
          if (assets.resources) setResources(assets.resources);
          if (assets.departments) setDepartments(assets.departments);
          if (assets.eventTypes) setEventTypes(assets.eventTypes);
          if (assets.resourceCategories) setResourceCategories(assets.resourceCategories);
        }

        // Load Events
        const loadedEvents = await getEvents();
        setEvents(loadedEvents as unknown as CalendarEvent[]);

        // Load Subscriptions
        const loadedSubs = await getSubscriptions();
        setSubscriptions(loadedSubs as unknown as Subscription[]);

      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    if (user && appState === "app") {
      loadData();
    }
  }, [user, appState]);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // --- Actions ---

  const seedDataByRole = async (role: UserRole) => {
    const { events: seededEvents, subscriptions: seededSubs } = seedDataByRoleHelper(role);
    
    // Save to DB
    for (const ev of seededEvents) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...evData } = ev; 
        await handleCreateEvent(evData);
    }
    for (const sub of seededSubs) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...subData } = sub;
        await handleCreateSubscription(subData);
    }
  };

  const handleAddResource = async (item: ResourceItem) => {
    // Global resource
    const newResources = [item, ...resources];
    setResources(newResources);
    
    // Update DB
    await updateUserAssets({ resources: newResources });
    showToast("Resource added");
  };

  const handleRemoveResource = async (id: string) => {
    const newResources = resources.filter((r) => r.id !== id);
    setResources(newResources);
    
    await updateUserAssets({ resources: newResources });
    showToast("Resource removed");
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure? This is permanent.")) {
      await authClient.deleteUser();
      router.push("/signup");
    }
  };

  // Event Handlers
  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
      try {
        const newEvent = await createEvent(eventData);
        setEvents((prev) => [...prev, newEvent as unknown as CalendarEvent]);
        showToast("Event created");
      } catch (err) {
        console.error(err);
        showToast("Failed to create event");
      }
  };

  const handleUpdateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
      try {
        const updated = await updateEvent(id, eventData);
        setEvents((prev) => prev.map(e => e.id === id ? (updated as unknown as CalendarEvent) : e));
        showToast("Event updated");
      } catch (err) {
        console.error(err);
        showToast("Failed to update event");
      }
  };

  const handleDeleteEvent = async (id: string) => {
      try {
        await deleteEvent(id);
        setEvents((prev) => prev.filter(e => e.id !== id));
        showToast("Event deleted");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete event");
      }
  };

  // Subscription Handlers
  const handleCreateSubscription = async (sub: Partial<Subscription>) => {
      try {
        const newSub = await createSubscription(sub);
        setSubscriptions((prev) => [...prev, newSub as unknown as Subscription]);
        showToast("Subscription added");
      } catch (err) {
          console.error(err);
          showToast("Failed to add subscription");
      }
  };

  const handleDeleteSubscription = async (id: string) => {
      try {
        await deleteSubscription(id);
        setSubscriptions((prev) => prev.filter(s => s.id !== id));
        showToast("Subscription removed");
      } catch (err) {
          console.error(err);
          showToast("Failed to remove subscription");
      }
  };

  const handleUpdateResourceCategories = async (categories: string[]) => {
      setResourceCategories(categories); // Optimistic
      try {
          await updateUserAssets({ resourceCategories: categories });
      } catch (err) {
          console.error(err);
          showToast("Failed to save categories");
      }
  };

  if (appState === "auth" && pathname !== "/signup" && pathname !== "/signin") {
    return null;
  }

  return (
    <AppContextContext.Provider
      value={{
        appState,
        setAppState,
        user: user || null,
        toastMsg,
        showToast,
        isDarkMode,
        toggleTheme,
        isCelebrating,
        setIsCelebrating,
        
        resources,
        departments,
        eventTypes,
        resourceCategories,
        events,
        subscriptions,

        isModalOpen,
        setIsModalOpen,
        setResourceCategories,

        handleAddResource,
        handleRemoveResource,
        handleDeleteAccount,
        seedDataByRole,
        
        handleCreateEvent,
        handleUpdateEvent,
        handleDeleteEvent,
        handleCreateSubscription,
        handleDeleteSubscription,
        handleUpdateResourceCategories,
      }}
    >
      {appState === "loading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black dark:border-zinc-800 dark:border-t-white"></div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
              Loading Workspace...
            </p>
          </div>
        </div>
      )}

      {children}
    </AppContextContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContextContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
