import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("====================================================");
  console.log("        NEXYRA AI CHAT & SYSTEM VERIFICATION        ");
  console.log("====================================================\n");

  let passed = 0;
  let failed = 0;

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.ok && data.status === "healthy") {
      console.log("✅ 1. Health Check passed:", data.service);
      passed++;
    } else {
      throw new Error(`Status not healthy: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 1. Health Check failed:", e.message);
    failed++;
  }

  // 2. Demo User Login for JWT Token
  let token = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/demo`, { method: "POST" });
    const data = await res.json();
    if (res.ok && data.token) {
      token = data.token;
      console.log("✅ 2. Demo Authentication passed (User:", data.user.email, ")");
      passed++;
    } else {
      throw new Error("No token received");
    }
  } catch (e) {
    console.error("❌ 2. Demo Authentication failed:", e.message);
    failed++;
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // 3. Test Greeting Query via POST /api/ai/chat
  try {
    console.log("\nTesting: 'Hello' via POST /api/ai/chat...");
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: "Hello" })
    });
    const data = await res.json();
    if (res.ok && data.success && (data.message || data.reply)) {
      if (data.model === "NEXYRA AI") {
        console.log("✅ 3. 'Hello' query passed with verified branding: NEXYRA AI");
      } else {
        console.log(`⚠️ 3. 'Hello' query passed (model: ${data.model})`);
      }
      console.log("   Snippet:", (data.message || data.reply).slice(0, 120) + "...\n");
      passed++;
    } else {
      throw new Error(`API error: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 3. 'Hello' query failed:", e.message);
    failed++;
  }

  // 4. Test Assignment Grounding: "What assignments do I have?"
  try {
    console.log("Testing: 'What assignments do I have?' via POST /api/ai/chat...");
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: "What assignments do I have?" })
    });
    const data = await res.json();
    const reply = data.message || data.reply;
    if (res.ok && data.success && reply) {
      console.log("✅ 4. 'What assignments do I have?' passed.");
      console.log("   Branded Model:", data.model);
      console.log("   Snippet:", reply.slice(0, 180) + "...\n");
      passed++;
    } else {
      throw new Error(`Grounding test failed: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 4. Grounding query failed:", e.message);
    failed++;
  }

  // 5. Test Priority Recommendation: "What should I complete first?"
  try {
    console.log("Testing: 'What should I complete first?' via POST /api/ai/chat...");
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: "What should I complete first?" })
    });
    const data = await res.json();
    const reply = data.message || data.reply;
    if (res.ok && data.success && reply) {
      console.log("✅ 5. 'What should I complete first?' passed.");
      console.log("   Branded Model:", data.model);
      console.log("   Snippet:", reply.slice(0, 180) + "...\n");
      passed++;
    } else {
      throw new Error(`Priority recommendation test failed: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 5. Priority recommendation failed:", e.message);
    failed++;
  }

  // 6. Test Academic Concept Explanation: "Explain Dijkstra algorithm"
  try {
    console.log("Testing: 'Explain Dijkstra algorithm' via POST /api/ai/chat...");
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: "Explain Dijkstra algorithm" })
    });
    const data = await res.json();
    const reply = data.message || data.reply;
    if (res.ok && data.success && reply) {
      console.log("✅ 6. 'Explain Dijkstra algorithm' passed.");
      console.log("   Branded Model:", data.model);
      console.log("   Snippet:", reply.slice(0, 180) + "...\n");
      passed++;
    } else {
      throw new Error(`Explanation test failed: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 6. Explanation query failed:", e.message);
    failed++;
  }

  // 7. Backward Compatibility: POST /api/chat/message
  try {
    console.log("Testing backward compatibility: POST /api/chat/message...");
    const res = await fetch(`${BASE_URL}/chat/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: "Explain my DSA assignment" })
    });
    const data = await res.json();
    const reply = data.message || data.reply;
    if (res.ok && data.success && reply) {
      console.log("✅ 7. Backward compatibility POST /api/chat/message passed.");
      console.log("   Branded Model:", data.model);
      console.log("   Snippet:", reply.slice(0, 180) + "...\n");
      passed++;
    } else {
      throw new Error(`Compatibility failed: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 7. Backward compatibility failed:", e.message);
    failed++;
  }

  // 8. Image Generation Detection
  try {
    console.log("Testing: 'Generate an image of the solar system'...");
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: "Generate an image of the solar system" })
    });
    const data = await res.json();
    if (res.ok && data.success && data.imageUrl) {
      console.log("✅ 8. Image generation prompt detection passed.");
      console.log("   Branded Model:", data.model);
      console.log("   Image URL:", data.imageUrl.slice(0, 70) + "...\n");
      passed++;
    } else {
      throw new Error(`Image generation failed: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 8. Image generation test failed:", e.message);
    failed++;
  }

  // 9. History Retrieval
  try {
    console.log("Testing: GET /api/ai/chat/history...");
    const res = await fetch(`${BASE_URL}/ai/chat/history`, { headers });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.messages)) {
      console.log(`✅ 9. History retrieval passed. Total stored messages: ${data.messages.length}\n`);
      passed++;
    } else {
      throw new Error(`History retrieval failed: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.error("❌ 9. History retrieval failed:", e.message);
    failed++;
  }

  console.log("====================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
