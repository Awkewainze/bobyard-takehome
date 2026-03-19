import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { type API } from "@/types";
import { LoadingImage } from "./LoadingImage";
import { Comment } from "./Comment";
import newMessageImg from "@/assets/new-message.svg";

export function CommentList() {
	const [comments, setComments] = useState<API.Comment[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const fetching = useRef(false);

	const fetchData = useCallback(async () => {
		if (fetching.current) {
			return;
		}
		try {
			fetching.current = true;
			const cursor = comments.length === 0 ? 0 : comments[comments.length - 1]?.id;
			const res = await fetch(
				`/api/comments?take=10&cursor=${cursor}`
			);
			const data: API.Comment[] = await res.json();
			if (res.ok) {
				if (data.length === 0) {
					setHasMore(false);
					return;
				}
				setComments((prevItems) => [...prevItems, ...data]);
			}
		} catch (error) {
			console.log(error);
		} finally {
			fetching.current = false;
		}
	}, [comments, hasMore]);

	useEffect(() => {
		let subscribed = true;
		(async () => {
			if (subscribed) {
				await fetchData();
			}
		})();
		return () => {
			subscribed = false;
		};
	}, []);

	function handleCreateNew() {
		if (!canCreateNew) {
			return;
		}
		const newComment: API.Comment = {
			id: -1,
			author: "",
			image: "",
			likes: 0,
			text: "",
			date: new Date()
		}

		setComments([newComment, ...comments])
	}

	function createUpdateFunction(existingComment: API.Comment) {
		return function (newComment: API.Comment | null) {
			if (newComment == null) {
				setComments(comments.filter(x => x !== existingComment));
				return;
			}

			const newComments = comments.map(x => {
				if (x === existingComment) {
					return newComment;
				}

				return x;
			});

			setComments(newComments);
		}
	}

	function createHandleCancelFunction(existingComment: API.Comment) {
		return function () {
			if (existingComment.id == -1) {
				setComments(comments.filter(x => x.id != -1));
			}
		}
	}

	const canCreateNew = useMemo(() => !comments.find(x => x.id === -1), [comments]);

	return <div className="flex flex-col">
		<div className="flex flex-row justify-end mr-10 ml-10 pr-10 pl-10">
			{canCreateNew &&
				<button className="flex flex-row place-content-center text-sm align-text-middle mt-4 p-2 w-48 rounded-4xl border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700" onClick={handleCreateNew}>
					<img className="flex justify-center align-middle w-8 h-8" src={newMessageImg} alt="" />
					<span className="flex self-center pl-4">Add new comment</span>
				</button>}
		</div>
		<div className="flex">
			<InfiniteScroll
				dataLength={comments.length}
				next={fetchData}
				hasMore={hasMore}
				loader={<div className="p-10 m-10 w-full h-full items-center text-center"><LoadingImage /></div>}
				endMessage={
					<p style={{ textAlign: 'center' }}>
						<b>You've reached the start of this conversation!</b>
					</p>
				}
			>
				{comments.map(x => (<Comment key={x.id} existingComment={x} updateFn={createUpdateFunction(x)} cancelFn={createHandleCancelFunction(x)} />))}
			</InfiniteScroll>
		</div>
	</div>

}
