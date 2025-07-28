import React, { useState, useEffect } from "react";
import { api } from '../api';
import Navbar from "../components/Navbar";
import BreadCrumb from '../components/BreadCrumb';
import Footer from '../components/Footer';
import TableRow from '../laz/components/Cart/TableRow'
import '../laz/laz.css'
import '../laz/pages/Cart.css'
import { products_cart } from '../laz/dummys/cart'

import '../assets/styles/OrderHistory.css';

const styles = {
    checkoutSection: {
        boxShadow: '3px 3px 3px 0px rgba(0, 0, 0, 0.05)', borderRadius: '10px', background: '#F8F8F8',
        padding: '20px', margin: '2rem'
    },
    inputDefault: {
        height: '49px', padding: '20px 10px', flexWrap: 'wrap',
        border: '1px solid #D9D9D9'
    },
    inputLabel: { display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-evenly', paddingBottom: '0.8rem' },
    classLabel: { paddingBottom: '0.4rem' },
    textStyle: { color: '#3A3A3A', fontSize: '16px', fontStyle: 'normal', lineHeight: '22.08px', letterSpacing: '0.48px' },
    productsLayout: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', alignContent: 'flex-start',
        rowGap: '10px', flexWrap: 'wrap'
    }
}

function OrderHistory() {
    const uid = localStorage.getItem('uid'); // however you store it
    const [orders, setOrders] = useState([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (!uid) return;
        api.get(`/users/${uid}/orders`)
            .then(res => setOrders(res.data)) // array of { totalOrderId }
            .catch(console.error);
    }, [uid]);

    const openOrder = async (totalOrderId) => {
        const { data } = await api.get(`/orders/${totalOrderId}/products`);
        setLines(data); // render in UI
    };

    return (
        <div className="login">
            <BreadCrumb
                items={[{ "path": "/order-history", "label": "Παραγγελίες" }]}>
            </BreadCrumb>

            <br></br><br></br>

            <div className="page-title text-center">
                <h4><b><u>ΙΣΤΟΡΙΚΟ ΠΑΡΑΓΓΕΛΙΩΝ</u></b></h4>
            </div>

            <br></br>

            <h2>Orders</h2>
            <ul>
                {orders.map(o => (
                    <li key={o.totalOrderId}>
                        {o.totalOrderId} <button onClick={() => openOrder(o.totalOrderId)}>View</button>
                    </li>
                ))}
            </ul>

            <h3>Items</h3>
            <ul>
                {lines.map((l, i) => <li key={i}>{l.pid} x {l.orderAmount}</li>)}
            </ul>
        </div>
    )
}

export default OrderHistory;