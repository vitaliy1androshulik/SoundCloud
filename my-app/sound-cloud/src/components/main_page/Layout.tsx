import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import Player from "../player/Player.tsx";
import "../../styles/General.css";

const Layout: React.FC = () => {

    return(
        <>
            <div className="page-container">
                <div>
                    <Header/>
                </div>

                <div>
                    <Outlet/>

                    <Player footerSelector=".footer_container" />

                </div>
                <div className="footer_container">
                    <Footer/>
                </div>
            </div>
        </>
    );
}
export default Layout;