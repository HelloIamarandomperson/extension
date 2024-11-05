export const availableLocales = [
  "ca-ES",
  "cs-CZ",
  "de-DE",
  "en-GB",
  "en-US",
  "es-ES",
  "fa-IR",
  "fr-FR",
  "he-IL",
  "hi-IN",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "pl-PL",
  "pt-BR",
  "ru-RU",
  "sv-SE",
  "tr-TR",
  "uk-UA",
  "vi-VN",
  "zh-CN",
  "zh-TW"
] as const;
export const localePercentages: Record<AvailableLocales, number> = {
	"en-US": 100,
	"ca-ES": 0,
	"cs-CZ": 0,
	"de-DE": 27,
	"en-GB": 1,
	"es-ES": 48,
	"fa-IR": 0,
	"fr-FR": 50,
	"he-IL": 0,
	"hi-IN": 0,
	"it-IT": 89,
	"ja-JP": 89,
	"ko-KR": 89,
	"pl-PL": 0,
	"pt-BR": 55,
	"ru-RU": 89,
	"sv-SE": 89,
	"tr-TR": 62,
	"uk-UA": 18,
	"vi-VN": 0,
	"zh-CN": 89,
	"zh-TW": 86
};
export const localeDirection: Record<AvailableLocales, "ltr" | "rtl"> = {
	"ca-ES": "ltr",
	"cs-CZ": "ltr",
	"de-DE": "ltr",
	"en-GB": "ltr",
	"en-US": "ltr",
	"es-ES": "ltr",
	"fa-IR": "rtl",
	"fr-FR": "ltr",
	"he-IL": "rtl",
	"hi-IN": "ltr",
	"it-IT": "ltr",
	"ja-JP": "ltr",
	"ko-KR": "ltr",
	"pl-PL": "ltr",
	"pt-BR": "ltr",
	"ru-RU": "ltr",
	"sv-SE": "ltr",
	"tr-TR": "ltr",
	"uk-UA": "ltr",
	"vi-VN": "ltr",
	"zh-CN": "ltr",
	"zh-TW": "ltr"
};
export type AvailableLocales = (typeof availableLocales)[number];