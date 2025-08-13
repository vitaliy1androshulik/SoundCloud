import React from 'react';
import { Link } from 'react-router-dom';
const Header: React.FC = () => {
    return (
        <>
            <div className="flex justify-center">
                <nav className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <ul className="hidden md:flex space-x-6 text-gray-300">
                            <li>
                                <Link to="/home" className="navigation-text-color px-1 py-1 rounded text-gray font-semibold">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="navigation-text-color px-1 py-1 rounded text-gray font-semibold">
                                    Feed
                                </Link>
                            </li>
                            <li>
                                <Link to="/library" className="navigation-text-color px-1 py-1 rounded text-gray font-semibold">
                                    Library
                                </Link>
                            </li>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className=" w-[350px] bg-[#303030] placeholder-gray-500 text-gray-100 rounded-sm mx-1 px-3 py-1 focus:outline-none focus:ring-1 focus:ring-white-150"
                                />
                            </div>
                            <li>
                                <Link to="#"
                                   className="header-text-color-orange px-1 py-1 rounded text-gray font-semibold">
                                    Try Artist Pro
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="navigation-text-color px-1 py-1 rounded text-gray font-semibold">
                                    For Artists
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="navigation-text-color px-1 py-1 rounded text-gray font-semibold">
                                    Upload
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center space-x-4">


                        {/* Аватар */}
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="User Avatar"
                            className="mx-5 w-8 h-8 rounded-full"
                        />

                        <button
                            aria-label="Notifications"
                            className="text-gray-400 hover:text-white focus:outline-none"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>
                    </div>
                </nav>


            </div>
        </>
    );
};

export default Header;
