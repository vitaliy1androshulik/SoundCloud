import React from 'react';

const Footer: React.FC = () => {
    return (
        <>
            <footer className="absolute w-full text-white ">
                <img src="src/images/footer/vector_behind.png"
                     alt={"behind"} className={" left-0 w-full z-0"}/>
                <img src="src/images/footer/vector_ahead.png"
                     alt={"ahead"} className={"left-0 w-full z-10"}/>
                {/* Контент зверху */}
                <div className="relative z-20 flex justify-between items-center px-8 py-6">
                    <div className="flex space-x-4 text-sm">
                        <a href="#">Directory</a>
                        <a href="#">About us</a>
                        <a href="#">Artist Resources</a>
                        <a href="#">Blog</a>
                        <a href="#">Help</a>
                        <a href="#">Privacy</a>
                    </div>
                    <div className="text-sm">
                        Language: <span className="font-semibold">English</span> ⌄
                    </div>
                </div>
            </footer>
        </>
    );
};
export default Footer;