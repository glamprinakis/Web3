import React, {useRef, useState} from "react";
import { Link } from "react-router-dom";
import Slider from 'react-slick'

import '../assets/styles/ProductCarousel.css'

export default function ProductCarousel(props) {

    const title = props.title;

    const sliderRef = useRef();
    let nodes = "";

    if(props.products){
        nodes = props.products.map(product => 
            <div key={product.img} className="product-carousel-product-card">
                <Link to={`/product/${product.pid || product.id}`} className="text-decoration-none d-flex flex-column h-100">
                    <div className="product-image-container d-flex justify-content-center align-items-center flex-grow-1">
                        <img alt={product.name || 'Product'} src={product.img}></img>
                    </div>
                    {product.name && (
                        <div className="product-info mt-2 text-center px-2">
                            <h6 className="text-dark mb-1 small">{product.name}</h6>
                            {product.price && (
                                <p className="text-success fw-bold mb-0 small">€{product.price}</p>
                            )}
                        </div>
                    )}
                </Link>
            </div>
        )
    }

    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000
    };

    return(
        <div className="w-100 mt-5">                
            <span className="product-carousel-title">{title}</span>
            <div className="w-100 d-flex justify-content-center align-items-center">
                <button className="text-light btn slick-btn me-3" onClick={()=>sliderRef?.current?.slickPrev()}><i className="bi bi-arrow-left"></i></button>   
                <Slider ref={sliderRef} {...settings} className="mt-3 w-75">
                    {nodes}
                </Slider>
                <button className="text-light btn slick-btn ms-3" onClick={()=>sliderRef?.current?.slickNext()}><i className="bi bi-arrow-right"></i></button>
            </div>
        </div>
    )
}