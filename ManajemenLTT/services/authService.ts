import { storage } from "@/constants/MKKV";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { UserProfile } from "./User";
import { userService } from ".";
import { createHashSHA1 } from "@/utils/generator";
import { Platform } from "react-native";
import { showAlert } from "@/utils/alert";
import firebaseInstance from "./Firebase";



export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
