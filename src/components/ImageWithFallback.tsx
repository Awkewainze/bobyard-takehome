import { type SyntheticEvent } from "react";
import missingImg from "@/assets/missing.svg";
import z from "zod";

export function ImageWithFallback(props: { imageUrl: string }) {
	const { imageUrl } = props;
	function handleMissingImage(e: SyntheticEvent<HTMLImageElement, Event>) {
		e.currentTarget.onerror = null;
		e.currentTarget.src = missingImg;
	}

	const imageUrlValid = z.url().safeParse(imageUrl);
	return imageUrlValid.success ? <img className="mx-auto w-24 h-24 rounded-lg sm:mx-0 sm:shrink-0" src={imageUrl} onError={handleMissingImage} alt="Post image" /> : <img className="mx-auto w-24 h-24 rounded-lg sm:mx-0 sm:shrink-0" src={missingImg} alt="Post image" />;
}
