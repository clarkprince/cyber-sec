import { html, nothing } from "lit";

import TWElement from "./tw";

type unixts = number;

class wtNotif extends TWElement {
  static properties = {
    notifications: { type: Array },
    hidden: { type: Boolean },
    banner: { type: Boolean },
  };

  banner: boolean;
  notifications: (Notification & { read: boolean; exp: unixts })[];

  constructor() {
    super();
    this.notifications = [];
    this.banner = false;
    this.hidden = true;
  }

  async firstUpdated() {
    if (!evtSource || evtSource.readyState === EventSource.CLOSED) {
      evtSource = new EventSource("/notifications");
      evtSource.onmessage = (e) =>
        this.notify(JSON.parse(e.data) as Notification);
    }

    notifListeners.add(this);
    if (notifElement) {
      notifElement.addEventListener("click", this.toggleNotifications);
    }
    // event listener for when the user navigates away from the page
    // or refreshes the page
    window.addEventListener("beforeunload", () => {
      evtSource!.close();
      // when a user navigates from the page without dismissing the notification
      this.removeBanner();
    });

    // get previously stored notifications, that are persisted on page change
    this.notifications =
      JSON.parse(localStorage.getItem("notifications") || "[]") || [];

    // check if there are any notifications that need to be displayed after page refresh
    if (this.notifications.some((v) => !v.read)) {
      this.banner = true;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    notifElement.removeEventListener("click", this.toggleNotifications);
  }

  notify(n: Notification) {
    const day = 8_6400_000; // ms
    const m = { read: false, exp: Date.now() + 2 * day, ...n };
    this.banner = true;
    this.notifications = [m, ...this.notifications];

    // inserting to local storage is here temporarily
    // disconnectedCallback not being called when navigating away from page
    this.updateStorage();

    // after 30 seconds the notification will be dismissed
    // might be a bit too long, but we can adjust later
    setTimeout(() => {
      this.removeBanner(m.ID);
    }, 30_000);
  }

  renderBanner(notification: Notification) {
    let buttons = <any>[];
    if (notification.Actions) {
      for (const button of notification.Actions) {
        buttons.push(
          html`<button
            class="text-white py-2 px-2 rounded text-xs bg-neutral-700 mr-2"
            @click="${() => this.doAction(button.URL)}"
          >
            ${button.Label}
          </button>`,
        );
      }
    }

    return html`<div class="fixed bottom-6 flex justify-center w-full z-10">
      <div
        id="${notification.Err ? "notification-error" : "notification-success"}"
        class="pl-7 pr-5 py-4 
              ${notification.Err
          ? "bg-red-400"
          : "bg-green-400"} w-7/12 justify-between rounded-md flex"
      >
        <div>
          <div id="notification-error-text" class="text-white">
            ${notification.Message}
          </div>
          ${buttons.length > 0
            ? html`<div class="flex mt-6">${buttons}</div>`
            : nothing}
        </div>
        <div
          class="text-3xl cursor-pointer text-white -mt-2"
          @click=${() => this.removeBanner()}
        >
          &times
        </div>
      </div>
    </div>`;
  }

  doAction(url) {
    location.href = url;
  }

  removeBanner(ID?: string) {
    this.banner = false;
    // assumption is that the first notification is the one that was displayed
    // will have to do some stress testing to see if this holds up
    for (const n of this.notifications) {
      if (!ID) {
        n.read = true;
      } else if (n.ID === ID) {
        n.read = true;
      }
    }

    // allow a hard reset for debugging purposes
    if (localStorage.getItem("notifications") !== null) {
      this.updateStorage();
    }
  }

  toggleNotifications = () => {
    this.hidden = !this.hidden;
  };

  removeNotification(ID: string) {
    console.log("ID", ID);
    this.notifications = this.notifications.filter((n) => n.ID != ID);
    this.updateStorage();
  }

  updateStorage() {
    const now = Date.now();
    localStorage.setItem(
      "notifications",
      JSON.stringify(this.notifications.filter((v) => v.exp && v.exp > now)),
    );
  }

  renderPanel() {
    let panel;
    if (this.notifications.length > 0) {
      let notificationItems = <any>[];
      for (const notification of this.notifications) {
        let buttons = <any>[];
        if (notification.Actions) {
          for (const button of notification.Actions) {
            buttons.push(html`
              <button
                class="mr-2 py-2 px-2 rounded text-xs bg-neutral-700 text-white"
                @click="${() => this.doAction(button.URL)}"
              >
                ${button.Label}
              </button>
            `);
          }
        }

        notificationItems.push(html`
          <div
            data-ID=${notification.ID}
            class="notification-item flex text-sm items-center px-4 py-4 bg-neutral-200 dark:bg-neutral-600 border-b-[1px] border-neutral-400 z-10"
          >
            <div>
              <div
                class="${notification.Err
                  ? "bg-red-400"
                  : "bg-green-400"} rounded-full w-2 h-2 mr-4"
              ></div>
            </div>
            <div class="w-11/12 break-all">
              <p class="text-sm">${notification.Message}</p>
              ${buttons.length > 0
                ? html`<div class="flex mt-3">${buttons}</div>`
                : nothing}
            </div>
            <button
              type="button"
              class="text-lg ml-2 mr-1"
              @click="${() => this.removeNotification(notification.ID)}"
            >
              &times
            </button>
          </div>
        `);
      }
      panel = html`
        <div class="h-5/6 overflow-y-auto">${notificationItems}</div>
      `;
    } else {
      panel = html` <div
        class="grow flex flex-col items-center justify-center text-xl"
      >
        <svg
          width="70"
          viewBox="0 0 24 24"
          class="fill-none stroke-neutral-900 dark:stroke-neutral-100"
        >
          <path
            d="M15 17H20L18.595 15.595C18.4063 15.4063 18.2567 15.1822 18.1546 14.9357C18.0525 14.6891 18 14.4249 18 14.158V11C18.0002 9.75894 17.6156 8.54834 16.8992 7.53489C16.1829 6.52144 15.17 5.75496 14 5.341V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3C11.4696 3 10.9609 3.21071 10.5858 3.58579C10.2107 3.96086 10 4.46957 10 5V5.341C7.67 6.165 6 8.388 6 11V14.159C6 14.697 5.786 15.214 5.405 15.595L4 17H9M15 17H9M15 17V18C15 18.7956 14.6839 19.5587 14.1213 20.1213C13.5587 20.6839 12.7956 21 12 21C11.2044 21 10.4413 20.6839 9.87868 20.1213C9.31607 19.5587 9 18.7956 9 18V17"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p>No notifications</p>
      </div>`;
    }

    return html`
      <div
        style="height: calc(100vh - 20px)"
        class="w-1/5 flex flex-col fixed left-56 bottom-4 z-10 bg-neutral-50 dark:bg-neutral-800 rounded border-l border-neutral-200 dark:border-neutral-700"
      >
        <div
          class="py-4 pl-6 pr-2 flex items-center justify-between border-b border-solid dark:border-neutral-600 text-2xl"
        >
          <h3>Notifications</h3>
          <button
            type="button"
            class="px-2"
            @click="${() => this.toggleNotifications()}"
          >
            &times
          </button>
        </div>
        ${panel}
      </div>
    `;
  }

  render() {
    // both panel and banner can be visible at the same time
    let display = new Array<any>();
    if (this.banner) {
      display.push(this.renderBanner(this.notifications[0]));
    }

    if (!this.hidden) {
      display.push(this.renderPanel());
    }

    return html`${display}`;
  }
}

const notifListeners = new Set<{ notify(n: Notification) }>();
let evtSource: EventSource | null = null;

const notifElement = document.getElementById("notifications")!;

console.assert(
  notifElement !== undefined,
  "No notification element on page, menu will not be triggered",
);

interface Notification {
  ID: string;
  Message: string;
  Err: boolean;
  Actions: { URL: string; Label: string }[];
}

/** notify sends a notification to the user
 *
 * This is the JS equivalent of the Go code, and should only be used if the user can meaningfully act on the issue.
 * This call does not block the continuation of the flow, using a micro-task.
 */
export const notify = (
  ID: string,
  Message: string,
  Err: boolean = false,
  Actions: { URL: string; Label: string }[] = [],
): void => {
  queueMicrotask(() => {
    for (const l of notifListeners) {
      l.notify({ ID, Message, Err, Actions });
    }
  });
};

customElements.define("wt-notif", wtNotif);
