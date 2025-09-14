import React from 'react';
import "../styles/footer.css"

const Footer: React.FC = () => {
    return (
        <>
            <footer className="relative w-full text-white font-baloo2 bg-color-black overflow-hidden">
                {/* Контейнер для картинок */}
                <div className="relative w-full h-[306px]">
                    {/* Задній шар */}
                    <img
                        src="src/images/footer/vector_behind.png"
                        alt="behind"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    {/* Передній шар */}
                    <img
                        src="src/images/footer/vector_ahead.png"
                        alt="ahead"
                        className="absolute inset-0 w-full h-full object-cover z-10"
                    />

                    {/* Текстовий контент */}
                    <div
                        className={"relative left-0 w-full px-12 flex justify-between text-[24px] z-20"}>

                        <div className="footer_text_first">
                            <a href="#">Directory</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">About us</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Artist Resources</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Blog</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Help</a>
                            <label>&#160;&#x2022;&#160;</label>
                            <a href="#">Privacy</a>
                        </div>
                        <div className="footer_text_second ">Language:&#160;&#160;&#160; English<img src="src/images/icons/arrow_down.png"/></div>
                    </div>
                </div>
            </footer>

        </>
    );
};
export default Footer;