import React, { useState, useEffect } from "react";
import { api } from '../api';
import BreadCrumb from '../components/BreadCrumb';

import '../assets/styles/Profile.css';

function Profile(){
    const uid = localStorage.getItem('uid'); // or from context
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!uid) return;
        api.get(`/users/${uid}`).then(res => {
            setUser(res.data?.[0] || null); // backend returns array
        }).catch(console.error);
    }, [uid]);

    const onSave = async () => {
        if (!user) return;
        try {
            await api.post(`/users/${uid}/update`, {
                name: user.name,
                surname: user.surname,
                username: user.username,
                pwd: user.password,    // WARNING: plaintext in your current backend; consider hashing later
                email: user.email,
                city: user.city,
                addr: user.address
            });
            alert('Profile updated');
        } catch {
            alert('Failed to update');
        }
    };

    if (!user) return <div>Loading...</div>;

    return(  
        <div className="login">
            <BreadCrumb                 
                items={[{"path":"/profile","label":"Λογαριασμός"}]}>
            </BreadCrumb>
            <div className="ms-auto me-auto mt-3 account-container d-flex bg-body border border-2">
                <div className="account-container-left d-flex justify-content-center align-items-center flex-column">
                    <span className="description w-90 mb-5">Επεξεργαστείτε τα στοιχεία σας</span>
                    <div className="d-flex flex-row align-items-center">
                        <div className="avatar">
                            <img src="https://gitlab.inria.fr/uploads/-/system/user/avatar/641/avatar.png"></img>
                        </div>
                        <span className="ms-3 username">{user.username}</span>
                    </div>
                </div>
                <div className="account-container-right d-flex align-items-center justify-content-center">
                    <div className="account-form d-flex flex-column">  
                        <input 
                            className="border border-2 mb-2" 
                            value={user.name || ''} 
                            onChange={e => setUser({...user, name: e.target.value})} 
                            type="text" 
                            placeholder="Όνομα"
                        />
                        <input 
                            className="border border-2 mb-2" 
                            value={user.surname || ''} 
                            onChange={e => setUser({...user, surname: e.target.value})} 
                            type="text" 
                            placeholder="Επίθετο"
                        />
                        <input 
                            className="border border-2 mb-2" 
                            value={user.email || ''} 
                            onChange={e => setUser({...user, email: e.target.value})} 
                            type="email" 
                            placeholder="Email"
                        />
                        <input 
                            className="border border-2 mb-2" 
                            value={user.password || ''} 
                            onChange={e => setUser({...user, password: e.target.value})} 
                            type="password" 
                            placeholder="Κωδικός Πρόσβασης"
                        />
                    </div>
                </div>
            </div>   
            <div className="w-100 d-flex align-items-center justify-content-center mt-5">
                <button onClick={onSave} className="btn btn-success">ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ</button>
            </div>   
        </div>
    )
}

export default Profile;