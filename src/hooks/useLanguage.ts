import { useState } from "react";
import { useEventListener } from "usehooks-ts";

export function useLanguage() {
	const [language, setLanguage] = useState(navigator.language);
	useEventListener("languagechange", () => void setLanguage(navigator.language));

	return language;
}
