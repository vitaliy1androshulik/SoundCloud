import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
//
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/userSlice.ts";
import '../../styles/main_pages/header.css';
import {IUser} from "../../types/user.ts";
import {getCurrentUser} from "../../services/User/UserProfile.tsx";
const Header: React.FC = () => {
    const [active, setActive] = useState<string>("home");
    const [user, setUser] = useState<IUser | null>(null);
    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .catch((err) => console.error(err));
    }, []);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(false); // створюємо state
    const getUserImageUrl = (user?: IUser | null) => {
        if (!user || !user.avatar) return "/default-cover.png";
        return `http://localhost:5122${user.avatar}`;
    };
    console.log("Avatar "+ user?.avatar);
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLogin(!!token);
    }, []);
    const Logout = ()=>
    {
        dispatch(logout());
        logout();
        alert("Ви вийшли з аккаунту!");
        navigate("/");
    }
    console.log("header user", user);
    console.log("Token service", localStorage.getItem("token"));
    return (
        <>
            <div className="max-w-screen-full-xl">
                <header className="header_container_main">

                        <div className="header_logo">
                            <div className="w-[56px] h-[56px] xl:mr-[12px] lg:mr-[12px]">
                                <img src="src/images/logo/logo_WaveCloud.png" alt="logo"/>
                            </div>
                            <div className="lg:w-[167px] lg:h-[45px] xl:w-[197px] xl:h-[56px]">
                                <p className="baloo2 text-lightpurple font-bold lg:text-[13px]
                                 xl:text-[36px]">WaveCloud</p>
                            </div>
                        </div>

                        <div className="baloo2 header_buttons_main">
                            <Link to="/home"
                                  onClick={() => setActive("home")}
                                  className={`px-1 py-1 xl:text-[26px] font-medium 
                                  ${active === "home"
                                      ? "text-purple border-b-2 border-white" : "text-white"}`}>
                                Home
                            </Link>
                            <Link to="/feed" onClick={() => setActive("feed")}
                                  className={`px-1 py-1 xl:text-[26px] font-medium 
                                  ${active === "feed"
                                      ? "text-purple border-b-2 border-white" : "text-white"}`}>
                                Feed
                            </Link>
                            <Link to="/library" onClick={() => setActive("library")}
                                  className={`px-1 py-1 xl:text-[26px] font-medium 
                                  ${active === "library"
                                      ? "text-purple border-b-2 border-white" : "text-white"}`}>
                                Library
                            </Link>
                        </div>
                        <div className="header_profile_container_main">
                            {isLogin ? (
                                <div>
                                    <div className="baloo2 header_profile_image_container">
                                        <div className="user_avatar">
                                            {user?.avatar ? (

                                                <img className="image_container_user" src={getUserImageUrl(user)}
                                                     alt="people" width="32" height="32"/>
                                            ) : (
                                                <img className="image_container_user"
                                                     src="src/images/search_bar/people.png"
                                                     alt="people" width="22" height="22"/>
                                            )}
                                        </div>
                                        <button onClick={() => Logout()}></button>
                                    </div>
                                    <div className="search_container_home_page">
                                        <div className="search_bar_home_page">
                                            <div>
                                                <img src="src/images/search_bar/search.png"
                                                     className="search_logo_home_page"
                                                     alt="search"/>
                                            </div>
                                            <div>
                                                <input type="text"
                                                       placeholder="Search for artists, bands, tracks or music"
                                                       className="search_input_home_page baloo2"/>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            ) : (
                                <div>
                                    <div className="baloo2 header_profile_container_main">
                                        <button className="baloo2 w-[124px] h-[56px]
                        bg-lightpurple rounded-[50px] text-[20px] font-bold button_hover_signup text-black"
                                                onClick={() => navigate("/")}
                                        >Sign in
                                        </button>
                                        <button className="baloo2 w-[200px] h-[56px] text-white text-[20px]
                         bg-purple rounded-[50px] font-bold button_hover_create_account"
                                                onClick={() => navigate("/")}
                                        >Create account
                                        </button>
                                    </div>
                                    <div className="search_container_home_page">
                                        <div className="people_container">
                                            <img className="image_container" src="src/images/search_bar/people.png"
                                                 alt="people"/>
                                        </div>
                                        <div className="search_bar_home_page">
                                            <div>
                                                <img src="src/images/search_bar/search.png"
                                                     className="search_logo_home_page"
                                                     alt="search"/>
                                            </div>
                                            <div>
                                                <input type="text"
                                                       placeholder="Search for artists, bands, tracks or music"
                                                       className="search_input_home_page baloo2"/>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            )}
                    </div>

                    <div>
                    </div>
                </header>
            </div>
        </>
    );
};
export default Header;
