import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { AppProps } from "next/app";
import "../styles/globals.css";

const firebaseProdConfig = {
  apiKey: "AIzaSyDKT7NV3QfisgKj6ytLhqARuxPOYTdR_6M",
  authDomain: "studymode-prod.firebaseapp.com",
  projectId: "studymode-prod",
  storageBucket: "studymode-prod.appspot.com",
  messagingSenderId: "281605760182",
  appId: "1:281605760182:web:816870a60d44eed68c3217",
};

const firebaseTestConfig = {
  apiKey: "AIzaSyAQQLXuZgE8LCqE-K7FXxz3iQQvbbshQsE",
  authDomain: "studymode-staging.firebaseapp.com",
  projectId: "studymode-staging",
  storageBucket: "studymode-staging.appspot.com",
  messagingSenderId: "824820120334",
  appId: "1:824820120334:web:324d0e4ac1a59ffb2bb55f",
};

const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? firebaseProdConfig
    : firebaseTestConfig;

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
