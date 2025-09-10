import React from 'react';
import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";

import "../../App.css";

const Layout_login_page: React.FC = () => {

    return(
        <>
            <div className="gap-4 p-4 flex flex-col min-h-screen">
                <div className={"p-4 "}>
                    <Header/>
                </div>
                <div className={"flex-1"}>
                    <Outlet/>
                </div>
            </div>
        </>
    );
}
export default Layout_login_page;