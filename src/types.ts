export namespace API {
	export type CommentResponse = {
		id: number,
		author: string,
		text: string,
		date: Date,
		likes: number,
		image: string,
		parentId: number | null

		children: API.CommentResponse[]
	}

	export type UpdateComment = Omit<CommentResponse, "id" | "date" | "likes" | "children">;
}

export type Callback = () => void;
export type Predicate<T> = (value: T) => boolean;
export type Provider<T> = () => T;
export type Consumer<T> = (value: T) => void;
export type Mapper<T, U> = (value: T) => U;
export type AsyncCallback = () => Promise<void>;
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;
export type AsyncProvider<T> = () => Promise<T>;
export type AsyncConsumer<T> = (value: T) => Promise<void>;
export type AsyncMapper<T, S> = (value: T) => Promise<S>;
