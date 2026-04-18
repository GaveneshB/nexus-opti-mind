import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import collectionsData, { rackMetricsData } from "./firestore-collections";

const seedCollection = async (collectionName: string, dataObj: Record<string, Record<string, unknown>> | unknown[][]) => {
  const batch = writeBatch(db);
  let count = 0;

  if (Array.isArray(dataObj)) {
    // Array of tuples like racksData [id, data]
    for (const [id, data] of dataObj) {
      const docRef = doc(db, collectionName, id as string);
      batch.set(docRef, data as never);
      count++;
    }
  } else {
    // Object where key is docId
    for (const [id, data] of Object.entries(dataObj)) {
      const docRef = doc(db, collectionName, id);
      batch.set(docRef, data);
      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
  return count;
};

export const seedDatabase = async () => {
  console.log("Seeding Database...");
  
  try {
    const results = [];
    
    // 1. Organizations
    const orgsCount = await seedCollection("organizations", collectionsData.organizationsData);
    results.push(`Organizations seeded: ${orgsCount}`);

    // 2. Racks
    const racksCount = await seedCollection("racks", collectionsData.racksData);
    results.push(`Racks seeded: ${racksCount}`);

    // Rack Metrics - need to do this per rack
    let metricsCount = 0;
    for (const [rackId] of collectionsData.racksData) {
      const parentDocRef = doc(db, "racks", rackId as string);
      const metricsCollectionRef = collection(parentDocRef, "metrics");
      
      const rMetrics = rackMetricsData(rackId);
      const batch = writeBatch(db);
      for (const [id, data] of rMetrics) {
        batch.set(doc(metricsCollectionRef, id), data);
        metricsCount++;
      }
      await batch.commit();
    }
    results.push(`Rack metrics seeded: ${metricsCount}`);

    // 3. Vampire Servers
    const vampireCount = await seedCollection("vampireServers", collectionsData.vampireServersData);
    results.push(`Vampire servers seeded: ${vampireCount}`);

    // 4. Thermal Regrets
    const regretCount = await seedCollection("thermalRegrets", collectionsData.thermalRegretsData);
    results.push(`Thermal regrets seeded: ${regretCount}`);

    // 5. Workload Forecasts
    const forecastCount = await seedCollection("workloadForecasts", collectionsData.workloadForecastsData);
    results.push(`Workload forecasts seeded: ${forecastCount}`);

    // 6. Energy Genomes
    const genomesCount = await seedCollection("energyGenomes", collectionsData.energyGenomesData);
    results.push(`Energy genomes seeded: ${genomesCount}`);

    // 7. Energy Metrics
    const energyMetricsCount = await seedCollection("energyMetrics", collectionsData.energyMetricsData);
    results.push(`Energy metrics seeded: ${energyMetricsCount}`);

    // 8. Alerts
    const alertsCount = await seedCollection("alerts", collectionsData.alertsData);
    results.push(`Alerts seeded: ${alertsCount}`);

    // 9. Audit Logs
    const auditCount = await seedCollection("auditLogs", collectionsData.auditLogsData);
    results.push(`Audit logs seeded: ${auditCount}`);

    // 10. User Preferences
    const userPrefsCount = await seedCollection("userPreferences", collectionsData.userPreferencesData);
    results.push(`User preferences seeded: ${userPrefsCount}`);

    console.log("Database seeded successfully!\n", results.join("\n"));
    return { success: true, results };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error: String(error) };
  }
};
