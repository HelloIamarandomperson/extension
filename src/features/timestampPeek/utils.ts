import type { Nullable } from "@/src/types";

import eventManager from "@/src/utils/EventManager";
import { isNewYouTubeVideoLayout } from "@/src/utils/utilities";
export const timestampElementSelector = ".yt-core-attributed-string__link";
export const timestampsWithListeners = new Set<string>();
export function getVideoHref() {
	const {
		location: { search }
	} = window;
	const vParam = new URLSearchParams(search).get("v");
	if (!vParam) return null;
	return `/watch?v=${vParam}`;
}
export function getTimestampFromString(str: string) {
	const timestampParam = new URLSearchParams(str).get("t") ?? "0";
	return parseInt(timestampParam, 10);
}
function getTimestampTextElements() {
	const timestampLinkHref = getVideoHref();
	if (!timestampLinkHref) return [];
	return Array.from(document.querySelectorAll<HTMLElement>(`${timestampElementSelector}[href^='${timestampLinkHref}']`));
}
function getTimestamps(): [HTMLElement, number][] {
	return getTimestampTextElements()
		.map((timestampTextElement) => [
			timestampTextElement,
			timestampTextElement.getAttribute("href") ? getTimestampFromString(timestampTextElement.getAttribute("href")!) : 0
		])
		.filter(([, timestamp]) => timestamp !== 0) as [HTMLElement, number][];
}
async function previewTimestamp(element: HTMLElement, timestamp: number) {
	// TODO: figure out how to properly preview the timestamp when hover occurs.
	const playerContainer = document.querySelector<HTMLDivElement>("#movie_player");
	if (!playerContainer) return;
	playerContainer.style.position = "absolute";
	playerContainer.style.top = `${element.getBoundingClientRect().top + window.scrollY}px`;
	playerContainer.style.width = "200px";
	playerContainer.style.maxWidth = "unset";
	playerContainer.style.transform = "translateX(-50%)";
	playerContainer.style.left = "50%";
	const player = playerContainer.querySelector(".video-stream.html5-main-video") as HTMLVideoElement;
	player.currentTime = timestamp;
	await player.play();
}
export function handleTimestampHover(element: HTMLElement, timestamp: number) {
	const videoElement = document.querySelector<HTMLVideoElement>("video");
	if (!videoElement) return;
	console.log("Timestamp hover", timestamp, element);
	const { currentTime } = videoElement;
	const isPlaying = !videoElement.paused;
	eventManager.addEventListener(
		element,
		"mouseenter",
		() => {
			void (async () => {
				await previewTimestamp(element, timestamp);
			})();
		},
		"timestampPeek"
	);
	eventManager.addEventListener(
		element,
		"mouseleave",
		() => {
			void (async () => {
				videoElement.currentTime = currentTime;
				if (isPlaying) await videoElement.play();
			})();
		},
		"timestampPeek"
	);
}
export function handleTimestampElementsHover() {
	const timestampTextElements = getTimestamps();
	timestampTextElements.forEach(([element, timestamp]) => {
		const commentElement = element.closest(".yt-core-attributed-string");
		if (!commentElement) return;
		const { textContent: commentText } = commentElement;
		if (!commentText) return;
		if (timestampsWithListeners.has(commentText)) return;
		timestampsWithListeners.add(commentText);
		handleTimestampHover(element, timestamp);
	});
}
export function observeTimestampElements(): Nullable<MutationObserver> {
	const timestampLinkHref = getVideoHref();
	if (!timestampLinkHref) return null;
	const observer = new MutationObserver((mutationList) => {
		mutationList
			.filter((mutation) => mutation.type === "childList")
			.filter(
				(mutation) =>
					(mutation.target instanceof Element &&
						mutation.target.matches("ytd-comment-thread-renderer #replies ytd-comment-replies-renderer #expander #contents")) ||
					Array.from(mutation.addedNodes).some(
						(addedNode) =>
							addedNode instanceof Element &&
							addedNode.matches("ytd-comment-thread-renderer") &&
							addedNode.querySelector(`${timestampElementSelector}[href^='${timestampLinkHref}']`) !== null
					)
			)
			.filter((mutation) => mutation.addedNodes.length > 0)
			.forEach((mutation) => {
				mutation.addedNodes.forEach((addedNode) => {
					const timestampHrefElement = (addedNode as Element).querySelector(`${timestampElementSelector}[href^='${timestampLinkHref}']`);
					if (!timestampHrefElement) return;
					const timestampHref = timestampHrefElement.getAttribute("href");
					if (!timestampHref) return;
					const commentElement = (addedNode as Element).querySelector("yt-attributed-string .yt-core-attributed-string");
					if (!commentElement) return;
					const { textContent: commentText } = commentElement;
					if (!commentText) return;
					if (timestampsWithListeners.has(commentText)) return;
					timestampsWithListeners.add(commentText);
					handleTimestampHover(timestampHrefElement as HTMLElement, getTimestampFromString(timestampHref));
				});
			});
	});
	const commentsSection = document.querySelector(
		isNewYouTubeVideoLayout() ?
			"ytd-comments ytd-item-section-renderer#sections.ytd-comments div#contents"
		:	"ytd-comments.ytd-watch-flexy ytd-item-section-renderer#sections.ytd-comments div#contents"
	) as Element;
	observer.observe(commentsSection, { childList: true, subtree: true });
	return observer;
}
