import Logo from "../assets/logo/logonobg.png";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "../index.css";

const Navbar = () => {
	const [pageState, setPageState] = useState("Sign In");
	const [darkMode, setdarkMode] = useState(false);
	const { pathname } = useLocation();
	// console.log(pathname)
	const pathRoute = (route) => {
		if (route === pathname) {
			// console.log(pathname);
			// console.log(route);
			return true;
		}
	};

	const navigate = useNavigate();
	const auth = getAuth();
	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				setPageState("Profile");
			} else {
				setPageState("Sign In");
			}
		});
	}, [auth]);
	return (
		<div
			className={`shadow-md sticky top-0 z-40 ${
				!darkMode ? "bg-navcolor" : "bg-[#0D1117]"
			} transition duration-500 ease-in-out`}
		>
			<header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
				<div>
					<img
						src={Logo}
						className="hidden sm:block cursor-pointc h-10"
						alt="Logo"
						onClick={() => navigate("/")}
					/>
				</div>

				<div>
					<ul className="flex space-x-10">
						<li
							className={`cursor-pointc py-3 text-lg font-semibold ${
								pathRoute("/") &&
								darkMode &&
								"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
							} ${
								!pathRoute("/") &&
								darkMode &&
								"hover:text-[#9c9c9c] text-[#18C7FA]"
							} ${
								pathRoute("/") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
							} ${
								!pathRoute("/") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#18C7FA]"
							} transition duration-500 ease-in-out`}
							onClick={() => navigate("/")}
						>
							Dashboard
						</li>
						{console.log(darkMode)}
						<li
							className={`cursor-pointc py-3 text-lg font-semibold ${
								pathRoute("/offers") &&
								darkMode &&
								"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
							} ${
								!pathRoute("/offers") &&
								darkMode &&
								"hover:text-[#9c9c9c] text-[#18C7FA]"
							} ${
								pathRoute("/offers") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
							} ${
								!pathRoute("/offers") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#18C7FA]"
							} transition duration-500 ease-in-out`}
							onClick={() => navigate("/offers")}
						>
							Offers
						</li>
						<li
							className={`cursor-pointc py-3 text-lg font-semibold ${
								pathRoute("/Map") &&
								darkMode &&
								"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
							} ${
								!pathRoute("/Map") &&
								darkMode &&
								"hover:text-[#9c9c9c] text-[#18C7FA]"
							} ${
								pathRoute("/Map") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
							} ${
								!pathRoute("/Map") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#18C7FA]"
							} transition duration-500 ease-in-out`}
							onClick={() => navigate("/Map")}
						>
							Map
						</li>
						<li
							className={`cursor-pointc py-3 text-lg font-semibold ${
								pathRoute("/Filters") &&
								darkMode &&
								"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
							} ${
								!pathRoute("/Filters") &&
								darkMode &&
								"hover:text-[#9c9c9c] text-[#18C7FA]"
							} ${
								pathRoute("/Filters") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
							} ${
								!pathRoute("/Filters") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#18C7FA]"
							} transition duration-500 ease-in-out`}
							onClick={() => navigate("/Filters")}
						>
							Filter Properties
						</li>
						<li
							className={`cursor-pointc py-3 text-lg font-semibold ${
								pathRoute("/lease-agreement") &&
								darkMode &&
								"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
							} ${
								!pathRoute("/lease-agreement") &&
								darkMode &&
								"hover:text-[#9c9c9c] text-[#18C7FA]"
							} ${
								pathRoute("/lease-agreement") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
							} ${
								!pathRoute("/lease-agreement") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#18C7FA]"
							} transition duration-500 ease-in-out`}
							onClick={() => navigate("/lease-agreement")}
						>
							Lease Agreement
						</li>
						<li
							className={`cursor-pointc py-3 text-lg font-semibold ${
								pathRoute("/lease-agreements") &&
								darkMode &&
								"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
							} ${
								!pathRoute("/lease-agreements") &&
								darkMode &&
								"hover:text-[#9c9c9c] text-[#18C7FA]"
							} ${
								pathRoute("/lease-agreements") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
							} ${
								!pathRoute("/lease-agreements") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#18C7FA]"
							} transition duration-500 ease-in-out`}
							onClick={() => navigate("/lease-agreements")}
						>
							My Lease Agreements
						</li>
						<li
							className={`cursor-pointc py-3 text-lg font-semibold ${
								pathRoute("/sign-in") &&
								darkMode &&
								"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
							} ${
								!pathRoute("/sign-in") &&
								darkMode &&
								"hover:text-[#9c9c9c] text-[#18C7FA]"
							} ${
								pathRoute("/sign-in") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
							} ${
								!pathRoute("/sign-in") &&
								!darkMode &&
								"hover:text-[#024d66] text-[#18C7FA]"
							} transition duration-500 ease-in-out`}
							onClick={() => navigate("/profile")}
						>
							{pageState}
						</li>
						{pageState !== "Profile" && (
							<li
								className={`cursor-pointc py-3 text-lg font-semibold ${
									pathRoute("/sign-up") &&
									darkMode &&
									"text-[#fff] border-[#fff] hover:text-[#9c9c9c] border-b-[3px] "
								} ${
									!pathRoute("/sign-up") &&
									darkMode &&
									"hover:text-[#9c9c9c] text-[#18C7FA]"
								} ${
									pathRoute("/sign-up") &&
									!darkMode &&
									"hover:text-[#024d66] text-[#024] border-[#024] border-b-[3px]"
								} ${
									!pathRoute("/sign-up") &&
									!darkMode &&
									"hover:text-[#024d66] text-[#18C7FA]"
								} transition duration-500 ease-in-out`}
								onClick={() => navigate("/sign-up")}
							>
								Sign Up
							</li>
						)}
					</ul>
				</div>
			</header>
			{/* {darkMode ? (
				<FiSun
					className=" text-[#e2e2e2] absolute right-6 top-3 p-1 text-3xl shadow-glowdm rounded cursor-pointc"
					onClick={() => setdarkMode((prevState) => !prevState)}
				/>
			) : (
				<FiMoon
					className=" text-[#000] absolute right-6 top-3 p-1 text-3xl shadow-glowlm rounded cursor-pointc"
					onClick={() => setdarkMode((prevState) => !prevState)}
				/>
			)} */}

			{/* Mobile View */}
		</div>
	);
};

export default Navbar;
