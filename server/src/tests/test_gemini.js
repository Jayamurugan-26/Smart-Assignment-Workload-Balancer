import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";

async function testSDK() {
  console.log("Testing @google/genai SDK...");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: "Say hello in one word."
    });
    console.log("✅ @google/genai result:", res.output_text);
    return;
  } catch (err) {
    console.log("❌ @google/genai error:", err.message);
  }

  console.log("\nTesting @google/generative-ai SDK...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent("Say hello in one word.");
    console.log("✅ @google/generative-ai (1.5-flash) result:", res.response.text());
  } catch (err) {
    console.log("❌ @google/generative-ai (1.5-flash) error:", err.message);
  }
}

testSDK();
