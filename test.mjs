const key = "AIzaSyAkyrSHUKOUnB_z6h6FvVk38KfUY7H7KL8";
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
});
console.log(await r.json());
