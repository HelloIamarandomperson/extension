import { browserColorLog, sendContentToBackgroundMessage, waitForSpecificMessage } from "@/src/utils/utilities";

const PauseBackgroundPlayers = () => {
	sendContentToBackgroundMessage("pauseBackgroundPlayers").catch((error) => {
		throw new Error(`Failed to pause background players: ${error}`);
	});
};

export async function enablePauseBackgroundPlayers() {
	const optionsData = await waitForSpecificMessage("options", "request_data", "content");
	const {
		data: {
			options: { enable_pausing_background_players: pauseBackgroundPlayersEnabled }
		}
	} = optionsData;
	if (!pauseBackgroundPlayersEnabled) return;
	// ignore home page
	if (window.location.href.match(/^https?:\/\/(?:www\.)?youtube\.com\/?$/gm)) return;
	browserColorLog("Enabling pauseBackgroundPlayers", "FgMagenta");

	let videoPlayerContainer: HTMLVideoElement | null = null;
	if (!videoPlayerContainer) {
		videoPlayerContainer = document.querySelector(".html5-main-video");
	}
	function detectPlaying() {
		if (videoPlayerContainer) {
			videoPlayerContainer.addEventListener("playing", PauseBackgroundPlayers);
		}
	}

	let debounceTimeout: null | number = null;
	const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
		if (debounceTimeout) clearTimeout(debounceTimeout);
		// @ts-expect-error - doesn't recognize browser environment properly
		debounceTimeout = setTimeout(() => {
			for (const mutation of mutationsList) {
				if (mutation.addedNodes.length) {
					detectPlaying();
				}
			}
		}, 100);
	});

	if (videoPlayerContainer) {
		observer.observe(videoPlayerContainer, { childList: true, subtree: true });
	}
	if (!videoPlayerContainer?.paused) {
		PauseBackgroundPlayers();
	}
	detectPlaying();
}

export function disablePauseBackgroundPlayers() {
	const videoPlayerContainer: HTMLElement | null = document.querySelector(".html5-main-video");
	if (videoPlayerContainer) {
		videoPlayerContainer.removeEventListener("playing", PauseBackgroundPlayers);
	}
	browserColorLog("Disabling pauseBackgroundPlayers", "FgMagenta");
}
