import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import Player from "../player/Player.tsx";


const Layout: React.FC = () => {

    return(
        <>
            <div className="page-container relative min-h-screen flex flex-col">
                <div className="header">
                    <Header/>
                </div>

                <main className="content ">
                    <Outlet/>

                    <Player footerSelector=".footer_container" />
                </main>
                <div className="footer_container">
                    <Footer/>
                </div>
            </div>
        </>
    );
}
export default Layout;