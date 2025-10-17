import React from "react";
import "../styles/Advertise.css";

export default function Advertise() {
    return (
        <div className="advertise-page">
            <h1>📢 Advertise With Us</h1>
            <p className="intro">
                Want your product or business to reach more buyers?
                Feature your listing or run a paid ad on our platform.
            </p>

            <div className="contact-box">
                <h3>💬 Contact Us</h3>
                <p>Reach out for ad rates, promotions, and featured listings.</p>

                <div className="contact-details">
                    <p>
                        📞 <strong>WhatsApp:</strong>{" "}
                        <a
                            href="https://wa.me/254794300160?text=Hi, I'm interested in advertising with you."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            +254 794300160
                        </a>
                    </p>

                    <p>
                        ✉️ <strong>Email:</strong>{" "}
                        <a href="mailto:knjeru13@gmail.com">knjeru13@gmail.com</a>
                    </p>
                </div>
            </div>

            <div className="ad-info">
                <h3>💡 Why Advertise With Us?</h3>
                <ul>
                    <li>Reach thousands of active users daily</li>
                    <li>Promote your business, products, or services</li>
                    <li>Feature listings for higher visibility</li>
                    <li>Flexible and affordable ad packages</li>
                </ul>
            </div>
        </div>
    );
}
