import { getFeatureIcon } from "@/src/icons";
import eventManager from "@/src/utils/EventManager";
import { type ElementClassPair, type ModifyElementAction, modifyElementClassList, modifyElementsClassList } from "@/src/utils/utilities";

import { getFeatureButton, updateFeatureButtonIcon, updateFeatureButtonTitle } from "../buttonPlacement/utils";

// TODO: get played progress bar to be accurate when maximized from default view
// TODO: Add event listener that updates scrubber position when maximize button is clicked
export function updateProgressBarPositions() {
	const seekBar = document.querySelector<HTMLDivElement>("div.ytp-progress-bar");
	const scrubber = document.querySelector<HTMLDivElement>("div.ytp-scrubber-container");
	const hoverProgress = document.querySelector<HTMLDivElement>("div.ytp-hover-progress");
	if (!seekBar) return;
	if (!scrubber) return;
	if (!hoverProgress) return;
	const elapsedTime = parseInt(seekBar?.ariaValueNow ?? "0") ?? 0;
	const duration = parseInt(seekBar?.ariaValueMax ?? "0") ?? 0;
	const seekBarWidth = seekBar?.clientWidth ?? 0;

	const scrubberPosition = Math.ceil(parseFloat(Math.min((elapsedTime / duration) * seekBarWidth, seekBarWidth).toFixed(1)));
	scrubber.style.transform = `translateX(${scrubberPosition}px)`;
	hoverProgress.style.left = `${scrubberPosition}px`;
}

function adjustPlayer(action: ModifyElementAction) {
	const elements: ElementClassPair[] = [
		{ className: "yte-maximized-video", element: document.querySelector("video.html5-main-video") },
		{ className: "yte-maximized-video-container", element: document.querySelector("div#movie_player") },
		{ className: "yte-maximized-chrome-bottom", element: document.querySelector("div.ytp-chrome-bottom") },
		{ className: "yte-maximized-chapter-hover-container", element: document.querySelector("div.ytp-chapter-hover-container") },
		{
			className: "yte-maximized-storyboard-framepreview-timestamp",
			element: document.querySelector("div.ytp-storyboard-framepreview-timestamp")
		},
		{
			className: "yte-maximized-heat-map-chapter",
			element: document.querySelector("div.ytp-heat-map-chapter")
		}
	];
	modifyElementsClassList(action, elements);
}
function adjustTooltip(action: ModifyElementAction, element: ElementClassPair) {
	modifyElementClassList(action, element);
}

export function maximizePlayer() {
	const videoPlayer = document.querySelector<HTMLVideoElement>("video.html5-main-video");
	if (!videoPlayer) return;
	eventManager.addEventListener(videoPlayer, "timeupdate", updateProgressBarPositions, "maximizePlayerButton");
	const chromeBottom = document.querySelector<HTMLDivElement>("div.ytp-chrome-bottom");
	if (!chromeBottom) return;
	const leftControls = chromeBottom.querySelector<HTMLDivElement>("div.ytp-left-controls");
	if (!leftControls) return;
	const rightControls = chromeBottom.querySelector<HTMLDivElement>("div.ytp-right-controls");
	if (!rightControls) return;
	const pipElement = document.querySelector<HTMLButtonElement>("button.ytp-pip-button");
	const sizeElement = document.querySelector<HTMLButtonElement>("button.ytp-size-button");
	const miniPlayerElement = document.querySelector<HTMLButtonElement>("button.ytp-miniplayer-button");
	adjustPlayer("add");
	[pipElement, sizeElement, miniPlayerElement].forEach((element) => {
		if (element)
			eventManager.addEventListener(
				element,
				"click",
				() => {
					minimizePlayer();
					const maximizePlayerButton = getFeatureButton("maximizePlayerButton");
					if (!maximizePlayerButton) return;
					maximizePlayerButton.ariaChecked = "false";
					const button = getFeatureButton("maximizePlayerButton");
					const icon = getFeatureIcon("maximizePlayerButton", "player_controls_left");
					if (button && button instanceof HTMLButtonElement) {
						if (typeof icon === "object" && "off" in icon && "on" in icon) updateFeatureButtonIcon(button, icon.off);
						updateFeatureButtonTitle(
							"maximizePlayerButton",
							window.i18nextInstance.t("pages.content.features.maximizePlayerButton.button.toggle.off")
						);
					}
				},
				"maximizePlayerButton"
			);
	});
	([...leftControls.childNodes, ...rightControls.childNodes] as HTMLElement[]).forEach((node) => {
		eventManager.addEventListener(
			node,
			"mouseenter",
			() =>
				adjustTooltip("add", {
					className: "yte-maximized-tooltip",
					element: (() => {
						return document.querySelector("div#movie_player > div.ytp-tooltip");
					})()
				}),
			"maximizePlayerButton"
		);
	});
}

export function minimizePlayer() {
	adjustPlayer("remove");
}
