import React from 'react';

const Footer: React.FC = () => {
    return (
        <>
            <footer className="flex w-auto h-[306px] text-white baloo2">
                <img src="src/images/footer/vector_behind.png"
                     alt={"behind"} className={"absolute left-0 w-full z-1 left-0 right-0 bottom-0"}/>
                <img src="src/images/footer/vector_ahead.png"
                     alt={"ahead"} className={"absolute left-0 w-full z-2 left-0 right-0 bottom-0"}/>
                {/* Контент зверху */}
                <div className="lg:w-[1920px] z-3 flex justify-between mt-[238px] ml-[50px]
                text-black text-[24px]">
                    <div className="flex space-x-4 lg:w-[639px] lg:h-[24px] justify-between">
                        <a href="#">Directory</a>
                        <a href="#">About us&#183;</a>
                        <a href="#">Artist Resources</a>
                        <a href="#">Blog</a>
                        <a href="#">Help</a>
                        <a href="#">Privacy</a>
                    </div>
                    <div className="mr-[20px] lg:w-[241px] lg:h-[24px]">
                        Language: English⌄
                    </div>
                </div>
            </footer>
        </>
    );
};
export default Footer;