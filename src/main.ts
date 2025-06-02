import {
  BoltTransactionSuccess,
  isBoltTransactionSuccessEvent,
} from "./types/transaction";

const createBoltSDK = function () {
  let activeIframeContainer: HTMLDivElement | null = null;

  return {
    charge: {
      checkout(url: string): Promise<BoltTransactionSuccess> {
        activeIframeContainer = document.createElement("div");
        activeIframeContainer.id = "bolt-iframe-shell";

        const iframe = document.createElement("iframe");
        iframe.id = "bolt-iframe-container";
        iframe.src = url;

        activeIframeContainer.appendChild(iframe);

        document.body.appendChild(activeIframeContainer);

        return new Promise(resolve => {
          function handleMessage(event: MessageEvent) {
            if (event.data?.type?.startsWith("react")) return;
            if (event.origin !== new URL(url).origin) return;

            if (isBoltTransactionSuccessEvent(event.data)) {
              activeIframeContainer?.remove();
              activeIframeContainer = null;
              window.removeEventListener("message", handleMessage);
              resolve(event.data.payload);
            }
          }

          window.addEventListener("message", handleMessage);
        });
      },
    },
  };
};

export const BoltSDK = createBoltSDK();
