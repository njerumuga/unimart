import React from "react";

function Footer() {
    return (
        <footer className="mt-16 border-t border-yellow-200 bg-soko-dark text-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                    <h3 className="text-lg font-bold text-soko-yellow">SokoHub</h3>
                    <p className="text-sm text-gray-300">
                        The campus marketplace for students, hustlers, and creatives.
                    </p>
                </div>

                <p className="text-sm text-gray-300">
                    © {new Date().getFullYear()} SokoHub | Built by Kevin Njeru
                </p>
            </div>
        </footer>
    );
}

export default Footer;