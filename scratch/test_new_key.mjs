
const key = "AIzaSyArh6zWJGwvF8d7_iIphtoqQ6IAWDxUb_M";
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

async function testKey() {
  try {
    const res = await fetch(`${url}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Respond with OK" }] }]
      }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Key Status: OK`);
      console.log(`Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`);
    } else {
      const err = await res.json();
      console.log(`Key Status: FAILED - ${res.status} ${err.error?.message || ''}`);
    }
  } catch (e) {
    console.log(`Key Status: ERROR - ${e.message}`);
  }
}

testKey();
