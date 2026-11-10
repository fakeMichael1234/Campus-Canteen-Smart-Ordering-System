import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import PageTransition from "../components/PageTransition";
import PremiumButton from "../components/PremiumButton";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import { calculateTotals, formatCurrency } from "../lib/utils";

function loadRazorpay(){
 return new Promise((resolve,reject)=>{
  if(window.Razorpay)return resolve(true);
  const script=document.createElement("script");script.src="https://checkout.razorpay.com/v1/checkout.js";
  script.onload=()=>resolve(true);script.onerror=()=>reject(new Error("Unable to load Razorpay checkout. Check your internet connection."));
  document.body.appendChild(script);
 });
}

export default function Checkout(){
 const {cartItems,profile,clearCart}=useAuth(),navigate=useNavigate(),totals=calculateTotals(cartItems);
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const profileReady=Boolean(profile?.fullName&&(profile?.registeredMobile||profile?.phoneNumber));
 const profileRows=useMemo(()=>[["Name",profile?.fullName||profile?.googleName||"Not set"],["Email",profile?.email||"Not set"],["Mobile",profile?.registeredMobile||profile?.phoneNumber||"Not set"],["Hostel",profile?.hostel||"Not set"],["Address",profile?.address||"Campus pickup"]],[profile]);

 if(!cartItems.length)return <PageTransition className="section-shell py-10"><EmptyState icon={ShieldCheck} title="Nothing to checkout" body="Add items to your cart before placing an order." action="Open menu" onAction={()=>navigate("/menu")}/></PageTransition>;

 const submitOrder=async()=>{
  setLoading(true);setError("");
  try{
   await loadRazorpay();
   const user=auth.currentUser;if(!user)throw new Error("Please sign in again.");
   const token=await user.getIdToken();
   const response=await fetch("/api/payments/create-order",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({items:cartItems.map(i=>({id:i.id,quantity:i.quantity,veg:i.veg,image:i.image})),profile})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not start payment.");
   const options={
    key:data.keyId,amount:data.amount,currency:data.currency,name:"Campus Bites",description:"Canteen order payment",order_id:data.razorpayOrderId,
    prefill:{name:profile?.fullName||profile?.googleName||"",email:user.email||"",contact:profile?.registeredMobile||profile?.phoneNumber||""},
    notes:{campusOrderId:data.orderId},
    theme:{color:"#ea580c"},
    handler:async(payment)=>{
     try{
      const verify=await fetch("/api/payments/verify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+await user.getIdToken()},body:JSON.stringify({...payment,orderId:data.orderId})});
      const result=await verify.json();if(!verify.ok)throw new Error(result.error||"Payment verification failed.");
      await clearCart();navigate("/ebill",{replace:true,state:{order:result.order}});
     }catch(e){setError(e.message);navigate("/payment-result?orderId="+encodeURIComponent(data.orderId));}
    },
    modal:{ondismiss:()=>setError("Payment was cancelled. Your order has not been confirmed as paid. You can retry checkout from your cart.")}
   };
   const razorpay=new window.Razorpay(options);razorpay.on("payment.failed",response=>setError(response.error?.description||"Payment failed. Please try again."));razorpay.open();
  }catch(e){setError(e.message||"Unable to start payment.");}
  finally{setLoading(false);}
 };

 return <PageTransition className="section-shell py-8 md:py-10">
  <div className="mb-8"><div className="eyebrow"><ShieldCheck className="h-3.5 w-3.5"/> Secure Razorpay checkout</div><h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Confirm pickup details.</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-500">Pay securely with UPI, Google Pay, PhonePe, cards and supported Razorpay methods.</p></div>
  <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
   <div className="space-y-6"><section className="premium-card rounded-[2rem] p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-display text-2xl font-extrabold text-ink-900">Student details</h2><p className="mt-1 text-sm font-semibold text-ink-500">Autofilled from your saved account.</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${profileReady?"bg-teal-50 text-teal-700":"bg-amber-50 text-amber-700"}`}>{profileReady?"Ready":"Needs update"}</span></div><div className="grid gap-3 sm:grid-cols-2">{profileRows.map(([label,value])=><div key={label} className="rounded-2xl bg-pearl-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">{label}</p><p className="mt-1 break-words text-sm font-extrabold text-ink-900">{value}</p></div>)}</div>{!profileReady&&<Link to="/profile" className="mt-5 inline-flex rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-800">Complete profile before checkout</Link>}</section>
   <section className="premium-card rounded-[2rem] p-6"><h2 className="font-display text-2xl font-extrabold text-ink-900">Payment method</h2><div className="mt-5 flex items-center gap-4 rounded-3xl border border-ember-200 bg-ember-50 p-4"><div className="rounded-2xl bg-white p-3 text-ember-700 shadow-sm"><CheckCircle2 className="h-6 w-6"/></div><div><p className="font-display text-lg font-extrabold text-ink-900">Razorpay</p><p className="text-xs font-bold text-ink-500">UPI · Google Pay · PhonePe · Cards · Netbanking</p></div></div><p className="mt-4 text-xs font-semibold leading-6 text-ink-500">Your order is sent to the counter only after Razorpay payment verification succeeds.</p></section></div>
   <aside className="h-fit rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-soft backdrop-blur-2xl lg:sticky lg:top-28"><div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-ember-50 p-3 text-ember-700"><MapPin className="h-5 w-5"/></div><div><h2 className="font-display text-xl font-extrabold text-ink-900">Pickup order</h2><p className="text-xs font-bold text-ink-500">Four dedicated food counters</p></div></div><div className="space-y-3">{cartItems.map(item=><div key={item.id} className="flex items-center gap-3 rounded-2xl bg-pearl-50 p-3"><img src={item.image} alt="" className="h-14 w-14 rounded-2xl object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-ink-900">{item.name}</p><p className="text-xs font-bold text-ink-500">Qty {item.quantity}</p></div><p className="font-black text-ember-700">{formatCurrency(item.price*item.quantity)}</p></div>)}</div><div className="mt-5 rounded-3xl bg-ink-900 p-5 text-white"><div className="space-y-2 text-sm font-bold text-white/60"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div><div className="flex justify-between"><span>GST</span><span>{formatCurrency(totals.gst)}</span></div><div className="flex justify-between"><span>Platform</span><span>{formatCurrency(totals.platformFee)}</span></div></div><div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4"><span className="text-sm font-bold text-white/60">Total</span><span className="font-display text-3xl font-extrabold">{formatCurrency(totals.total)}</span></div></div>{error&&<p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}<PremiumButton className="mt-5 w-full" icon={loading?Loader2:ShieldCheck} loading={loading} disabled={!profileReady||loading} onClick={submitOrder}>Pay securely with Razorpay</PremiumButton></aside>
  </div>
 </PageTransition>;
}
