import React, { useState, useEffect } from "react";
import { api } from '../api';
import BreadCrumb from '../components/BreadCrumb';
import '../laz/laz.css'
import '../laz/pages/Cart.css'
import '../assets/styles/OrderHistory.css';

function OrderHistory() {
    const uid = localStorage.getItem('uid');
    const [orderGroups, setOrderGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;
        
        const fetchOrderHistory = async () => {
            try {
                // Get all unique order IDs
                const ordersRes = await api.get(`/users/${uid}/orders`);
                const orderIds = ordersRes.data;

                // Fetch detailed information for each order
                const orderGroupsData = await Promise.all(
                    orderIds.map(async (order) => {
                        const orderDetails = await api.get(`/orders/${order.totalOrderId}/products`);
                        
                        // Get product details for each order item
                        const orderItemsWithProducts = await Promise.all(
                            orderDetails.data.map(async (item) => {
                                try {
                                    const productRes = await api.get(`/products/id/${item.pid}`);
                                    return {
                                        ...item,
                                        product: productRes.data
                                    };
                                } catch (error) {
                                    return {
                                        ...item,
                                        product: {
                                            name: 'Product Not Found',
                                            image: 'https://via.placeholder.com/300x300',
                                            pid: item.pid
                                        }
                                    };
                                }
                            })
                        );

                        // Calculate total for this order
                        const totalCost = orderItemsWithProducts.reduce((sum, item) => 
                            sum + (item.orderCost || 0), 0
                        );

                        return {
                            totalOrderId: order.totalOrderId,
                            orderDate: orderItemsWithProducts[0]?.orderDate || new Date(),
                            items: orderItemsWithProducts,
                            totalCost: totalCost
                        };
                    })
                );

                // Sort by date (most recent first)
                orderGroupsData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrderGroups(orderGroupsData);
            } catch (error) {
                console.error('Error fetching order history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [uid]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('el-GR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderStatus = () => {
        // For now, we'll show all orders as delivered since we don't have status in DB
        return 'Παραδόθηκε';
    };

    if (loading) {
        return (
            <div className="order-history-container">
                <BreadCrumb
                    items={[{ "path": "/order-history", "label": "Παραγγελίες" }]}>
                </BreadCrumb>
                <div className="text-center mt-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Φόρτωση...</span>
                    </div>
                    <p className="mt-3">Φόρτωση παραγγελιών...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <BreadCrumb
                items={[{ "path": "/order-history", "label": "Παραγγελίες" }]}>
            </BreadCrumb>

            <div className="page-title text-center mt-4 mb-5">
                <h2 className="fw-bold text-success">ΙΣΤΟΡΙΚΟ ΠΑΡΑΓΓΕΛΙΩΝ</h2>
                <p className="text-muted">Δείτε όλες τις παλαιότερες παραγγελίες σας</p>
            </div>

            {orderGroups.length === 0 ? (
                <div className="empty-orders text-center mt-5">
                    <div className="empty-icon mb-3">
                        <i className="bi bi-bag-x fs-1 text-muted"></i>
                    </div>
                    <h4 className="text-muted mb-3">Δεν υπάρχουν παραγγελίες</h4>
                    <p className="text-muted">Δεν έχετε κάνει καμία παραγγελία ακόμη.</p>
                    <a href="/categories/laptops" className="btn btn-success mt-3">
                        Ξεκινήστε τις αγορές σας
                    </a>
                </div>
            ) : (
                orderGroups.map((orderGroup) => (
                    <section key={orderGroup.totalOrderId} className='order-section container section-75rem mb-5'>
                        {/* Order Header */}
                        <div className="order-header bg-light p-3 rounded-top border">
                            <div className="row">
                                <div className="col-md-3">
                                    <small className="text-muted">ΠΑΡΑΓΓΕΛΙΑ</small>
                                    <div className="fw-bold">#{orderGroup.totalOrderId}</div>
                                </div>
                                <div className="col-md-3">
                                    <small className="text-muted">ΗΜΕΡΟΜΗΝΙΑ</small>
                                    <div>{formatDate(orderGroup.orderDate)}</div>
                                </div>
                                <div className="col-md-3">
                                    <small className="text-muted">ΣΥΝΟΛΟ</small>
                                    <div className="fw-bold text-success">{orderGroup.totalCost.toFixed(2)}€</div>
                                </div>
                                <div className="col-md-3">
                                    <small className="text-muted">ΚΑΤΑΣΤΑΣΗ</small>
                                    <div>
                                        <span className="badge bg-success">{getOrderStatus()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className='order-items bg-white border border-top-0 rounded-bottom'>
                            <div className='screen'>
                                <table className="table table-borderless mb-0">
                                    <thead className="border-bottom">
                                        <tr>
                                            <th className="py-3">ΠΡΟΙΟΝ</th>
                                            <th className="py-3">ΠΟΣΟΤΗΤΑ</th>
                                            <th className="py-3">ΤΙΜΗ ΜΟΝΑΔΑΣ</th>
                                            <th className="py-3">ΣΥΝΟΛΟ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderGroup.items.map((item, index) => (
                                            <tr key={index} className="border-bottom">
                                                <td className="py-3">
                                                    <div className='img-info-cart'>
                                                        <div className='image-cart'>
                                                            <img 
                                                                src={item.product.image || "https://via.placeholder.com/300x300"} 
                                                                alt={item.product.name}
                                                                style={{width: '60px', height: '60px', objectFit: 'contain'}}
                                                            />
                                                        </div>
                                                        <div className='name-price-cart ms-3'>
                                                            <div className="fw-bold">{item.product.name}</div>
                                                            <small className="text-muted">SKU: {item.product.product_code || item.pid}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className="badge bg-secondary">{item.orderAmount}</span>
                                                </td>
                                                <td className="py-3">
                                                    <span>{(item.orderCost / item.orderAmount).toFixed(2)}€</span>
                                                </td>
                                                <td className="py-3">
                                                    <span className="fw-bold text-success">{item.orderCost.toFixed(2)}€</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View */}
                            <div className='mobile' style={{display: 'none'}}>
                                <div className="p-3">
                                    {orderGroup.items.map((item, index) => (
                                        <div key={index} className="mobile-order-item border-bottom py-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <img 
                                                    src={item.product.image || "https://via.placeholder.com/300x300"} 
                                                    alt={item.product.name}
                                                    style={{width: '50px', height: '50px', objectFit: 'contain'}}
                                                    className="me-3"
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold">{item.product.name}</div>
                                                    <small className="text-muted">SKU: {item.product.product_code || item.pid}</small>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Ποσότητα: <span className="badge bg-secondary">{item.orderAmount}</span></span>
                                                <span className="fw-bold text-success">{item.orderCost.toFixed(2)}€</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}

export default OrderHistory;