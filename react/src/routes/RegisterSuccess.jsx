import React from "react";
import { Link } from "react-router-dom";

import BreadCrumb from '../components/BreadCrumb';

import '../assets/styles/Login.css';
import image from '../assets/images/image 5.png'

function RegisterSuccess(){

    return(
        <div className="login">
            <BreadCrumb                 
                items={[{"path":"/register","label":"Εγγραφή"}, {"path":"/register-success", label:"Επιτυχία"}]}>
            </BreadCrumb>
            <div className="ms-auto me-auto mt-3 login-container d-flex">
                <div className="left">
                        <img className="image-hover" alt="" src={image}></img>
                        <div className="create-account-container">
                            <div className="text-light w-100 text-center fw-bold new-customer">
                                🥳 Επιτυχής Εγγραφή
                            </div>
                            <div className="mt-3 text-warning w-50 text-center fw-bold fs-5 ms-auto me-auto">
                                Ευχαριστούμε για την εγγραφή σας στο Lamprinakis-Eshop
                            </div>
                        </div>
                </div>
                <div className="right d-flex align-items-center justify-content-center">
                    <Link to="/login" className="register-success-login btn btn-lg fs-1 border border-5 border-light">
                        <i className="bi bi-person-arms-up me-3"></i>
                        Σύνδεση
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterSuccess;