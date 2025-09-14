import React, {useEffect, useState} from 'react';

import "../../styles/home_page/layout.css"
const HomePage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(false); // створюємо state

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLogin(!!token); // оновлюємо state
    }, []);


    return (
        <div className="">

                {!isLogin ? (
                    <div className="search_container_home_page">
                        <div className="people_container">
                            <img className="image_container" src="src/images/search_bar/people.png" alt="people"/>
                        </div>
                        <div className="search_bar_home_page">
                            <div>
                                <img src="src/images/search_bar/search.png" className="search_logo_home_page"
                                     alt="search"/>
                            </div>
                            <div>
                                <input type="text" placeholder="Search for artists, bands, tracks or music"
                                       className="search_input_home_page baloo2"/>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="search_container_home_page">
                        <div className="search_bar_home_page">
                            <div>
                                <img src="src/images/search_bar/search.png" className="search_logo_home_page"
                                     alt="search"/>
                            </div>
                            <div>
                                <input type="text" placeholder="Search for artists, bands, tracks or music"
                                       className="search_input_home_page baloo2"/>
                            </div>

                        </div>
                    </div>
                )}


            <div>

            </div>

        </div>
    );
};

export default HomePage;