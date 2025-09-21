'use client';
import React from "react";
import { useRouter, useParams } from "next/navigation";
import styles from './order.module.css'

//components
import OrderStepper  from "./../../../components/UI/Profile/leftSection/Orders/OrderStepper";
import type { OrderStatus } from "./../../../components/UI/Profile/leftSection/Orders/OrderStepper";
import InfoCard from "../../../components/UI/Profile/leftSection/Orders/InfoCard";
import ItemCard from "../../../components/UI/Profile/leftSection/Orders/ItemCard";
import img from './../../../public/acessts/Frame.png'
import Header from "@/components/Layout/Nav/Header";
import Footer from "@/Pages/HomePage/sections/FooterSection/Footer";

const order = {
    id: '1',
    orderNumber: 'ORD-001',
    status: 'processing' as OrderStatus,
    date: '2025-08-30',
    total: 150.00,
    items: [
      { id: 'item1', name: 'منتج 1', image: img, price: 50.00 },
      { id: 'item2', name: 'منتج 2', image: img, price: 50.00 },
      { id: 'item3', name: 'منتج 3', image: img, price: 25.00 },
      { id: 'item4', name: 'منتج 4', image: img, price: 25.00 },
      { id: 'item5', name: 'منتج 5', image: img, price: 25.00 },
      { id: 'item6', name: 'منتج 6', image: img, price: 25.00 },
    ]
  }

const OrderDetails: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params?.orderNumber;

  return (
    <div className={styles.container}>
      {/* <Header/> */}
      <div className={styles.content_wrapper}>
        <span className={styles.title}> تفاصيل الطلب {orderNumber} </span>
        <div className={styles.stepper}>
          <OrderStepper currentStatus={order.status} />
        </div>
        <div className={styles.info_order}>
          <div className={styles.information_section}>
              <InfoCard 
                  orderNumber={order.orderNumber}
                  orderPrice={`${order.total}ج`}
                  orderDate={order.date}
                  address={"123 شارع فيصل، القاهرة، مصر"}
                  phone={"0150134567"}
                  name={"أحمد محمد"}
              />
          </div>
          <div className={styles.Items_container}>
              <span className={styles.items_title}>المنتجات الخاصة بطلبك</span>
              <div className={styles.items_list}>
                  {order.items.map(item => (
                      <ItemCard 
                          key={item.id}         
                          image={typeof item.image === 'string' ? item.image : item.image.src}
                          name={item.name}
                          price={`${item.price}ج`}
                      />
                  ))}

              </div>
          </div>

        </div>
      </div>
      {/* <Footer/> */}
      
    </div>
  );
};

export default OrderDetails;