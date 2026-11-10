import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { auth } from "../lib/firebase";

export default function PaymentResult(){
 const {search}=useLocation(),navigate=useNavigate();const [message,setMessage]=useState("Verifying payment with Razorpay…"),[error,setError]=useState(false);
 useEffect(()=>{let active=true;(async()=>{try{
  const p=new URLSearchParams(search),orderId=p.get("orderId"),user=auth.currentUser;
  if(!user)throw new Error("Please sign in again to verify your payment.");
  const token=await user.getIdToken();
  const response=await fetch("/api/payments/verify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({orderId,razorpay_order_id:p.get("razorpay_order_id"),razorpay_payment_id:p.get("razorpay_payment_id"),razorpay_signature:p.get("razorpay_signature")})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||"Payment verification failed.");
  if(active)navigate("/ebill",{replace:true,state:{order:data.order}});
 }catch(e){if(active){setError(true);setMessage(e.message);}}})();return()=>{active=false}},[search,navigate]);
 return <PageTransition className="section-shell grid min-h-[70vh] place-items-center py-12"><div className="premium-card w-full max-w-lg rounded-3xl p-8 text-center">{error?<XCircle className="mx-auto h-14 w-14 text-red-600"/>:<Loader2 className="mx-auto h-14 w-14 animate-spin text-ember-600"/>}<h1 className="mt-5 text-2xl font-extrabold">{error?"Payment verification needs attention":"Confirming your payment"}</h1><p className="mt-3 text-sm text-ink-500">{message}</p>{error&&<div className="mt-6"><PremiumButton onClick={()=>navigate("/orders")}>Check my orders</PremiumButton></div>}</div></PageTransition>;
}