"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AppRouter = ReturnType<typeof useRouter>;

type LoadingContextValue = {
  isLoading: boolean;
  router: AppRouter;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

function shouldTrackFetch(input: RequestInfo | URL): boolean {
  try {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const url = new URL(raw, window.location.origin);
    return url.origin === window.location.origin && url.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

function GlobalLoadingBar({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-stone-200"
      role="progressbar"
      aria-label="Loading"
    >
      <div className="global-loading-bar h-full w-1/3 bg-stone-800" />
    </div>
  );
}

function LoadingRouteListener({
  onRouteSettled,
  onLinkNavigate,
}: {
  onRouteSettled: () => void;
  onLinkNavigate: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    onRouteSettled();
  }, [pathname, search, onRouteSettled]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element).closest("a[href]");
      if (!anchor) {
        return;
      }
      if (anchor.getAttribute("target") === "_blank") {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) {
          return;
        }
        const next = `${url.pathname}${url.search}`;
        const current = search ? `${pathname}?${search}` : pathname;
        if (next !== current) {
          onLinkNavigate();
        }
      } catch {
        // ignore invalid href
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, search, onLinkNavigate]);

  return null;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [fetchCount, setFetchCount] = useState(0);
  const [linkNavPending, setLinkNavPending] = useState(false);
  const [isTransitionPending, startTransition] = useTransition();

  const startFetch = useCallback(() => {
    setFetchCount((count) => count + 1);
  }, []);

  const stopFetch = useCallback(() => {
    setFetchCount((count) => Math.max(0, count - 1));
  }, []);

  const clearNavigationLoading = useCallback(() => {
    setLinkNavPending(false);
  }, []);

  const startLinkNavigation = useCallback(() => {
    setLinkNavPending(true);
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      if (!shouldTrackFetch(input)) {
        return originalFetch(input, init);
      }

      startFetch();
      try {
        return await originalFetch(input, init);
      } finally {
        stopFetch();
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [startFetch, stopFetch]);

  const appRouter = useMemo<AppRouter>(
    () => ({
      ...router,
      push: (href, options) => {
        startLinkNavigation();
        startTransition(() => {
          router.push(href, options);
        });
      },
      replace: (href, options) => {
        startLinkNavigation();
        startTransition(() => {
          router.replace(href, options);
        });
      },
      refresh: () => {
        startTransition(() => {
          router.refresh();
        });
      },
      back: () => {
        startLinkNavigation();
        startTransition(() => {
          router.back();
        });
      },
      forward: () => {
        startLinkNavigation();
        startTransition(() => {
          router.forward();
        });
      },
    }),
    [router, startLinkNavigation, startTransition],
  );

  const isLoading = fetchCount > 0 || linkNavPending || isTransitionPending;

  const value = useMemo(
    () => ({ isLoading, router: appRouter }),
    [isLoading, appRouter],
  );

  return (
    <LoadingContext.Provider value={value}>
      <GlobalLoadingBar active={isLoading} />
      <Suspense fallback={null}>
        <LoadingRouteListener
          onRouteSettled={clearNavigationLoading}
          onLinkNavigate={startLinkNavigation}
        />
      </Suspense>
      {children}
    </LoadingContext.Provider>
  );
}

export function useAppRouter(): AppRouter {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useAppRouter must be used within LoadingProvider");
  }
  return context.router;
}

export function useGlobalLoading(): boolean {
  const context = useContext(LoadingContext);
  if (!context) {
    return false;
  }
  return context.isLoading;
}
