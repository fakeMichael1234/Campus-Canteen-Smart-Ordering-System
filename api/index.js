const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("firebase-admin");

const app = express();
app.use(cors({ origin: true }));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!admin.apps.length && serviceAccountRaw) admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountRaw)) });
const db = admin.apps.length ? admin.firestore() : null;
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) : null;

const menu = [
 {id:"gobi-noodles",name:"Gobi Noodles",price:90,category:"Noodles",stationId:"tiffin"},
 {id:"chicken-biriyani",name:"Chicken Biriyani",price:120,category:"Biriyani",stationId:"tiffin"},
 {id:"veg-biriyani",name:"Veg Biriyani",price:65,category:"Biriyani",stationId:"tiffin"},
 {id:"gobi-rice",name:"Gobi Fried Rice",price:90,category:"Rice",stationId:"tiffin"},
 {id:"egg-fried-rice",name:"Egg Fried Rice",price:85,category:"Rice",stationId:"tiffin"},
 {id:"chicken-65",name:"Chicken 65",price:100,category:"Snacks",stationId:"tiffin"},
 {id:"gobi-65",name:"Gobi 65",price:70,category:"Snacks",stationId:"tiffin"},
 {id:"masala-dosa",name:"Masala Dosa",price:55,category:"Breakfast",stationId:"tiffin"},
 {id:"sambar-rice",name:"Sambar Rice",price:50,category:"Rice",stationId:"tiffin"},
 {id:"grill-chicken-half",name:"Grill Chicken Half",price:180,category:"Grill",stationId:"tiffin"},
 {id:"egg-noodles",name:"Egg Noodles",price:100,category:"Noodles",stationId:"tiffin"},
 {id:"cold-coffee",name:"Cold Coffee",price:45,category:"Drinks",stationId:"juice"}
];
async function requireUser(req,res,next){
 try {
  if(!db)return res.status(503).json({error:"Firebase Admin is not configured on the server."});
  const header=req.headers.authorization||"",token=header.startsWith("Bearer ")?header.slice(7):"";
  if(!token)return res.status(401).json({error:"Sign-in required."});
  req.user=await admin.auth().verifyIdToken(token);next();
 } catch { return res.status(401).json({error:"Your session expired. Sign in again."}); }
}
app.get("/api/health",(_req,res)=>res.json({ok:true,app:"Campus Bites",payments:Boolean(razorpay),firebaseAdmin:Boolean(db)}));

app.post("/api/payments/webhook", async (req, res) => {
 try {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  if (!secret || !signature || !Buffer.isBuffer(req.body)) return res.status(400).send("Invalid webhook configuration or body.");
  const expected = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).send("Invalid webhook signature.");
  const event = JSON.parse(req.body.toString("utf8"));
  const entity = event.payload?.payment?.entity;
  if (entity?.order_id && db && ["payment.captured", "payment.failed"].includes(event.event)) {
   const matches = await db.collectionGroup("history").where("razorpayOrderId", "==", entity.order_id).limit(1).get();
   if (!matches.empty) {
    const status = event.event === "payment.captured" ? "Paid" : "Failed";
    await matches.docs[0].ref.update({
     paymentStatus: status,
     paymentReference: entity.id || "",
     razorpayPaymentId: entity.id || "",
     updatedAt: admin.firestore.FieldValue.serverTimestamp(),
     ...(status === "Paid" ? { paidAt: admin.firestore.FieldValue.serverTimestamp() } : {})
    });
   }
  }
  return res.json({ received: true });
 } catch (error) {
  return res.status(400).send(error.message || "Webhook processing failed.");
 }
});

