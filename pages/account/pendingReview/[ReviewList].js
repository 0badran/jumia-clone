import React, { useState, useEffect, createContext } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc,setDoc } from 'firebase/firestore';
import { firestore, auth } from '@/firebase';
import { AccountPageLayout } from "@/components/Account_Layout";
import TargetData from './TargetData';
import { useRouter } from 'next/router';

export const MyDataContext = createContext();

export default function ReviewList() {
    const [orderDocs, setOrderDocs] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [evaluationsArray, setEvaluationsArray] = useState([]);

    useEffect(() => {
        // Get all orders Documents.
        getDocs(collection(firestore, 'order-details')).then(data => {
            setOrderDocs(data.docs);
        }).catch(err => {
            console.error('Error fetching order details:', err);
        });
    }, []);

    useEffect(() => {
        const fetchUserOrders = async () => {
            const allUserOrders = [];
            for (const order of orderDocs) {
                const orderSnapshot = await getDocs(collection(order.ref, 'orders'));
                const ordersData = orderSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                allUserOrders.push(...ordersData);
            }
            setUserOrders(allUserOrders);
        };
        if (orderDocs.length > 0) {
            fetchUserOrders();
        }
    }, [orderDocs]);

    useEffect(() => {
        // Get all products documents.
        getDocs(collection(firestore, 'products')).then(data => {
            const productsData = data.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        });
    }, []);

    const router = useRouter();
    const { ReviewList } = router.query;
      
    const addUserOrders = async (evaluation) => {
        try {
            userOrders.forEach(order => {
                // Assuming there is an array named 'items' inside each order
                order.items.forEach(item => {
                  const user = auth.currentUser;
                  // Access each item inside the 'items' array
                  if(item.product.proId == ReviewList && order.status == "delivered"){
                      order.review = "reviewed";
                      orderDocs.forEach((doc1)=>{
                          if (doc1.data().userId === user.uid)
                          {
                              setDoc(doc(doc1.ref, "orders",order.id),order)
                          }
                      })
                  }
                });
              });
              
            for (const product of products) {
                if (product.proId === ReviewList) {
                    const orderRef = doc(firestore, 'products', product.id);
                    const productSnapshot = await getDoc(orderRef);
                    const productData = productSnapshot.data();
                    let updatedRating = productData.rating || [];
                    if (!Array.isArray(updatedRating)) {
                        updatedRating = [updatedRating];
                    }
                    updatedRating = updatedRating.concat(evaluation);
                    await updateDoc(orderRef, {
                        rating: updatedRating,
                        review: "reviewed"
                    });
                }
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <MyDataContext.Provider value={userOrders}>
            <TargetData ReviewList={ReviewList} addUserOrders={addUserOrders} />
        </MyDataContext.Provider>
    );
}

ReviewList.getLayout = AccountPageLayout;

