import  {buffer} from 'micro';
import * as admin from "firebase-admin";


//Secure a connection to FIREBASE from the backend
const serviceAccount = require('../../../permissions.json');

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}) 

//Establish connection to stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;


const  fullfillOrder = async (session) =>{
    //console.log('Fulfilling order ',session);
    return app.firestore()
              .collection("users")
              .doc(session.metadata.email)
              .collection("orders")
              .doc(session.id)
              .set({
                  amount : session.amount_total / 100,
                  amount_shipping : session.total_details.amount_shipping / 100,
                  images : JSON.parse(session.metadata.images),
                  timestamp : admin.firestore.FieldValue.serverTimestamp()
              })
              .then(()=>
              console.log(`SUCCESS: order ${session.id} has been added to the DB`))
              .catch(error=>console.log(`Error code : ${error}`));
}

export default async (req,res) => {
    if(req.method === 'POST'){
        const requestBuffer = await buffer(req);
        const payload = requestBuffer.toString();
        const sig = req.headers["stripe-signature"];

        let event;

        //Verify that the EVENT posted came from stripe
        try {
            event = stripe.webhooks.constructEvent(payload,sig,endpointSecret)
        } catch (error) {
            console.log('ERROR',error.message);
            return res.status(400,`webhook error: ${error.message}`)
        }
        //Handle checkout.session.completed
        if(event.type === 'checkout.session.completed'){
            const session = event.data.object;
            //Fulfill the order... means saving to firebase
            console.log(`USING FULLFILLORDER FUNCTION ${fullfillOrder(session)}`);
            return fullfillOrder(session)
            .then(()=>res.status(200))
            .catch((err)=>res.status(400).send(`Webhook Error: ${err.message} `));
        }
    }
    if(req.method === 'GET'){

    }
}

export const config = {
    api:{
        bodyParser: false,
        externalResolver: true
    }
}