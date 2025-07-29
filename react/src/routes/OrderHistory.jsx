import React, { useState, useEffect } from "react";
import { api } from '../api';
import BreadCrumb from '../components/BreadCrumb';
import TableRow from '../laz/components/Cart/TableRow'
import MobileTable from '../laz/components/Cart/MobileTable'
import '../laz/laz.css'
import '../laz/pages/Cart.css'
import '../assets/styles/OrderHistory.css';

function OrderHistoryTableRow({ item }) {
    return (
        <tr>
            <td>
                <div className='img-info-cart'>
                    <div className='image-cart'>
                        <img 
                            src={item.product?.image || "https://via.placeholder.com/300x300"} 
                            alt={item.product?.name || "Product"} 
                        />
                    </div>
                    <div className='name-price-cart'>
                        <span>{item.product?.name || 'Product Not Found'}</span>
                        <span>{(item.orderCost / item.orderAmount).toFixed(2)}€</span>
                    </div>
                </div>
            </td>
            <td>
                <div className='quantity-cart flex row gap-1 justify-content-center'>
                    <span className="quantity-display">{item.orderAmount}</span>
                </div>
            </td>
            <td className='price-cell'>{item.orderCost.toFixed(2)}€</td>
        </tr>
    );
}

function OrderHistoryMobileTable({ item }) {
    return (
        <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', borderBottom: '2px solid #CDCDCD'}}>
            <div style={{display: 'flex',justifyContent:'center',alignItems:'center',flexDirection: 'row', flexWrap: 'wrap'}}>
                <div>
                    <img 
                        style={{width: '250px'}} 
                        src={item.product?.image || "https://via.placeholder.com/300x300"} 
                        alt={item.product?.name || "Product"}
                    />
                </div>
                <div className='name-price-cart'>
                    <span style={{fontSize: '25px'}}>{item.product?.name || 'Product Not Found'}</span>
                    <span style={{fontSize: '25px'}}>{(item.orderCost / item.orderAmount).toFixed(2)}€</span>
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row',justifyContent:'center', alignItems: 'center', gap: '3rem', margin: '0.5rem 1rem'}}>
                <div className='quantity-cart flex row gap-1'>
                    <span>Ποσότητα: {item.orderAmount}</span>
                </div>
                <div style={{fontSize: '3rem', color: '#198754'}}>
                    {item.orderCost.toFixed(2)}€
                </div>
            </div>
        </div>
    );
}

function OrderHistory() {
    const uid = localStorage.getItem('uid');
    const [orderGroups, setOrderGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('OrderHistory component mounted, uid:', uid);

    useEffect(() => {
        console.log('useEffect triggered, uid:', uid);
        
        if (!uid) {
            console.log('No uid found in localStorage');
            setLoading(false);
            setError('Δεν είστε συνδεδεμένοι. Παρακαλώ συνδεθείτε πρώτα.');
            return;
        }
        
        const fetchOrderHistory = async () => {
            try {
                console.log('Fetching orders for uid:', uid);
                // Get all unique order IDs
                const ordersRes = await api.get(`/users/${uid}/orders`);
                console.log('Orders response:', ordersRes.data);
                
                const orderIds = ordersRes.data;

                if (!orderIds || orderIds.length === 0) {
                    console.log('No orders found');
                    setOrderGroups([]);
                    setLoading(false);
                    return;
                }

                // Fetch detailed information for each order
                const orderGroupsData = await Promise.all(
                    orderIds.map(async (order) => {
                        console.log('Fetching details for order:', order.totalOrderId);
                        const orderDetails = await api.get(`/orders/${order.totalOrderId}/products`);
                        console.log('Order details:', orderDetails.data);
                        
                        // Get product details for each order item
                        const orderItemsWithProducts = await Promise.all(
                            orderDetails.data.map(async (item) => {
                                try {
                                    console.log('Fetching product details for pid:', item.pid);
                                    const productRes = await api.get(`/products/id/${item.pid}`);
                                    console.log('Product details:', productRes.data);
                                    return {
                                        ...item,
                                        product: productRes.data
                                    };
                                } catch (error) {
                                    console.error('Error fetching product:', error);
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

                console.log('Final order groups data:', orderGroupsData);

                // Sort by date (most recent first)
                orderGroupsData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrderGroups(orderGroupsData);
            } catch (error) {
                console.error('Error fetching order history:', error);
                setError('Σφάλμα κατά τη φόρτωση των παραγγελιών: ' + error.message);
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

    console.log('Rendering OrderHistory - loading:', loading, 'error:', error, 'orderGroups:', orderGroups);

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

    if (error) {
        return (
            <div className="order-history-container">
                <BreadCrumb
                    items={[{ "path": "/order-history", "label": "Παραγγελίες" }]}>
                </BreadCrumb>
                <div className="text-center mt-5">
                    <div className="alert alert-danger" role="alert">
                        <h4>Σφάλμα</h4>
                        <p>{error}</p>
                        {!uid && (
                            <a href="/login" className="btn btn-primary">
                                Σύνδεση
                            </a>
                        )}
                    </div>
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
                    <section key={orderGroup.totalOrderId} className='cart-section container section-75rem mb-5'>
                        {/* Order Info Above Table */}
                        <div className="order-info-header bg-light p-3 rounded mb-3 border">
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Αριθμός Παραγγελίας:</strong> #{orderGroup.totalOrderId}
                                </div>
                                <div className="col-md-6">
                                    <strong>Ημερομηνία:</strong> {formatDate(orderGroup.orderDate)}
                                </div>
                            </div>
                        </div>

                        {/* Cart-like Table */}
                        <div className='cart-up'>
                            <div className='screen'>
                                <table>
                                    <tbody>
                                        <tr className='headers'>
                                            <th>ΠΡΟΙΟΝ</th>
                                            <th>ΠΟΣΟΤΗΤΑ</th>
                                            <th>ΤΙΜΗ</th>
                                        </tr>
                                        {orderGroup.items.map((item, index) => (
                                            <OrderHistoryTableRow key={index} item={item} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile View */}
                            <div className='mobile' style={{display: 'flex', flexDirection: 'column'}}>
                                <div style={{fontSize: '26px', borderBottom: '2px solid #CDCDCD'}}>ΠΡΟΙΟΝΤΑ</div>
                                {orderGroup.items.map((item, index) => (
                                    <OrderHistoryMobileTable key={index} item={item} />
                                ))}
                            </div>
                        </div>

                        {/* Order Total */}
                        <div className='cart-down section-5rem'>
                            <p style={{fontSize: '30px'}}>ΣΥΝΟΛΟ ΠΑΡΑΓΓΕΛΙΑΣ</p>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>ΑΞΙΑ ΠΡΟΙΟΝΤΩΝ</td>
                                        <td className='number'>{orderGroup.totalCost.toFixed(2)}€</td>
                                    </tr>
                                    <tr>
                                        <td>ΜΕΤΑΦΟΡΙΚΑ</td>
                                        <td className='number'>5.00€</td>
                                    </tr>
                                    <tr style={{borderTop: '3px solid #727272'}}>
                                        <td>ΣΥΝΟΛΟ</td>
                                        <td className='number'>{(orderGroup.totalCost + 5.00).toFixed(2)}€</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}

export default OrderHistory;