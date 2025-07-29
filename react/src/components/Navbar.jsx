import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import '../assets/styles/Navbar.css';
import '../assets/styles/CategoryNav.css';
import SearchOverlay from '../components/SearchOverlay';

import { border } from "@mui/system";

function Navbar(){

    const getStoredTheme = () => localStorage.getItem('theme')
    const setStoredTheme = theme => localStorage.setItem('theme', theme)

    const handleLogout = async() => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('uid')
        setLoggedIn(false)
        setUsername("")
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'));
        window.location.href = "/";
    }

    useEffect(() => {
        let username = localStorage.getItem('username');
        let uid = localStorage.getItem('uid');
        let token = localStorage.getItem('token');
        if(username && uid && token){
            setUsername(username)
            setLoggedIn(true)
        }
    }, []);

    // Listen for storage changes to update login state
    useEffect(() => {
        const handleStorageChange = () => {
            let username = localStorage.getItem('username');
            let uid = localStorage.getItem('uid');
            let token = localStorage.getItem('token');
            if(username && uid && token){
                setUsername(username)
                setLoggedIn(true)
            } else {
                setLoggedIn(false)
                setUsername("")
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also check on component mount and when localStorage changes
        const interval = setInterval(handleStorageChange, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []); 

    useEffect(() => {
        if (getStoredTheme() === 'dark'){
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            document.getElementById("theme_toggler").checked = false;
        }else{
            document.documentElement.setAttribute('data-bs-theme', 'light');
            document.getElementById("theme_toggler").checked = true;
        }
    }, []); 

    const changeTheme = () => {
        if(getStoredTheme() === 'dark'){
            setStoredTheme('light')
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }else {
            setStoredTheme('dark')
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }
    }

    const [categoriesVisible, setCategoriesVisible] = useState(false)
    const [contactVisible, setContactVisible] = useState(false)

    const showHideCategories = () => {
        if(categoriesVisible){
            setCategoriesVisible(false)
        }else{
            setCategoriesVisible(true)
            setContactVisible(false) // Close contact when opening categories
        }
    }

    const showHideContact = () => {
        if(contactVisible){
            setContactVisible(false)
        }else{
            setContactVisible(true)
            setCategoriesVisible(false) // Close categories when opening contact
        }
    }

    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("eieronymakis");


    return (
        <div className="w-100 sticky-top">
            <nav className="navbar navbar-expand-lg border-bottom border-secondary sticky-top bg-body">
                <div className="container-fluid">
                    <Link tabIndex={-1} to="/" className="navbar-logo">
                        <span>Lamprinakis</span><span style={{color: '#2A7423 '}}>Eshop</span>.
                    </Link>
                </div>

                <div className="nav-middle ms-auto me-auto d-flex h-100 justify-content-center align-items-center">
                    <Link to="/" className="nav-link me-5 d-flex align-items-center justify-content-center">
                        <span className="d-flex align-items-center tag">ΑΡΧΙΚΗ</span>
                    </Link>
                    {categoriesVisible &&
                        <button type="button" onClick={showHideCategories} className="categories-visible nav-link btn me-5 dropdown-toggle d-flex justify-content-center align-items-center">
                            <span className="d-flex align-items-center tag">ΠΡΟΪΟΝΤΑ</span>
                        </button>
                    }
                    {!categoriesVisible &&
                        <button type="button" onClick={showHideCategories} className="nav-link btn me-5 dropdown-toggle d-flex justify-content-center align-items-center">
                            <span className="d-flex align-items-center tag">ΠΡΟΪΟΝΤΑ</span>
                        </button>
                    }

                    {contactVisible &&
                        <button type="button" onClick={showHideContact} className="contact-visible nav-link btn dropdown-toggle d-flex justify-content-center align-items-center">
                            <span className="d-flex align-items-center tag">ΕΠΙΚΟΙΝΩΝΙΑ</span>
                        </button>
                    }
                    {!contactVisible &&
                        <button type="button" onClick={showHideContact} className="nav-link btn dropdown-toggle d-flex justify-content-center align-items-center">
                            <span className="d-flex align-items-center tag">ΕΠΙΚΟΙΝΩΝΙΑ</span>
                        </button>
                    }
                </div>
                <div className="me-2">
                    <SearchOverlay></SearchOverlay>
                </div>
                {!loggedIn &&
                    <div className="d-flex">
                        <Link to="/login" className="text-light btn btn-success shadow-none me-2 d-flex navbar-btn-login d-flex align-items-center justify-content-center ">
                            <span className="d-flex align-items-center tag">Σύνδεση / Εγγραφή</span>
                            <i className="ms-2 fs-3 bi bi-person-circle"></i>
                        </Link>
                    </div>
                }

                {loggedIn && 
                    <div className="dropdown">
                        <button type="button" className="text-light logged-in btn bg-primary me-2 navbar-btn-login d-flex align-items-center justify-content-center" data-bs-toggle="dropdown" aria-expanded="false">
                            <span className="d-flex align-items-center">{username}</span>
                            <i className="ms-2 fs-3 bi bi-person-circle"></i>
                        </button>
                        <ul className="dropdown-menu mt-2 border border-2 border-dark">
                            <Link to="/profile" className="profile-dropdown-item d-flex align-items-center justify-content-start">
                                <i className="text-dark fs-3 bi bi-person-fill-gear me-3 ms-3"></i>
                                <div className="text-dark fs-5 fw-normal">Λογαριασμός</div>
                            </Link>
                            <li><hr className="dropdown-divider"/></li>
                            <Link to="/order-history" className="profile-dropdown-item dropdown-orders d-flex align-items-center justify-content-start">
                                <i className="text-dark fs-3 bi bi-cash-coin me-3 ms-3"></i>
                                <div className="text-dark fs-5 fw-normal">Αγορές</div>
                            </Link>
                            <li><hr className="dropdown-divider"/></li>
                            <Link to="/contact" className="profile-dropdown-item dropdown-logout d-flex align-items-center justify-content-start">
                                <i className="text-dark fs-3 bi bi-patch-question me-3 ms-3"></i>
                                <div className="text-dark fs-5 fw-normal">Επικοινωνία</div>
                            </Link>
                            <li><hr className="dropdown-divider"/></li>
                            <button className="border-0 p-0 bg-transparent profile-dropdown-item dropdown-logout d-flex align-items-center justify-content-start" onClick={handleLogout}>
                                <i className="text-dark fs-3 bi bi-door-open-fill me-3 ms-3"></i>
                                <div className="text-dark fs-5 fw-normal">Αποσύνδεση</div>
                            </button>
                        </ul>
                    </div>
                }


                <Link to="/cart" className="text-light btn btn-warning shadow-none me-2 d-flex navbar-btn-cart d-flex align-items-center justify-content-center">
                    <span className="d-flex align-items-center justify-content-center tag">Καλάθι</span>
                    <i className="ms-2 fs-3 bi bi-cart"></i>
                    <span className="button__badge bg-danger">9</span>
                </Link>
                   

                <div className="switch_box box_3 me-2">
                    <div className="toggle_switch">
                        <input id="theme_toggler" type="checkbox" onChange={changeTheme} className="switch_3"/>
                        <svg className="checkbox" xmlns="http://www.w3.org/2000/svg" style={{isolation: "isolate"}} viewBox="0 0 168 80">
                        <path className="outer-ring" d="M41.534 9h88.932c17.51 0 31.724 13.658 31.724 30.482 0 16.823-14.215 30.48-31.724 30.48H41.534c-17.51 0-31.724-13.657-31.724-30.48C9.81 22.658 24.025 9 41.534 9z" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="square" strokeMiterlimit="3"/>
                        <path className="is_checked" d="M17 39.482c0-12.694 10.306-23 23-23s23 10.306 23 23-10.306 23-23 23-23-10.306-23-23z"/>
                        <path className="is_unchecked" d="M132.77 22.348c7.705 10.695 5.286 25.617-5.417 33.327-2.567 1.85-5.38 3.116-8.288 3.812 7.977 5.03 18.54 5.024 26.668-.83 10.695-7.706 13.122-22.634 5.418-33.33-5.855-8.127-15.88-11.474-25.04-9.23 2.538 1.582 4.806 3.676 6.66 6.25z"/>
                        </svg>
                    </div>
                </div>

            </nav>

            {categoriesVisible &&
                <div className="w-100 category-nav">
                    <div className="menu d-flex flex-row justify-content-center align-items-center border-bottom border-secondary bg-body">
                        <Link className="menu-item bg-transparent btn p-0" to="/categories/desktops">
                            <i className="bi bi-pc-display"></i>
                            <span className="ms-2">Desktops</span>
                        </Link>
                        <Link className="ms-5 menu-item bg-transparent btn p-0" to="/categories/laptops">
                            <i className="bi bi-laptop"></i>
                            <span className="ms-2">Laptops</span>
                        </Link>
                        <Link className="ms-5 menu-item bg-transparent btn p-0" to="/categories/tablets">
                            <i className="bi bi-tablet-landscape"></i>
                            <span className="ms-2">Tablets</span>
                        </Link>
                        <Link className="ms-5 menu-item bg-transparent btn p-0" to="/categories/hardware">
                            <i className="bi bi-cpu"></i>
                            <span className="ms-2">Hardware</span>
                        </Link>
                        <Link className="ms-5 menu-item bg-transparent btn p-0" to="/categories/peripherals">
                            <i className="bi bi-keyboard"></i>
                            <span className="ms-2">Περιφερειακά</span>
                        </Link>
                        <Link className="ms-5 menu-item bg-transparent btn p-0" to="/categories/networking">
                            <i className="bi bi-router"></i>
                            <span className="ms-2">Δικτυακά</span>
                        </Link>
                        <Link className="ms-5 menu-item bg-transparent btn p-0" to="/categories/monitors">
                            <i className="bi bi-plus-circle"></i>
                            <span className="ms-2">Περισσότερα</span>
                        </Link>
                    </div>
                </div>   
            }

            {contactVisible &&
                <div className="w-100 contact-nav">
                    <div className="contact-info d-flex flex-row justify-content-center align-items-start border-bottom border-secondary bg-body p-4">
                        <div className="contact-section me-5">
                            <h6 className="text-success fw-bold mb-3">📍 ΔΙΕΥΘΥΝΣΗ</h6>
                            <p className="mb-2">Καραϊσκάκη 82</p>
                            <p className="mb-0">Χανιά 73100</p>
                        </div>
                        <div className="contact-section me-5">
                            <h6 className="text-success fw-bold mb-3">📞 ΕΠΙΚΟΙΝΩΝΙΑ</h6>
                            <p className="mb-2">
                                <i className="bi bi-telephone me-2"></i>
                                <a href="tel:+306948042634" className="text-decoration-none">+30 694 804 2634</a>
                            </p>
                            <p className="mb-0">
                                <i className="bi bi-envelope me-2"></i>
                                <a href="mailto:info@lamprinakis-eshop.gr" className="text-decoration-none">info@lamprinakis-eshop.gr</a>
                            </p>
                        </div>
                        <div className="contact-section me-5">
                            <h6 className="text-success fw-bold mb-3">🕒 ΩΡΑΡΙΟ</h6>
                            <p className="mb-1 small">Δευ-Τετ-Παρ: 10:00-16:00</p>
                            <p className="mb-1 small">Τρι-Πεμ-Παρ: 10:00-20:00</p>
                            <p className="mb-0 small">Σάββατο: 10:00-15:00</p>
                        </div>
                        <div className="contact-section">
                            <h6 className="text-success fw-bold mb-3">🔗 SOCIAL</h6>
                            <div className="d-flex">
                                <a href="https://www.linkedin.com/in/georgios-lamprinakis/" target="_blank" rel="noopener noreferrer" className="me-3 text-decoration-none">
                                    <i className="bi bi-linkedin fs-4 text-primary"></i>
                                </a>
                                <a href="https://github.com/glamprinakis" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                    <i className="bi bi-github fs-4 text-dark"></i>
                                </a>
                            </div>
                            <Link to="/contact" className="btn btn-sm btn-outline-success mt-2" onClick={() => setContactVisible(false)}>
                                Αναλυτικά Στοιχεία
                            </Link>
                        </div>
                    </div>
                </div>   
            }
        </div>
    )
}

export default Navbar;