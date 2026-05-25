import { useEffect } from "react";

interface GoogleAnalyticsProps {
  measurementId: string;
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// Module-level store so analytics.pageview() etc. can use the real ID
let _gaMeasurementId = "";

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Skip if measurementId is not provided or not on client side
    if (!measurementId || typeof window === "undefined") return;
    _gaMeasurementId = measurementId;

    // Initialize gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer!.push(arguments);
    }
    window.gtag = gtag;

    // Load Google Analytics script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Configure Google Analytics
    script.onload = () => {
      gtag("js", new Date());
      gtag("config", measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        // Custom dimensions for dental lab tracking
        custom_map: {
          custom_dimension_1: "user_type", // dentist, lab_staff, admin
          custom_dimension_2: "service_type", // crown, bridge, etc.
          custom_dimension_3: "case_status",
        },
      });
    };

    return () => {
      // Cleanup on unmount
      const scripts = document.head.getElementsByTagName("script");
      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src?.includes(measurementId)) {
          scripts[i].remove();
        }
      }
    };
  }, [measurementId]);

  return null;
}

// Analytics tracking utilities
export const analytics = {
  // Track page views
  pageview: (path: string, title?: string) => {
    if (typeof window !== "undefined" && window.gtag && _gaMeasurementId) {
      window.gtag("config", _gaMeasurementId, {
        page_path: path,
        page_title: title,
      });
    }
  },

  // Track custom events
  event: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  },

  // Track form submissions
  formSubmit: (formName: string, success: boolean) => {
    analytics.event("form_submit", "engagement", formName, success ? 1 : 0);
  },

  // Track case submissions
  caseSubmit: (serviceTypes: string[], urgency: string) => {
    analytics.event("case_submit", "conversion", serviceTypes.join(","));
    analytics.event("case_urgency", "conversion", urgency);
  },

  // Track file uploads
  fileUpload: (fileType: string, fileSize: number) => {
    analytics.event("file_upload", "engagement", fileType, Math.round(fileSize / 1024)); // KB
  },

  // Track user interactions
  userInteraction: (action: string, element: string) => {
    analytics.event("user_interaction", "engagement", element);
  },

  // Track navigation
  navigation: (from: string, to: string) => {
    analytics.event("navigation", "navigation", `${from} -> ${to}`);
  },

  // Track search
  search: (query: string, resultsCount: number) => {
    analytics.event("search", "engagement", query, resultsCount);
  },

  // Track errors
  error: (error: string, context: string) => {
    analytics.event("error", "error", context);
  },

  // Track timing
  timing: (category: string, variable: string, value: number, label?: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "timing_complete", {
        event_category: category,
        name: variable,
        value: value,
        event_label: label,
      });
    }
  },

  // Set custom dimensions
  setCustomDimension: (dimension: string, value: string) => {
    if (typeof window !== "undefined" && window.gtag && _gaMeasurementId) {
      window.gtag("config", _gaMeasurementId, {
        [dimension]: value,
      });
    }
  },

  // Track user type (dentist, lab_staff, admin)
  setUserType: (userType: string) => {
    analytics.setCustomDimension("custom_dimension_1", userType);
  },

  // Track service type
  setServiceType: (serviceType: string) => {
    analytics.setCustomDimension("custom_dimension_2", serviceType);
  },

  // Track case status
  setCaseStatus: (status: string) => {
    analytics.setCustomDimension("custom_dimension_3", status);
  },
};

// React hook for analytics
export function useAnalytics() {
  return {
    trackPageView: (path: string, title?: string) => {
      useEffect(() => {
        analytics.pageview(path, title);
      }, [path, title]);
    },
    trackEvent: (action: string, category: string, label?: string, value?: number) => {
      analytics.event(action, category, label, value);
    },
    trackFormSubmit: (formName: string, success: boolean) => {
      analytics.formSubmit(formName, success);
    },
    trackCaseSubmit: (serviceTypes: string[], urgency: string) => {
      analytics.caseSubmit(serviceTypes, urgency);
    },
    trackFileUpload: (fileType: string, fileSize: number) => {
      analytics.fileUpload(fileType, fileSize);
    },
    trackUserInteraction: (action: string, element: string) => {
      analytics.userInteraction(action, element);
    },
    trackNavigation: (from: string, to: string) => {
      analytics.navigation(from, to);
    },
    trackError: (error: string, context: string) => {
      analytics.error(error, context);
    },
    setUserType: (userType: string) => {
      analytics.setUserType(userType);
    },
    setServiceType: (serviceType: string) => {
      analytics.setServiceType(serviceType);
    },
    setCaseStatus: (status: string) => {
      analytics.setCaseStatus(status);
    },
  };
}
