import React, { useState } from "react";
import { api } from '../api';
import "../assets/styles/Contact.css"
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div>{text}</div>;

export default function Contact(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/contact', { name, email, message });
            alert('Το μήνυμά σας στάλθηκε επιτυχώς!');
            // Reset form
            setName('');
            setEmail('');
            setPhone('');
            setSubject('');
            setMessage('');
        } catch (error) {
            alert('Σφάλμα κατά την αποστολή του μηνύματος. Παρακαλώ δοκιμάστε ξανά.');
        }
    };

    const defaultProps = {
        center: {
            lat: 10.99835602,
            lng: 77.01502627
        },
        zoom: 11
    };

    return(
        <div className="contact-page w-100">
            <div className="ms-auto me-auto top-container d-flex flex-column justify-content-between">
                <div className="d-flex top ms-auto me-auto justify-content-between">
                    <div className="left d-flex flex-column">
                        <h4>ΣΤΟΙΧΕΙΑ ΕΠΙΚΟΙΝΩΝΙΑΣ</h4>
                        <span className="mt-3 d-flex">
                            <div className="fw-bold me-2">Διεύθυνση:</div> 
                            Μαργαροπούλου 20 Α, 54629 Θεσσαλονίκη
                        </span>
                        <span className="mt-3 d-flex">
                            <div className="fw-bold me-2">Email:</div> 
                            info@lamprinakis-eshop.gr
                        </span>
                        <span className="mt-3 d-flex">
                            <div className="fw-bold me-2">Τηλέφωνο:</div> 
                            6948042634
                        </span>
                        <span className="mt-3 d-flex">
                            <div className="fw-bold me-2">Fax:</div> 
                            2310-201633                    
                        </span>
                        <span className="mt-3 fw-bold"> 
                            Ωράριο Λειτουργίας: 
                        </span>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">Δευτέρα: 10:00 πμ - 16:00 μμ</li>
                            <li className="list-group-item">Τρίτη: 10:00 πμ - 20:00 μμ</li>
                            <li className="list-group-item">Τετάρτη: 10:00 πμ - 16:00 μμ</li>
                            <li className="list-group-item">Πέμπτη: 10:00 πμ - 20:00 μμ</li>
                            <li className="list-group-item">Παρασκευή: 10:00 πμ - 20:00 μμ</li>
                            <li className="list-group-item">Σάββατο: 10:00 πμ - 15:00 μμ</li>
                        </ul>
                    </div>
                    <div className="right">
                        <h4>ΣΤΕΙΛΤΕ ΜΑΣ ΤΗΝ ΕΡΩΤΗΣΗ ΣΑΣ</h4>
                        <span>Θα εξυπηρετήσουμε άμεσα το αιτημά σου</span>
                        <form onSubmit={handleSubmit} className="mt-4 d-flex w-100 flex-column form-container">
                            <div className="mt-2 d-flex justify-content-between w-100">
                                <input 
                                    className="border border-2 border-secondary form-input" 
                                    style={{width:'48%'}} 
                                    placeholder="Ονοματεπώνυμο" 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <input 
                                    className="border border-2 border-secondary form-input" 
                                    style={{width:'48%'}} 
                                    placeholder="Email" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <input 
                                className="mt-4 w-100 border border-2 border-secondary form-input" 
                                placeholder="Κινητό τηλέφωνο" 
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <input 
                                className="mt-4 w-100 border border-2 border-secondary form-input" 
                                placeholder="Θέμα μηνύματος" 
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                            <textarea 
                                className="mt-4 w-100 border border-2 border-secondary form-input" 
                                placeholder="Γράψτε το ερώτημά σας" 
                                rows="4"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                            <div className="mt-4 w-100 d-flex justify-content-start">
                                <button type="submit" className="btn btn-lg btn-success fs-6 fw-bold">ΥΠΟΒΟΛΗ</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="bottom ms-auto me-auto d-flex flex-column">
                    <h4>ΒΡΕΙΤΕ ΜΑΣ ΣΤΟ ΧΑΡΤΗ</h4>
                    <div className="w-100 map mt-4" style={{borderRadius:'0.5rem', overflow:'hidden'}}>
                        <GoogleMapReact
                                    bootstrapURLKeys={{ key: "" }}
                                    defaultCenter={defaultProps.center}
                                    defaultZoom={defaultProps.zoom}
                                >
                                <AnyReactComponent
                                    lat={40.64728239493788}
                                    lng={22.933587873019835}
                                    text="My Marker"
                                />
                        </GoogleMapReact>
                    </div>
                </div>
            </div>
        </div>
    )
}