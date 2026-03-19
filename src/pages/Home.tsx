import { Loading } from "@/components";
import { useNavigate } from "react-router";
import loremIpsum from "@/assets/lorem-ipsum.txt";
import { CommentList } from "@/components/CommentList";

export function Home() {
	const loading = false;
	const navigate = useNavigate();

	return (
		<Loading loading={loading}>
			<div className="flex flex-col">
				<div className="flex p-10 m-10">
					<p className="whitespace-pre-line">
						{loremIpsum}
					</p>
				</div>
				<div className="flex">
					{<CommentList />}
				</div>
			</div>
		</Loading>)
}
