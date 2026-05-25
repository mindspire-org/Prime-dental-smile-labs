import { useEffect, useState, ReactNode } from "react";
import { AlertTriangle, Lock, Unlock } from "lucide-react";

interface LayoutGuardProps {
  children: ReactNode;
  isEditing?: boolean;
  protectedElements?: string[];
  onLayoutChange?: (changes: LayoutChange[]) => void;
}

interface LayoutChange {
  type: "add" | "remove" | "modify" | "move";
  element: string;
  selector: string;
  timestamp: Date;
  oldValue?: string;
  newValue?: string;
}

export function LayoutGuard({ 
  children, 
  isEditing = false, 
  protectedElements = [],
  onLayoutChange 
}: LayoutGuardProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [changes, setChanges] = useState<LayoutChange[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  // Default protected elements for Prime Smile design
  const defaultProtectedElements = [
    "header",
    "nav",
    ".site-header",
    ".main-navigation",
    "footer",
    ".site-footer",
    ".brand-logo",
    ".hero-section",
    ".cta-button",
    "[data-protected]",
  ];

  const elementsToProtect = [...defaultProtectedElements, ...protectedElements];

  useEffect(() => {
    if (!isEditing) return;

    const observer = new MutationObserver((mutations) => {
      const newChanges: LayoutChange[] = [];

      mutations.forEach((mutation) => {
        const target = mutation.target as Element;
        const selector = getSelector(target);

        // Check if this is a protected element
        const isProtected = elementsToProtect.some(selector => {
          try {
            return target.matches && target.matches(selector);
          } catch {
            return false;
          }
        });

        if (isProtected && isLocked) {
          // Show warning for protected elements (can't actually prevent DOM mutations)
          setShowWarning(true);
          return;
        }

        // Track changes for audit
        if (mutation.type === "childList") {
          mutation.removedNodes.forEach((node) => {
            if (node instanceof Element) {
              newChanges.push({
                type: "remove",
                element: node.tagName.toLowerCase(),
                selector: getSelector(node),
                timestamp: new Date(),
              });
            }
          });

          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              newChanges.push({
                type: "add",
                element: node.tagName.toLowerCase(),
                selector: getSelector(node),
                timestamp: new Date(),
              });
            }
          });
        }

        if (mutation.type === "attributes") {
          newChanges.push({
            type: "modify",
            element: target.tagName.toLowerCase(),
            selector: selector,
            timestamp: new Date(),
            oldValue: mutation.oldValue || undefined,
            newValue: target.getAttribute(mutation.attributeName || "") || undefined,
          });
        }
      });

      if (newChanges.length > 0) {
        const updatedChanges = [...changes, ...newChanges];
        setChanges(updatedChanges);
        onLayoutChange?.(updatedChanges);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [isEditing, isLocked, elementsToProtect, changes, onLayoutChange]);

  // Generate CSS selector for an element
  function getSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ').join('.')}`;
    return element.tagName.toLowerCase();
  }

  // Restore original layout
  const restoreLayout = () => {
    // This would ideally restore from a saved state
    // For now, we'll just reload the page
    window.location.reload();
  };

  // Export changes for backup
  const exportChanges = () => {
    const data = {
      timestamp: new Date().toISOString(),
      changes: changes,
      protectedElements: elementsToProtect,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `layout-changes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isEditing) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Layout Guard Toolbar */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-border-silver p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            {isLocked ? <Lock size={16} className="text-teal" /> : <Unlock size={16} className="text-orange-500" />}
            Layout Guard
          </h3>
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              isLocked 
                ? "bg-teal text-white hover:bg-teal/90" 
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {isLocked ? "Locked" : "Unlocked"}
          </button>
        </div>

        {isLocked && (
          <p className="text-xs text-muted-grey mb-3">
            Critical design elements are protected from accidental changes.
          </p>
        )}

        {!isLocked && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3">
            <p className="text-xs text-orange-800">
              ⚠️ Layout protection is disabled. Be careful with changes!
            </p>
          </div>
        )}

        {changes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium mb-1">Recent Changes ({changes.length})</p>
            <div className="max-h-20 overflow-y-auto text-xs">
              {changes.slice(-3).reverse().map((change, index) => (
                <div key={index} className="text-muted-grey">
                  {change.type} {change.element}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={restoreLayout}
            className="flex-1 px-2 py-1 bg-bg-soft rounded text-xs hover:bg-bg-soft/80 transition"
          >
            Restore
          </button>
          <button
            onClick={exportChanges}
            className="flex-1 px-2 py-1 bg-bg-soft rounded text-xs hover:bg-bg-soft/80 transition"
          >
            Export
          </button>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-semibold">Protected Element Detected</h3>
            </div>
            <p className="text-sm text-muted-grey mb-4">
              You're trying to modify a protected design element. This could break the page layout and user experience.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 px-4 py-2 border border-border-silver rounded-lg text-sm hover:bg-bg-soft transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLocked(false);
                  setShowWarning(false);
                }}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
              >
                Unlock Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

// CSS-in-JS for protected elements
export const protectedStyles = `
  [data-protected] {
    position: relative;
  }

  [data-protected]:hover::before {
    content: '';
    position: absolute;
    inset: -2px;
    border: 2px dashed #0aabbd;
    border-radius: 4px;
    pointer-events: none;
    z-index: 9999;
  }

  [data-protected]:hover::after {
    content: 'Protected';
    position: absolute;
    top: -8px;
    right: -8px;
    background: #0aabbd;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 10000;
  }

  .layout-guard-active [data-protected] {
    outline: 1px solid #0aabbd;
    outline-offset: 2px;
  }
`;

// Hook for layout protection
export function useLayoutGuard() {
  const [isEditing, setIsEditing] = useState(false);
  const [changes, setChanges] = useState<LayoutChange[]>([]);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const addProtectedElement = (selector: string) => {
    // This would update the protected elements list
    console.log("Adding protected element:", selector);
  };

  const removeProtectedElement = (selector: string) => {
    // This would remove an element from protection
    console.log("Removing protected element:", selector);
  };

  return {
    isEditing,
    setIsEditing,
    toggleEditing,
    changes,
    setChanges,
    addProtectedElement,
    removeProtectedElement,
  };
}
