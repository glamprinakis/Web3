import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from '../api';

import BreadCrumb from '../components/BreadCrumb';

import '../assets/styles/Login.css';
import image from '../assets/images/image 5.png'
import {jwtDecode} from "jwt-decode";

function Login(){
    const [usr, setUsr] = useState('');
    const [pwd, setPwd] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/user/login', { usr, pwd });
            // Store the token
            localStorage.setItem('token', data.token);
            
            // Decode the JWT token to get user information
            const decoded = jwtDecode(data.token);
            localStorage.setItem('uid', decoded.userId);
            localStorage.setItem('username', decoded.userName);
            
            // Redirect to profile page
            navigate('/profile');
        } catch (e) {
            alert('Wrong username or password');
        }
    };



    return(
        <div className="login">
            <BreadCrumb                 
                items={[{"path":"/login","label":"Σύνδεση"}]}>
            </BreadCrumb>
            <div className="ms-auto me-auto mt-3 login-container d-flex">
                <div className="left">
                        <img className="image-hover" alt="" src={image}></img>
                        <div className="create-account-container">
                            <div className="text-light w-100 text-center fw-bold new-customer">
                                Νέος Χρήστης ;
                            </div>
                            <div className="mt-3 text-warning w-50 text-center fw-bold fs-5 ms-auto me-auto">
                                Πατήστε παρακάτω για να φτιάξετε νέο λογαριασμό
                            </div>
                            <div className="mt-5 text-light text-center fw-bold fs-5 ms-auto me-auto w-100 d-flex align-items-center justify-content-center">
                                <Link className="register-btn" to="/register">
                                    Δημιουργία λογαριασμού
                                </Link>
                            </div>
                        </div>
                        <div className="back text-light w-50 text-center fw-bold fs-5 ms-5">
                            <Link to="/" className="back-btn d-flex align-items-center">
                                <i className="bi bi-arrow-left-square-fill"></i>
                                <span className="ms-3">Πίσω</span>
                            </Link>
                        </div>

                </div>
                <div className="right d-flex align-items-center justify-content-center">
                    <form onSubmit={onSubmit} className="login-form bg-body">
                        <div className="mt-5 w-100 text-center fw-bold fs-3">
                            Έχετε ήδη λογαριασμό ;
                        </div>
                        <div className="w-100 d-flex justify-content-center mt-4">
                            <input value={usr} onChange={e => setUsr(e.target.value)} placeholder="Username" />
                        </div>
                        <div className="w-100 d-flex justify-content-center mt-3">
                            <input value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Password" type="password" />
                        </div>
                        <div className="w-100 d-flex justify-content-center mt-4">
                            <button type="submit" className="fw-bold login-btn btn btn-success">Είσοδος</button>
                        </div>
                        <div className="mt-4 w-100 text-center">
                            <Link to="/forgot-account" className="fst-italic fs-5 fw-bold forgot-account">
                                Ξεχάσατε τα στοιχεία εισόδου ;
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;