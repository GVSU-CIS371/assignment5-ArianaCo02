import { defineStore } from "pinia";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  Unsubscribe,
  getFirestore,
} from "firebase/firestore";
import db from "../firebase";

// Types
export interface BeverageItem {
  id: string;
  name: string;
  color: string;
}

export interface BeverageType {
  id: string;
  name: string;
  base: BeverageItem;
  creamer: BeverageItem;
  syrup: BeverageItem;
  createdAt: number;
  userId: string;
}

export interface User {
  uid: string;
  email: string | null;
}

export const useBeverageStore = defineStore("beverageStore", {
  state: () => ({
    user: null as User | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,

    
    currentBase: null as BeverageItem | null,
    currentCreamer: null as BeverageItem | null,
    currentSyrup: null as BeverageItem | null,

    
    unsubBeverages: null as Unsubscribe | null,
  }),

  actions: {
    async setUser(user: User | null) {
      console.log("Setting user:", user?.uid ?? "none");

     
      this.user = user;

     
      if (this.unsubBeverages) {
        this.unsubBeverages();
        this.unsubBeverages = null;
      }

     
      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }

      
      const userBevColl = collection(db, "users", user.uid, "beverages");

      this.unsubBeverages = onSnapshot(userBevColl, (snapshot) => {
        const data: BeverageType[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as BeverageType),
        }));

        this.beverages = data;

        
        if (data.length > 0) {
          this.currentBeverage = data[data.length - 1];
        }
      });

      console.log("Firestore listener started for", user.uid);
    },

    
    async makeBeverage(name: string) {
      // 1. User logged in?
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }

      
      if (!name || !this.currentBase || !this.currentCreamer || !this.currentSyrup) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      const beverageId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const beverage: BeverageType = {
        id: beverageId,
        name,
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
        createdAt: Date.now(),
        userId: this.user.uid,
      };

     
      const userBevDoc = doc(
        db,
        "users",
        this.user.uid,
        "beverages",
        beverageId
      );

      await setDoc(userBevDoc, beverage);

      
      this.beverages.push(beverage);
      this.currentBeverage = beverage;

      return `Beverage "${name}" made successfully!`;
    },
  },
});