app.post("/api/payments/create-order",requireUser,async(req,res)=>{
 try {
  if(!razorpay)return res.status(503).json({error:"Razorpay is not configured. Add server credentials."});
  const requested=Array.isArray(req.body.items)?req.body.items:[];
  if(!requested.length)return res.status(400).json({error:"Your cart is empty."});
  const items=requested.map(row=>{
   const product=menu.find(item=>item.id===row.id),quantity=Math.max(0,Math.min(50,Number(row.quantity)||0));
   if(!product||!quantity)throw new Error("An item in your cart is invalid.");
   return {...product,quantity,veg:Boolean(row.veg),image:String(row.image||"")};
  });
  for (const item of items) { const stock = await db.collection("inventory").doc(item.id).get(); if (stock.exists) { if (stock.data().available === false) throw new Error(item.name + " is sold out. Please update your cart."); if (["tiffin","juice","bakery","chat"].includes(stock.data().stationId)) item.stationId = stock.data().stationId; } }
  const subtotal=items.reduce((sum,item)=>sum+item.price*item.quantity,0),gst=Math.round(subtotal*5)/100,platformFee=2,total=Math.round((subtotal+gst+platformFee)*100);
  const receipt="CB"+Date.now().toString(36).toUpperCase();
  const rpOrder=await razorpay.orders.create({amount:total,currency:"INR",receipt,notes:{uid:req.user.uid}});
  const ref=db.collection("orders").doc(req.user.uid).collection("history").doc(),stationIds=[...new Set(items.map(i=>i.stationId))],profile=req.body.profile||{};
  const order={
   id:ref.id,orderId:receipt,uid:req.user.uid,
   items:items.map(({id,name,price,quantity,category,stationId,veg,image})=>({id,name,price,quantity,category,stationId,veg,image})),
   stationIds,stationStatus:Object.fromEntries(stationIds.map(id=>[id,"Pending"])),
   subtotal,gst,platformFee,pickupFee:0,total:total/100,paymentMethod:"Razorpay",paymentStatus:"Pending",razorpayOrderId:rpOrder.id,status:"Confirmed",
   profileSnapshot:{fullName:String(profile.fullName||profile.googleName||""),email:String(req.user.email||""),phoneNumber:String(profile.phoneNumber||""),registeredMobile:String(profile.registeredMobile||""),registerNumber:String(profile.registerNumber||""),department:String(profile.department||""),year:String(profile.year||"")},
   createdAt:admin.firestore.FieldValue.serverTimestamp(),createdAtIso:new Date().toISOString(),updatedAt:admin.firestore.FieldValue.serverTimestamp()
  };
  await ref.set(order);
  res.json({keyId:process.env.RAZORPAY_KEY_ID,razorpayOrderId:rpOrder.id,amount:rpOrder.amount,currency:rpOrder.currency,orderId:ref.id,receipt,total:total/100});
 }catch(error){res.status(400).json({error:error.message||"Unable to start payment."});}
});

app.post("/api/payments/verify",requireUser,async(req,res)=>{
 try {
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature,orderId}=req.body;
  if(!razorpay||!razorpay_signature||!razorpay_payment_id||!razorpay_order_id||!orderId)return res.status(400).json({error:"Payment verification details are incomplete."});
  const expected=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id+"|"+razorpay_payment_id).digest("hex");
  const a=Buffer.from(expected),b=Buffer.from(razorpay_signature);
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(400).json({error:"Payment signature verification failed."});
  const ref=db.collection("orders").doc(req.user.uid).collection("history").doc(orderId),snap=await ref.get();
  if(!snap.exists()||snap.data().razorpayOrderId!==razorpay_order_id)return res.status(404).json({error:"Order/payment record not found."});
  const payment=await razorpay.payments.fetch(razorpay_payment_id);
  if(payment.order_id!==razorpay_order_id||payment.status!=="captured")return res.status(409).json({error:"Payment has not been captured yet. Please wait or contact support."});
  await ref.update({paymentStatus:"Paid",paymentReference:razorpay_payment_id,razorpayPaymentId:razorpay_payment_id,razorpaySignatureVerified:true,paidAt:admin.firestore.FieldValue.serverTimestamp(),updatedAt:admin.firestore.FieldValue.serverTimestamp()});
  res.json({success:true,order:{...snap.data(),paymentStatus:"Paid",paymentReference:razorpay_payment_id}});
 }catch(error){res.status(400).json({error:error.message||"Unable to verify payment."});}
});
module.exports=app;
if(process.env.NODE_ENV!=="production"){const PORT=process.env.PORT||3000;app.listen(PORT,()=>console.log("Campus Bites API listening on "+PORT));}
