import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
  Query,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Hook to subscribe to real-time updates from a Firestore collection query
 */
export const useFirestoreQuery = <T extends DocumentData>(
  collectionName: string,
  constraints?: any[]
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const q = constraints
        ? query(collection(db, collectionName), ...constraints)
        : query(collection(db, collectionName));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(docs);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, constraints?.length]);

  return { data, loading, error };
};

/**
 * Hook to subscribe to a single document in real-time
 */
export const useFirestoreDoc = <T extends DocumentData>(
  collectionName: string,
  docId: string
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, docId);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...docSnap.data() } as T);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, docId]);

  return { data, loading, error };
};

/**
 * Hook to fetch rack metrics for the last N minutes
 */
export const useRackMetrics = (rackId: string, minutesBack: number = 60) => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!rackId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cutoff = new Date(Date.now() - minutesBack * 60 * 1000);
      const q = query(
        collection(db, "racks", rackId, "metrics"),
        where("recordedAt", ">=", cutoff)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort(
              (a, b) =>
                (a.recordedAt?.toDate?.() || 0) -
                (b.recordedAt?.toDate?.() || 0)
            );
          setMetrics(docs);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [rackId, minutesBack]);

  return { metrics, loading, error };
};

/**
 * Hook to get all detected vampire servers with real-time updates
 */
export const useVampireServers = () => {
  const [vampires, setVampires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, "detected_vampires"), where("flagged", "==", true));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setVampires(docs);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  return { vampires, loading, error };
};

/**
 * Hook to get thermal regrets (wasted cooling costs)
 */
export const useThermalRegrets = (hoursBack: number = 6) => {
  const [regrets, setRegrets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
      const q = query(
        collection(db, "thermal_regrets"),
        where("timestamp", ">=", cutoff)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRegrets(docs);
          const total = docs.reduce((sum, r) => sum + (r.regretAmount || 0), 0);
          setTotalCost(total);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [hoursBack]);

  return { regrets, totalCost, loading, error };
};
