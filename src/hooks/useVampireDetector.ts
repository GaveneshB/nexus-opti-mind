import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
export interface ServerRack {
  id: string;
  power: number;
  cpu: number;
  baselinePower: number;
  baselineCpu: number;
  vampireScore: number;
  isVampire: boolean;
  dailyCost: number;
  uptime: string;
  history: Array<{ power: number; cpu: number }>;
  lastUpdated?: Timestamp | null;
}
 
export interface VampireEvent {
  id: string;
  rackId: string;
  score: number;
  power: number;
  cpu: number;
  flagged: boolean;
  detectedAt: Timestamp | null;
}
 
// ─── Isolation Forest ─────────────────────────────────────────────────────────
 
class IsolationForestDetector {
  private numTrees = 10;
  private sampleSize = 256;
  private maxDepth = 16;
 
  private computePathLength(
    data: Array<[number, number]>,
    point: [number, number],
    maxDepth: number
  ): number {
    if (data.length === 0 || maxDepth === 0) return 0;
    const featureIndex = Math.floor(Math.random() * 2);
    const values = data.map((d) => d[featureIndex]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    if (minVal === maxVal) return maxDepth;
    const splitPoint = minVal + Math.random() * (maxVal - minVal);
    if (point[featureIndex] < splitPoint) {
      return 1 + this.computePathLength(
        data.filter((d) => d[featureIndex] < splitPoint),
        point,
        maxDepth - 1
      );
    } else {
      return 1 + this.computePathLength(
        data.filter((d) => d[featureIndex] >= splitPoint),
        point,
        maxDepth - 1
      );
    }
  }
 
  computeAnomalyScore(
    trainingData: Array<[number, number]>,
    point: [number, number]
  ): number {
    if (trainingData.length < 2) return 0;
    let totalPathLength = 0;
    for (let i = 0; i < this.numTrees; i++) {
      const sample: Array<[number, number]> = [];
      const maxSample = Math.min(this.sampleSize, trainingData.length);
      for (let j = 0; j < maxSample; j++) {
        sample.push(trainingData[Math.floor(Math.random() * trainingData.length)]);
      }
      totalPathLength += this.computePathLength(sample, point, this.maxDepth);
    }
    const avgPathLength = totalPathLength / this.numTrees;
    const c = Math.log(this.sampleSize) + 0.5772156649;
    return Math.min(100, Math.round(Math.pow(2, -avgPathLength / c) * 100));
  }
}
 
// ─── Initial rack factory ─────────────────────────────────────────────────────
 
const makeInitialRacks = (): ServerRack[] =>
  Array.from({ length: 8 }, (_, i) => ({
    id: `RACK-${String(i + 1).padStart(2, "0")}`,
    power: 200 + Math.random() * 100,
    cpu: 5 + Math.random() * 15,
    baselinePower: 220 + i * 10,
    baselineCpu: 8 + Math.random() * 6,
    vampireScore: 0,
    isVampire: false,
    dailyCost: 0,
    uptime: `${Math.floor(Math.random() * 365)}d ${Math.floor(Math.random() * 24)}h`,
    history: Array.from({ length: 32 }, () => ({
      power: 200 + Math.random() * 100,
      cpu: 5 + Math.random() * 15,
    })),
  }));
 
// ─── Hook ─────────────────────────────────────────────────────────────────────
 
export const useVampireDetector = () => {
  const [racks, setRacks] = useState<ServerRack[]>(makeInitialRacks);
  const [isRunning, setIsRunning] = useState(false);
  const [tickSpeed, setTickSpeed] = useState(1000);
  const [sensitivity, setSensitivity] = useState(50);
  const [simulationTime, setSimulationTime] = useState(0);
  const [firestoreConnected, setFirestoreConnected] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
 
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectorRef = useRef(new IsolationForestDetector());
  // Throttle Firestore writes — only write every N ticks to stay within Spark limits
  const writeCountRef = useRef(0);
  const WRITE_EVERY_N_TICKS = 3;
 
  // ── Subscribe to Firestore rack documents ──────────────────────────────────
  useEffect(() => {
    // Guard: Only subscribe if Firebase is initialized
    if (!db) {
      console.warn("[VampireDetector] Firebase not initialized - using local data only");
      setFirestoreConnected(false);
      setSyncError("Firebase not configured");
      return;
    }

    try {
      const q = query(collection(db, "server_racks"), orderBy("id"), limit(8));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreRacks = snapshot.docs.map((d) => ({
              ...d.data(),
              id: d.id,
              // restore history array (Firestore strips typed arrays safely)
              history: d.data().history || [],
            })) as ServerRack[];
            // Merge Firestore state into local racks (keeps history intact)
            setRacks((prev) =>
              prev.map((local) => {
                const remote = firestoreRacks.find((r) => r.id === local.id);
                return remote
                  ? { ...local, ...remote, history: local.history }
                  : local;
              })
            );
            setFirestoreConnected(true);
          } else {
            // First run — seed the collection
            setFirestoreConnected(true);
          }
          setSyncError(null);
        },
        (err) => {
          setSyncError(err.message);
          setFirestoreConnected(false);
          console.error("[VampireDetector] Firestore subscription error:", err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[VampireDetector] Failed to set up Firestore listener:", errorMsg);
      setSyncError(errorMsg);
      setFirestoreConnected(false);
    }
  }, []);
 
  // ── Write a rack update to Firestore ──────────────────────────────────────
  const syncRackToFirestore = useCallback(async (rack: ServerRack) => {
    // Guard: Only sync if Firebase is initialized
    if (!db) {
      return;
    }

      await setDoc(
        ref,
        {
          id: rack.id,
          power: rack.power,
          cpu: rack.cpu,
          baselinePower: rack.baselinePower,
          baselineCpu: rack.baselineCpu,
          vampireScore: rack.vampireScore,
          isVampire: rack.isVampire,
          dailyCost: rack.dailyCost,
          uptime: rack.uptime,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
 
      // If newly flagged as vampire — write to detected_vampires collection
      if (rack.isVampire) {
        const eventRef = doc(db, "detected_vampires", `${rack.id}_latest`);
        await setDoc(eventRef, {
          rackId: rack.id,
          score: rack.vampireScore,
          power: rack.power,
          cpu: rack.cpu,
          flagged: true,
          detectedAt: serverTimestamp(),
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setSyncError(errorMsg);
      console.error("[VampireDetector] Firestore write error:", errorMsg);
    }
  }, []);
 
  // ── Simulation tick ────────────────────────────────────────────────────────
  const simulationTick = useCallback(() => {
    writeCountRef.current += 1;
    const shouldWrite = writeCountRef.current % WRITE_EVERY_N_TICKS === 0;
 
    setRacks((prevRacks) =>
      prevRacks.map((rack) => {
        const becomesVampire = !rack.isVampire && Math.random() < 0.01;
        const recovers = rack.isVampire && Math.random() < 0.005;
 
        let newPower = rack.power;
        let newCpu = rack.cpu;
        let newIsVampire = rack.isVampire;
 
        if (becomesVampire) {
          newIsVampire = true;
          newPower = 400 + Math.random() * 200;
          newCpu = Math.random() * 2;
        } else if (recovers) {
          newIsVampire = false;
          newPower = rack.baselinePower + (Math.random() - 0.5) * 60;
          newCpu = rack.baselineCpu + (Math.random() - 0.5) * 8;
        } else if (newIsVampire) {
          newPower = 400 + Math.random() * 200;
          newCpu = Math.random() * 2;
        } else {
          newPower = rack.baselinePower + (Math.random() - 0.5) * 60;
          newCpu = Math.max(0, rack.baselineCpu + (Math.random() - 0.5) * 8);
        }
 
        // Update sliding history window
        const newHistory = [...rack.history, { power: newPower, cpu: newCpu }];
        if (newHistory.length > 64) newHistory.shift();
 
        // Run Isolation Forest
        const trainingData: Array<[number, number]> = newHistory.map((h) => [
          h.power,
          h.cpu,
        ]);
        const baseScore = detectorRef.current.computeAnomalyScore(
          trainingData,
          [newPower, newCpu]
        );
        const vampireScore = Math.min(
          100,
          Math.round(baseScore * (sensitivity / 50))
        );
 
        const dailyCost = Math.round(newPower * 24 * 0.0008 * 10) / 10;
 
        const updatedRack: ServerRack = {
          ...rack,
          power: Math.round(newPower),
          cpu: Math.round(newCpu * 10) / 10,
          vampireScore,
          isVampire: newIsVampire,
          dailyCost,
          history: newHistory,
        };
 
        // Throttled Firestore write
        if (shouldWrite) {
          syncRackToFirestore(updatedRack);
        }
 
        return updatedRack;
      })
    );
 
    setSimulationTime((t) => t + 1);
  }, [sensitivity, syncRackToFirestore]);
 
  // ── Interval control ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(simulationTick, tickSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tickSpeed, simulationTick]);
 
  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setIsRunning(false);
    setSimulationTime(0);
    setRacks(makeInitialRacks());
  }, []);
 
  // ── Derived values ─────────────────────────────────────────────────────────
  const vampireCount = racks.filter((r) => r.isVampire).length;
  const totalDrain = racks.reduce((s, r) => s + r.dailyCost, 0);
  const avgScore = Math.round(
    racks.reduce((s, r) => s + r.vampireScore, 0) / racks.length
  );
  const avgPower = Math.round(
    racks.reduce((s, r) => s + r.power, 0) / racks.length
  );
  const vampireDrain = racks
    .filter((r) => r.isVampire)
    .reduce((s, r) => s + r.dailyCost, 0);
 
  return {
    racks,
    isRunning,
    setIsRunning,
    tickSpeed,
    setTickSpeed,
    sensitivity,
    setSensitivity,
    simulationTime,
    reset,
    vampireCount,
    totalDrain,
    avgScore,
    avgPower,
    vampireDrain,
    firestoreConnected,
    syncError,
  };
};