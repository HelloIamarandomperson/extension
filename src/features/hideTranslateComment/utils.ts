import { isNewYouTubeVideoLayout, modifyElementClassList } from "@/src/utils/utilities";
export const translateButtonSelector = "ytd-tri-state-button-view-model.translate-button";
export function observeTranslateComment(): MutationObserver {
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
							addedNode.querySelector(translateButtonSelector) !== null
					)
			)
			.forEach((mutation) => {
				mutation.addedNodes.forEach((addedNode) => {
					modifyElementClassList("add", {
						className: "yte-hide-translate-comment",
						element: (addedNode as Element).querySelector(translateButtonSelector)
					});
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
