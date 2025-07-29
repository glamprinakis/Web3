import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";

import BreadCrumb from "../components/BreadCrumb";
import ProductCarousel from "../components/ProductCarousel";
import { api } from '../api'; // or './api' depending on folder

import '../assets/styles/Home.css';
import bannerRight from '../assets/images/image 1.png';

function Home(){
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products')
            .then(res => setItems(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="Home">
            <BreadCrumb/>
            <div className="w-100 d-flex mt-4 justify-content-center align-items-center">
                <div className="banner border-light border bg-secondary">
                    <button className="mt-2 btn btn-light shadow-none right-banner-btn text-light fw-bold btn-banner">
                        Περισσότερα
                    </button>
                </div>
                <div className="right-banner bg-secondary border border-light d-flex align-items-center justify-content-center flex-column">
                    <img alt="" src={bannerRight}></img>
                    <span className="fw-bold">
                        Φτιάξε τον δικό σου Η/Υ
                    </span>
                    <button className="mt-2 btn btn-light shadow-none right-banner-btn text-light fw-bold">
                        Επόμενο
                    </button>
                </div>
            </div>
            <ProductCarousel title="Δημοφιλή προϊόντα" products={
                items.map(p => ({
                    "img": p.image || "https://via.placeholder.com/300x300",
                    "name": p.name,
                    "pid": p.pid,
                    "price": p.price
                }))
            }/>
            <div className="w-100 ms-auto me-auto categories-title">
                <span style={{marginLeft:"11rem"}} className="home-categories-title">Ψάξτε ανά κατηγορία</span>
            </div>
            <div className="w-75 ms-auto me-auto home-categories">
                <Link to="/categories/monitors" className="category-card d-flex align-items-center justify-content-center flex-column">
                    <img alt="" src="https://images.samsung.com/is/image/samsung/p6pim/no/ls32ag320nuxen/gallery/no-odyssey-g3-g32a-ls32ag320nuxen-531086442?$650_519_PNG$"></img>
                    <span className="text-align-center">Οθόνες</span>
                </Link>
                <Link to="/categories/tablets" className="category-card d-flex align-items-center justify-content-center flex-column">
                    <img alt="" src="https://www.custommacbd.com/cdn/shop/products/ipad-pro-12-select-202104_4bda6238-716d-4a43-997c-bf0caa926e30.png?v=1662195591"></img>
                    <span className="text-align-center">Tablets</span>
                </Link>
                <Link to="/categories/peripherals" className="category-card d-flex align-items-center justify-content-center flex-column">
                    <img alt="" src="https://resource.logitechg.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight/pro-x-superlight-black-gallery-1.png?v=1"></img>
                    <span className="text-align-center">Περιφερειακά</span>
                </Link>
                <Link to="/categories/laptops" className="category-card d-flex align-items-center justify-content-center flex-column">
                    <img alt="" src="https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8MzgxMTU4fGltYWdlL3BuZ3xoMDMvaGM5LzE0MzIyOTk4OTAyODE0LnBuZ3xkNTExOTkzODA2NzViZGQwOTY1NDg5NDkzMWViYTFiYjMwMTk5ZWQyM2M5MDg5YzkwOTUwZDdhMjI3NGRiOGM2/lenovo-laptop-thinkpad-l15-intel-hero.png"></img>
                    <span className="text-align-center">Laptops</span>
                </Link>
                <Link to="/categories/desktops" className="category-card d-flex align-items-center justify-content-center flex-column">
                    <img alt="" src="https://benson.ph/cdn/shop/products/T440d8.webp?v=1660708548"></img>
                    <span className="text-align-center">Desktops & Servers</span>
                </Link>
                <Link to="/categories/networking" className="category-card d-flex align-items-center justify-content-center flex-column">
                    <img alt="" src="https://cdn.connectec.uk/uploads/products/U6-LR1.png?scale.height=1000&canvas.height=1000&scale.width=1200&canvas.width=1200&canvas.opacity=0&crop.type=trim&crop.pad.x=5%&crop.pad.y=5%"></img>
                    <span className="text-align-center">Δικτυακά</span>
                </Link>            
            </div>
            <ProductCarousel title="Νέα προϊόντα" products={
                items.slice(0, 5).map(p => ({
                    "img": p.image || "https://via.placeholder.com/300x300",
                    "name": p.name,
                    "pid": p.pid,
                    "price": p.price
                }))
            }/>
        </div>
    )
}

export default Home;