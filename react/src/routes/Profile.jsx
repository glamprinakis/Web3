import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from '../api';
import BreadCrumb from '../components/BreadCrumb';

import '../assets/styles/Profile.css';

function Profile(){
    const uid = localStorage.getItem('uid');
    const username = localStorage.getItem('username');
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!uid) return;
        api.get(`/users/${uid}`).then(res => {
            setUser(res.data?.[0] || null);
        }).catch(console.error);
    }, [uid]);

    const onSave = async () => {
        if (!user) return;
        try {
            await api.post(`/users/${uid}/update`, {
                name: user.name,
                surname: user.surname,
                username: user.username,
                pwd: user.password,
                email: user.email,
                city: user.city,
                addr: user.address
            });
            alert('Profile updated');
            setIsEditing(false);
        } catch {
            alert('Failed to update');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        localStorage.removeItem('username');
        window.location.href = '/';
    };

    if (!user) return <div>Loading...</div>;

    return(  
        <div className="login">
            <BreadCrumb                 
                items={[{"path":"/profile","label":"Λογαριασμός"}]}>
            </BreadCrumb>
            
            {/* User Navigation Menu */}
            <div className="w-100 d-flex justify-content-center mt-3 mb-4">
                <div className="user-menu d-flex gap-3">
                    <Link to="/profile" className="btn btn-outline-primary">Προφίλ</Link>
                    <Link to="/order-history" className="btn btn-outline-secondary">Ιστορικό Παραγγελιών</Link>
                    <Link to="/cart" className="btn btn-outline-success">Καλάθι</Link>
                    <button onClick={logout} className="btn btn-outline-danger">Αποσύνδεση</button>
                </div>
            </div>

            <div className="ms-auto me-auto mt-3 account-container d-flex bg-body border border-2">
                <div className="account-container-left d-flex justify-content-center align-items-center flex-column">
                    <span className="description w-90 mb-5">
                        {isEditing ? 'Επεξεργαστείτε τα στοιχεία σας' : 'Τα στοιχεία σας'}
                    </span>
                    <div className="d-flex flex-row align-items-center">
                        <div className="avatar">
                            <img src="https://gitlab.inria.fr/uploads/-/system/user/avatar/641/avatar.png"></img>
                        </div>
                        <span className="ms-3 username">{username || user.username}</span>
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
                            disabled={!isEditing}
                        />
                        <input 
                            className="border border-2 mb-2" 
                            value={user.surname || ''} 
                            onChange={e => setUser({...user, surname: e.target.value})} 
                            type="text" 
                            placeholder="Επίθετο"
                            disabled={!isEditing}
                        />
                        <input 
                            className="border border-2 mb-2" 
                            value={user.email || ''} 
                            onChange={e => setUser({...user, email: e.target.value})} 
                            type="email" 
                            placeholder="Email"
                            disabled={!isEditing}
                        />
                        <input 
                            className="border border-2 mb-2" 
                            value={user.city || ''} 
                            onChange={e => setUser({...user, city: e.target.value})} 
                            type="text" 
                            placeholder="Πόλη"
                            disabled={!isEditing}
                        />
                        <input 
                            className="border border-2 mb-2" 
                            value={user.address || ''} 
                            onChange={e => setUser({...user, address: e.target.value})} 
                            type="text" 
                            placeholder="Διεύθυνση"
                            disabled={!isEditing}
                        />
                        {isEditing && (
                            <input 
                                className="border border-2 mb-2" 
                                value={user.password || ''} 
                                onChange={e => setUser({...user, password: e.target.value})} 
                                type="password" 
                                placeholder="Κωδικός Πρόσβασης"
                            />
                        )}
                    </div>
                </div>
            </div>   
            <div className="w-100 d-flex align-items-center justify-content-center mt-5 gap-3">
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary">ΕΠΕΞΕΡΓΑΣΙΑ</button>
                ) : (
                    <>
                        <button onClick={onSave} className="btn btn-success">ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ</button>
                        <button onClick={() => setIsEditing(false)} className="btn btn-secondary">ΑΚΥΡΩΣΗ</button>
                    </>
                )}
            </div>   
        </div>
    )
}

export default Profile;