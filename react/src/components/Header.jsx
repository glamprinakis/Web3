import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import '../assets/styles/Footer.css';

function Header(){
    const [isContactToggle, setIsContactToggle] = useState(true);
    const navigate = useNavigate();

    const handleHelpClick = (e) => {
        e.preventDefault();
        
        if (isContactToggle) {
            // First click - go to contact page
            navigate('/contact');
        } else {
            // Second click - go back to home page smoothly
            navigate('/');
        }
        
        // Toggle the state for next click
        setIsContactToggle(!isContactToggle);
    };

    return(
        <div className="header">
            <div className="w-100 bg-success d-flex flex-row text-light justify-content-end" style={{height: "2.5rem"}}>
                <div className="fs-5 h-100 d-flex align-items-center justify-content-center me-5 fw-bold">
                    <i className="bi bi-telephone-fill me-2"></i>+30 694 804 2634
                </div>
                <div className="fs-5 h-100 d-flex align-items-center justify-content-center me-5 fw-bold">
                    <a href="#" onClick={handleHelpClick} style={{color: 'inherit', textDecoration: 'none'}}>
                        <i className="bi bi-patch-question-fill me-2"></i> Βοήθεια
                    </a>
                </div>
            </div>
		</div>
    )
}

export default Header;