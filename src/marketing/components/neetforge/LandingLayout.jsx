import React from "react";
import NeetNavbar from "./NeetNavbar";
import NeetFooter from "./NeetFooter";

export default function LandingLayout({ children }) {
    return (
        <div className="min-h-screen bg-white font-inter">
            <NeetNavbar />
            {children}
            <NeetFooter />
        </div>
    );
}