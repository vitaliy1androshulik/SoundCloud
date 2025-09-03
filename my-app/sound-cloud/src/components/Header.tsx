import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import '../styles/General.css';


const Header: React.FC = () => {
    const [active, setActive] = useState<string>("home");
    return (
        <>
            <div className="hidden lg:block mx-auto max-w-screen-full-xl">
                <header className="mx-auto lg:max-w-[904px] xl:max-w-[1568px]
                full-xl:max-w-screen-center-xl">
                    <div className="flex justify-between items-center full-xl:px-[60px] xl:px-[50px]">
                        <div className="flex tems-center lg:w-[167px] lg:h-[45px]
                        xl:w-[398px] xl:h-[56px]">
                            <div className="w-[56px] h-[56px] xl:mr-[12px] lg:mr-[12px]">
                                <img src="src/images/logo/logo_WaveCloud.png" alt="logo"/>
                            </div>
                            <div className="lg:w-[167px] lg:h-[45px] xl:w-[197px] xl:h-[56px]">
                                <p className="baloo2 text-lightpurple font-bold lg:text-[13px]
                                 xl:text-[36px]">WaveCloud</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-[290px] h-[56px]
                        baloo2 text-white px-1 py-1
                        xl:text-[26px] font-medium">
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


                        <div className="flex w-[348px] h-[56px] items-center justify-between">
                            <button className="baloo2 w-[124px] h-[56px]
                        bg-lightpurple rounded-[50px] text-[20px] font-bold">Sign in
                            </button>
                            <button className="baloo2 w-[200px] h-[56px] text-white text-[20px]
                         bg-purple rounded-[50px] font-bold">Create account
                            </button>
                        </div>
                    </div>
                </header>
            </div>
        </>
    );
};
export default Header;
