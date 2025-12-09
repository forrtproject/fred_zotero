/**
 * Onboarding module for Replication Checker
 * Displays a multi-screen welcome guide for first-time users
 */

import { getString } from "../utils/strings";

const ONBOARDING_VERSION = 1;
const ONBOARDING_PREF = "extensions.zotero.replication-checker.onboardingVersion";

interface OnboardingScreen {
  title: string;
  content: string;
  image?: string;
  highlight?: {
    selector: string;
    action?: () => void;
  };
}

export class OnboardingManager {
  private currentScreen = 0;
  private readonly screens: OnboardingScreen[] = [
    {
      title: getString("onboarding-welcome-title"),
      content: getString("onboarding-welcome-content"),
    },
    {
      title: getString("onboarding-tools-title"),
      content: getString("onboarding-tools-content"),
    },
    {
      title: getString("onboarding-context-title"),
      content: getString("onboarding-context-content"),
    },
  ];

  /**
   * Check if onboarding should be shown
   */
  shouldShowOnboarding(): boolean {
    try {
      const lastVersion = Zotero.Prefs.get(ONBOARDING_PREF);
      return !lastVersion || (lastVersion as number) < ONBOARDING_VERSION;
    } catch (e) {
      return true; // Show if preference doesn't exist
    }
  }

  /**
   * Mark onboarding as complete
   */
  markOnboardingComplete(): void {
    Zotero.Prefs.set(ONBOARDING_PREF, ONBOARDING_VERSION);
    Zotero.debug(`[ReplicationChecker] Onboarding marked complete (version ${ONBOARDING_VERSION})`);
  }

  /**
   * Show the onboarding dialog
   */
  async showOnboarding(): Promise<boolean> {
    return new Promise((resolve) => {
      const win = Zotero.getMainWindow();
      if (!win) {
        Zotero.debug("[ReplicationChecker] Main window not available for onboarding");
        resolve(false);
        return;
      }

      this.currentScreen = 0;
      this.createDialog(win, resolve);
    });
  }

  /**
   * Trigger interactive highlight for current screen
   */
  triggerHighlight(mainWindow: Window): void {
    const screen = this.screens[this.currentScreen];
    if (!screen.highlight) return;

    try {
      const element = mainWindow.document.querySelector(screen.highlight.selector);
      if (element) {
        // Add highlight effect
        (element as HTMLElement).style.outline = "3px solid #667eea";
        (element as HTMLElement).style.outlineOffset = "2px";
        (element as HTMLElement).style.transition = "outline 0.3s ease";

        // Execute custom action if provided
        if (screen.highlight.action) {
          screen.highlight.action();
        }

        // Remove highlight after 3 seconds
        setTimeout(() => {
          (element as HTMLElement).style.outline = "";
          (element as HTMLElement).style.outlineOffset = "";
        }, 5000);
      }
    } catch (e) {
      Zotero.debug(`[ReplicationChecker] Error highlighting element: ${e}`);
    }
  }

  /**
   * Clear all highlights
   */
  clearHighlights(mainWindow: Window): void {
    const allHighlighted = mainWindow.document.querySelectorAll('[style*="outline"]');
    allHighlighted.forEach((el: Element) => {
      (el as HTMLElement).style.outline = "";
      (el as HTMLElement).style.outlineOffset = "";
    });
  }

  /**
   * Create the onboarding dialog window
   */
  private createDialog(parentWindow: Window, onComplete: (completed: boolean) => void): void {
    const dialogFeatures = "chrome,centerscreen,modal,resizable=no,width=600,height=500";

    // Open the dialog using chrome:// URL
    parentWindow.openDialog(
      "chrome://replicationChecker/content/onboarding.xhtml",
      "replication-checker-onboarding",
      dialogFeatures,
      {
        screens: this.screens,
        onComplete: (completed: boolean) => {
          if (completed) {
            this.markOnboardingComplete();
          }
          this.clearHighlights(parentWindow);
          onComplete(completed);
        },
        triggerHighlight: (screenIndex: number) => {
          this.currentScreen = screenIndex;
          this.triggerHighlight(parentWindow);
        },
        clearHighlights: () => {
          this.clearHighlights(parentWindow);
        },
      }
    );
  }

  /**
   * Get current screen data
   */
  getCurrentScreen(): OnboardingScreen {
    return this.screens[this.currentScreen];
  }

  /**
   * Get progress string (e.g., "1/3")
   */
  getCurrentProgress(): string {
    return `${this.currentScreen + 1}/${this.screens.length}`;
  }

  /**
   * Check if can go to previous screen
   */
  canGoPrevious(): boolean {
    return this.currentScreen > 0;
  }

  /**
   * Check if on last screen
   */
  isLastScreen(): boolean {
    return this.currentScreen === this.screens.length - 1;
  }

  /**
   * Go to next screen
   */
  nextScreen(): void {
    if (this.currentScreen < this.screens.length - 1) {
      this.currentScreen++;
    }
  }

  /**
   * Go to previous screen
   */
  previousScreen(): void {
    if (this.currentScreen > 0) {
      this.currentScreen--;
    }
  }
}

// Export singleton instance
export const onboardingManager = new OnboardingManager();
