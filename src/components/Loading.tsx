import { LoadingImage } from "./LoadingImage";
import { type ReactNode } from "react";

export function Loading({ loading, children }: { loading: boolean, children: ReactNode }) {
	return <>{loading ? <LoadingImage /> : children}</>
}
