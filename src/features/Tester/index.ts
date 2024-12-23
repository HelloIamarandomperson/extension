import type { Nullable } from "@/src/types";
import { waitForSpecificMessage } from "@/src/utils/utilities";

let recommendationsObserver: Nullable<MutationObserver> = null;
let disableObserver = false;

async function enableHidePlaylist() {
  const {
    data: {
      options: { enable_hide_playlist },
    },
  } = await waitForSpecificMessage("options", "request_data", "content");

  if (!enable_hide_playlist) return;

  hideRecommendations();
  observeHomePageRecommendations();
}

function disableHidePlaylist() {
  showRecommendations();

  if (recommendationsObserver) {
    recommendationsObserver.disconnect();
    recommendationsObserver = null;
  }
}

function observeHomePageRecommendations() {
  const homePageObserver = new MutationObserver((mutations) => {
    if (disableObserver) return;

    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        Array.from(mutation.addedNodes).forEach((node) => {
          if (node instanceof HTMLElement && node.tagName === "YTD-RICH-ITEM-RENDERER") {
            hideMixRecommendation(node);
          } else if (node instanceof HTMLElement) {
            node.querySelectorAll<HTMLElement>("ytd-rich-item-renderer").forEach(hideMixRecommendation);
          }
        });
      }
    });

    if (hasRecommendationsOnHomePage()) {
      hideRecommendations();
    }
  });

  homePageObserver.observe(document.body, { childList: true, subtree: true });
  recommendationsObserver = homePageObserver;
}

function hideMixRecommendation(element: HTMLElement) {
  if (element.querySelector("yt-collection-thumbnail-view-model")) {
    element.style.display = "none";
  }
}

function toggleRecommendationsVisibility(recommendationsVisible: boolean) {
  // Use requestAnimationFrame to ensure synchronization
  requestAnimationFrame(() => {
    disableObserver = !recommendationsVisible;

    const richItemRenderers = document.querySelectorAll<HTMLElement>("ytd-rich-item-renderer");
    richItemRenderers.forEach((item) => {
      const mixThumbnail = item.querySelector("yt-collection-thumbnail-view-model");
      if (mixThumbnail) {
        item.style.display = recommendationsVisible ? "" : "none";
      }
    });
  });
}

function hideRecommendations() {
  toggleRecommendationsVisibility(false);
}

function showRecommendations() {
  toggleRecommendationsVisibility(true);
}

function hasRecommendationsOnHomePage(): boolean {
  return document.querySelector("ytd-rich-grid-renderer #contents ytd-rich-item-renderer") !== null;
}
