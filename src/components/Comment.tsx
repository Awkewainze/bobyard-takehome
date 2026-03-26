import type { API } from "@/types";
import { useDateTimeFormatter } from "@/hooks";
import { extractErrorText } from "@/utils";
import { zComment } from "@/validations";
import { useMemo, useState } from "react";
import { prettifyError } from "zod";
import upvote from "@/assets/upvote.svg";
import { Loading } from "./Loading";
import { ImageWithFallback } from "./ImageWithFallback";

export function Comment(props: { existingComment: API.CommentResponse, updateFn: (comment: API.CommentResponse | null) => void, cancelFn: () => void }) {
	const { existingComment, updateFn, cancelFn } = props;
	const isNew = existingComment.id == -1;

	const [mode, setMode] = useState<"view" | "edit">(isNew ? "edit" : "view");
	const [author, setAuthor] = useState<string>(existingComment.author ?? "");
	const [text, setText] = useState<string>(existingComment.text ?? "");
	const [imageUrl, setImageUrl] = useState(existingComment.image ?? "");
	const [likes, setLikes] = useState(existingComment.likes ?? 0);
	const [children, setChildren] = useState(existingComment.children);

	const [errorText, setErrorText] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const formatter = useDateTimeFormatter({ dateStyle: "short", timeStyle: "short" });
	const humanReadableDate = formatter.format(new Date(existingComment!.date));

	const canReply = useMemo(() => !children.find(x => x.id === -1), [children]);

	const ImageWithFallbackMemo = useMemo(() => {
		return <ImageWithFallback imageUrl={imageUrl} />
	}, [imageUrl]);

	const [canLike, setCanLike] = useState(true);
	async function handleLike() {
		if (!canLike) {
			return;
		}
		setCanLike(false);
		const res = await fetch(`/api/comments/${existingComment.id}/like`, { method: "POST" });
		if (!res.ok) {
			console.error(extractErrorText(res));
			setCanLike(true);
			return;
		}
		const body: { likes: number } = await res.json();
		setLikes(body.likes);
		setCanLike(true);
	}

	if (mode === "edit") {
		function ValidationErrors() {
			if (!errorText) {
				return;
			}

			return <div>
				<p className="text-red-500 font-semibold text-sm whitespace-pre-line">{errorText}</p>
			</div>
		}

		function preValidate(): boolean {
			const result = zComment.safeParse({ author, text, image: imageUrl });
			if (result.success) {
				return true;
			}

			setErrorText(prettifyError(result.error));
			return false;
		}

		function buildRequestBody(): API.UpdateComment {
			return {
				author,
				text,
				image: imageUrl ?? "",
				parentId: existingComment.parentId ?? null
			};
		}

		function updateOrCreateComment() {
			const body = JSON.stringify(buildRequestBody());
			if (isNew) {
				return fetch(
					`/api/comments`, { method: "POST", body }
				);
			} else {
				return fetch(
					`/api/comments/${existingComment!.id}`, { method: "PUT", body }
				);
			}
		}

		async function handleSubmit() {
			if (!preValidate()) {
				return;
			}

			setSubmitting(true);
			try {
				const res = await updateOrCreateComment();

				if (!res.ok) {
					setErrorText(await extractErrorText(res));
					return;
				}

				const updatedComment = await res.json();
				updatedComment.children = [];
				setMode("view");
				updateFn(updatedComment);
			} finally {
				setSubmitting(false);
			}
		};

		function handleCancel() {
			setMode("view");
			setAuthor(existingComment?.author ?? "");
			setText(existingComment?.text ?? "");
			setImageUrl(existingComment?.image ?? "");
			setErrorText(null);
			cancelFn();
		}

		async function handleDelete() {
			await fetch(
				`/api/comments/${existingComment!.id}`, { method: "DELETE" }
			);
			updateFn(null);
		}

		return <Loading loading={submitting}>
			<div className="flex flex-col gap-2 p-8 mt-8 sm:flex-row sm:items-center sm:gap-6 sm:py-4">
				<div className="flex-1">
					{ImageWithFallbackMemo}
				</div>
				<div className="flex-12 space-y-2 text-center sm:text-left">
					<div className="space-y-0.5">
						<div className="flex flex-row align-middle items-center">
							<label className="flex-1" htmlFor="author">Author</label>
							<input className="flex-12 border-2 rounded m-1 p-1 border-gray-200" type="text" name="author" value={author} onChange={e => setAuthor(e.target.value)} />
						</div>
						<div className="flex flex-row align-middle items-center">
							<label className="flex-1" htmlFor="text">Text</label>
							<textarea className="flex-12 border-2 h-36 rounded m-1 p-1 border-gray-200" name="text" value={text} onChange={e => setText(e.target.value)} />
						</div>
						<div className="flex flex-row align-middle items-center">
							<label className="flex-1" htmlFor="image">Image</label>
							<input className="flex-12 border-2 rounded m-1 p-1 border-gray-200" type="text" name="image" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
						</div>
						<ValidationErrors />
					</div>
					<div className="flex justify-end">
						<button className="mt-4 p-2 w-24 rounded-4xl border-green-200 text-green-600 hover:border-transparent hover:bg-green-600 hover:text-white active:bg-green-700" onClick={handleSubmit}>
							{isNew ? "Post" : "Update"}
						</button>
						<button className="mt-4 p-2 w-24 rounded-4xl border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700" onClick={handleCancel}>
							Cancel
						</button>
						{!isNew && <button className="mt-4 p-2 w-24 rounded-4xl border-red-200 text-red-600 hover:border-transparent hover:bg-red-800 hover:text-white active:bg-red-900" onClick={handleDelete}>
							Delete
						</button>}
					</div>
				</div>
			</div>
		</Loading>
	}


	function handleReply() {
		if (!canReply) {
			return;
		}

		const newComment: API.CommentResponse = {
			id: -1,
			author: "",
			image: "",
			likes: 0,
			text: "",
			date: new Date(),
			children: [],
			parentId: existingComment.id
		}

		setChildren(existingChildren => [newComment, ...existingChildren]);
	}

	return <div className="">
		<div className="flex flex-row gap-2 p-4">
			<div className="flex-1">
				{ImageWithFallbackMemo}
			</div>
			<div className="flex-12 space-y-2 text-center sm:text-left">
				<div className="space-y-0.5">
					<p className="text-sm font-semibold text-black">{author}</p>
					<p className="font-medium text-gray-800 whitespace-pre-line">{text}</p>
					<p className="text-xs text-gray-600">{humanReadableDate}</p>
				</div>
				<button className="mt-4 p-2 w-16 rounded-3xl border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700" onClick={() => setMode("edit")}>
					Edit
				</button>
				<button className="mt-4 p-2 w-16 rounded-3xl border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700" onClick={handleReply}>
					Reply
				</button>
			</div>
			<div className="flex-1 space-y-2 text-center align-middle">
				<div className="space-y-0.5 align-middle">
					<button className="text-sm align-middle rounded-full border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700" onClick={handleLike}><img className="w-8 h-8" src={upvote}></img></button>
					<p className="text-sm align-middle">{likes}</p>
				</div>
			</div>
		</div>
		<div className="flex flex-col ml-12 border-l-2 rounded-l-sm border-gray-100">
			{children.map(child => <Comment key={child.id} existingComment={child} updateFn={() => { }} cancelFn={() => { }} />)}
		</div>
	</div>
		;
}
