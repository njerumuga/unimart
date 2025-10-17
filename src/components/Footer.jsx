import React from "react";
import "../styles/Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} UniMart | Built by Kevin Njeru</p>
        </footer>
    );
}

export default Footer;
