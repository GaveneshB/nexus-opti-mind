/**
 * Initialize Detected Vampires Collection
 * 
 * This function seeds the detected_vampires collection in Firestore
 * with initial vampire server data if the collection is empty.
 */

import { collection, doc, setDoc, getDocs, query } from "firebase/firestore";
import { db } from "./firebase";
import { vampireServersData } from "./firestore-collections";

export async function initializeVampireDatabase() {
  if (!db) {
    console.warn("[InitVampire] Firebase not initialized");
    return { success: false, message: "Firebase not configured" };
  }

  try {
    console.log("[InitVampire] Checking detected_vampires collection...");

    // Check if collection already has data
    const vampiresRef = collection(db, "detected_vampires");
    const q = query(vampiresRef);
    const snapshot = await getDocs(q);

    if (snapshot.size > 0) {
      console.log(`[InitVampire] Collection already has ${snapshot.size} documents`);
      return { success: true, message: `Collection already initialized with ${snapshot.size} documents` };
    }

    console.log("[InitVampire] Seeding detected_vampires collection...");

    // Seed initial vampire data
    let count = 0;
    for (const [id, data] of Object.entries(vampireServersData)) {
      const vampireRef = doc(db, "detected_vampires", id);
      
      // Convert Timestamps if needed
      const firebaseData = {
        ...data,
        flagged: data.flagged || true,
        detectedAt: new Date(),
        lastUpdated: new Date(),
      };

      await setDoc(vampireRef, firebaseData, { merge: true });
      count++;
      console.log(`[InitVampire] Seeded vampire: ${id}`);
    }

    console.log(`[InitVampire] ✅ Successfully seeded ${count} vampire records`);
    return { success: true, count, message: `Seeded ${count} vampire records` };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[InitVampire] ❌ Error seeding collection:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
