import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { type API } from "@/types";
import { LoadingImage } from "./LoadingImage";
import { Comment } from "./Comment";
import newMessageImg from "@/assets/new-message.svg";
import { useLocalStorage } from "usehooks-ts";
import { type zAscOrDescType, type zOrderByType } from "@/validations";

export function CommentList() {
	const [comments, setComments] = useState<API.CommentResponse[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [orderBy, setOrderBy] = useLocalStorage<"date" | "id">("comment-list-order-by", "date");
	const [ascOrDesc, setAscOrDesc] = useLocalStorage<"asc" | "desc">("comment-list-asc-desc", "desc");

	const fetching = useRef(false);

	const fetchData = useCallback(async () => {
		if (fetching.current) {
			return;
		}
		try {
			fetching.current = true;
			const cursor = comments.length === 0 ? 0 : comments[comments.length - 1]?.id;
			const res = await fetch(
				`/api/comments?take=10&cursor=${cursor}&orderBy=${orderBy}&ascOrDesc=${ascOrDesc}`
			);
			const data: API.CommentResponse[] = await res.json();
			if (res.ok) {
				if (data.length === 0) {
					setHasMore(false);
					return;
				}

				setComments(prevComments => sortComments({ newComments: [...prevComments, ...data.map(x => ({ ...x, date: new Date(x.date) }))] }));
			}
		} catch (error) {
			console.log(error);
		} finally {
			fetching.current = false;
		}
	}, [comments, hasMore, orderBy, ascOrDesc]);

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

		const newComment: API.CommentResponse = {
			id: -1,
			author: "",
			image: "",
			likes: 0,
			text: "",
			date: new Date(),
			parentId: 0,
			children: []
		}

		setComments(comments => [newComment, ...comments]);
	}

	function createUpdateFunction(existingComment: API.CommentResponse) {
		return function (newComment: API.CommentResponse | null) {
			if (newComment == null) {
				setComments(comments => comments.filter(x => x !== existingComment));
				return;
			}

			setComments(comments => {
				const mapped = comments.map(x => {
					if (x === existingComment) {
						newComment.date = new Date(newComment.date);
						return newComment;
					}

					return x;
				});

				return sortComments({ newComments: mapped });
			});
		}
	}

	function createHandleCancelFunction(existingComment: API.CommentResponse) {
		return function () {
			if (existingComment.id == -1) {
				setComments(comments.filter(x => x.id != -1));
			}
		}
	}

	function sortComments(newValues: { newComments?: Array<API.CommentResponse>, newOrderBy?: zOrderByType, newAscOrDesc?: zAscOrDescType }) {
		const { newComments = comments, newOrderBy = orderBy, newAscOrDesc = ascOrDesc } = newValues;
		function dateSorter(a: API.CommentResponse, b: API.CommentResponse) {
			if (newAscOrDesc === "asc") {
				return a.date.getTime() - b.date.getTime();
			}

			return b.date.getTime() - a.date.getTime();
		}

		function idSorter(a: API.CommentResponse, b: API.CommentResponse) {
			if (newAscOrDesc === "asc") {
				return a.id - b.id;
			}

			return b.id - a.id;
		}
		return newComments.toSorted(newOrderBy === "date" ? dateSorter : idSorter);
	}

	function handleOrderByChange(event: ChangeEvent<HTMLSelectElement>) {
		const newOrderBy = event.target.value as zOrderByType;
		setOrderBy(newOrderBy);
		setComments(comments => sortComments({ newComments: comments, newOrderBy }));
	}

	function handleAscOrDescChange(event: ChangeEvent<HTMLSelectElement>) {
		const newAscOrDesc = event.target.value as zAscOrDescType;
		setAscOrDesc(newAscOrDesc);
		setComments(comments => sortComments({ newComments: comments, newAscOrDesc }));
	}

	const canCreateNew = useMemo(() => !comments.find(x => x.id === -1), [comments]);

	return <div className="flex flex-col pt-4">
		<div className="flex flex-row justify-between mr-20 ml-20 pr-10 pl-10 pt-4 border-t-gray-100 border-t-2">
			<div className="flex items-center">
				<span className="mr-2 ml-2">Sort By:</span>
				<select className="mr-2 ml-2 border-gray-200 border-2 rounded-md" name="orderBy" id="comment-list-order-by" onChange={handleOrderByChange} defaultValue={orderBy}>
					<option value="date">Date</option>
					<option value="id">Id</option>
				</select>
				<select className="mr-2 ml-2 border-gray-200 border-2 rounded-md" name="ascOrDesc" id="comment-list-asc-desc" onChange={handleAscOrDescChange} defaultValue={ascOrDesc}>
					<option value="desc">Descending</option>
					<option value="asc">Ascending</option>
				</select>
			</div>
			<div className={"flex items-center" + (canCreateNew ? "" : " invisible")}>
				<button className="flex flex-row place-content-center text-sm align-text-middle mt-4 p-2 w-48 rounded-4xl border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700" onClick={handleCreateNew}>
					<img className="flex justify-center align-middle w-8 h-8" src={newMessageImg} alt="" />
					<span className="flex self-center pl-4">Add new comment</span>
				</button>
			</div>
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
