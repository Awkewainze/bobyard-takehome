import { NavLink, Outlet } from "react-router";

export function Layout() {
	return (
		<>
			{/* <header>
				<nav>
					<NavLink to="/" end>
						Home
					</NavLink>
				</nav>
			</header> */}
			<main >
				<span className="flex p-4">
					<Outlet />
				</span>
			</main>
		</>
	);
}
