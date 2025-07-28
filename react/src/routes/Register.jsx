import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from '../api';
import BreadCrumb from '../components/BreadCrumb';

import '../assets/styles/Register.css';
import image from '../assets/images/image 5.png'

function Register(){
    const [form, setForm] = useState({
        name: '', surname: '', username: '', pwd: '',
        email: '', city: '', addr: ''
    });
    const [password2, setPassword2] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleChangePassword = (e) => {
        setPasswordError(false);
        setForm({ ...form, pwd: e.target.value });
    };

    const handleChangePassword2 = (e) => {
        setPasswordError(false);
        setPassword2(e.target.value);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (form.pwd !== password2) {
            setPasswordError(true);
            return;
        }
        try {
            await api.post('/user/signup', form);
            alert('User created! You can log in now.');
        } catch (e) {
            alert('Failed to sign up (maybe username/email already exists)');
        }
    };

    return(
        <div className="register">
            <BreadCrumb                 
                items={[{"path":"/register","label":"Εγγραφή"}]}>
            </BreadCrumb>
            <div className="ms-auto me-auto mt-3 register-container d-flex">
                <div className="left">
                    <img className="image-hover" alt="" src={image}></img>
                    <div className="create-account-container">
                            <div className="mt-3 text-warning w-50 text-center fw-bold fs-1 ms-auto me-auto">
                                Παρακαλούμε συμπληρώστε τα στοιχεία σας
                            </div>
                        </div>
                    <div className="back text-light w-50 text-center fw-bold fs-5 ms-5">
                            <Link to="/login" className="back-btn d-flex align-items-center">
                                <i className="bi bi-arrow-left-square-fill"></i>
                                <span className="ms-3">Πίσω</span>
                            </Link>
                    </div>
                </div>
                <div className="right d-flex align-items-center justify-content-center">
                    <form onSubmit={onSubmit} className="register-form bg-body">
                        <div className="mt-5 w-100 d-flex justify-content-center align-items-center mt-4 flex-column">
                            <div className="d-flex register-name-surname w-100">
                                <input name="name" value={form.name} onChange={onChange} type="text" placeholder="Όνομα"></input>
                                <input name="surname" value={form.surname} onChange={onChange} type="text" placeholder="Επώνυμο"></input>
                            </div>
                            <input name="username" value={form.username} onChange={onChange} type="text" placeholder="Username"></input>
                            <input name="email" value={form.email} onChange={onChange} type="email" placeholder="Email"></input>
                            <input 
                                value={form.pwd} 
                                onChange={handleChangePassword} 
                                type="password" 
                                placeholder="Κωδικός Πρόσβασης"
                                className={passwordError ? "border border-3 border-danger" : ""}
                            ></input>
                            <input 
                                value={password2} 
                                onChange={handleChangePassword2} 
                                type="password" 
                                placeholder="Επαλήθευση Κωδικού Πρόσβασης"
                                className={passwordError ? "border border-3 border-danger" : ""}
                            ></input>
                            <span className={passwordError ? "text-danger fw-bold" : "d-none"}>Οι κωδικοί δεν ταιριάζουν</span>
                        </div>
                        <div className="w-100 d-flex justify-content-center mt-2">  
                            <button type="submit" className="fw-bold register-btn btn btn-success">Εγγραφή</button>
                        </div>
                        <div className="mt-4 w-100 text-center">
                            <Link to="/login" className="fst-italic fw-bold forgot-account">
                                Έχετε ήδη λογαριασμό;
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register;