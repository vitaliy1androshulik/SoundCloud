import React from 'react';

const HomePage: React.FC = () => {

    return (
        <div className="hidden lg:block mx-auto max-w-screen-full-xl">
            <div className="mx-auto lg:max-w-[904px] xl:max-w-[1382px]
                                full-xl:max-w-screen-center-xl">
                <div className="flex justify-between items-center">
                    <div className="flex w-[1382px] h-[56px] justify-between">

                        <div className="flex w-[56px] h-[56px] items-center justify-center
                         bg-lightpurple rounded-[50px]">
                            <img src="src/images/home_page/search_bar/people.png" width="37"/>
                        </div>

                        <div className="flex w-[1302px] h-[56px] items-center justify-start
                         border-[2px] border-darkpurple rounded-[50px]">
                            <img className="ml-[12px] mr-[10px]" src="src/images/home_page/search_bar/search.png" width="37"/>

                            <div className="">
                                <p className="baloo2 font-bold text-lightpurple">Search for artist, bands, tracks or music</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>

    );

};
export default HomePage;