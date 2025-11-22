import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Global error handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

// Health check endpoint
app.get("/make-server-6757d0ca/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/make-server-6757d0ca/generate-keywords", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { seeds, negatives } = body;
    
    console.log("Received generate-keywords request:", { seeds: seeds?.substring(0, 50), negatives: negatives?.substring(0, 50) });
    
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return c.json({ error: "Server misconfiguration: API Key missing" }, 500);
    }

    if (!seeds) {
        console.error("Seeds parameter is missing");
        return c.json({ error: "Seeds are required" }, 400);
    }

    const prompt = `
      Act as a Google Ads expert. Generate 15-20 relevant keywords based on these Seed Keywords:
      ${seeds}

      STRICTLY EXCLUDE any keywords related to these Negative Keywords:
      ${negatives || ''}

      Return a pure JSON array of objects (no markdown, no backticks) with these keys:
      - id: string (unique id like 'k-1', 'k-2')
      - text: string (the keyword)
      - volume: string (e.g., 'High', 'Medium', 'Low', or range '1K-10K')
      - cpc: string (e.g., '$1.50')
      - type: string ('Broad', 'Phrase', or 'Exact')
      - competition: string ('High', 'Medium', 'Low')
    `;

    console.log("Calling Gemini API...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("Gemini API Error:", errData);
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data).substring(0, 200));
    
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      console.error("No content generated from Gemini");
      throw new Error("No content generated");
    }

    console.log("Gemini text response (first 200 chars):", textResponse.substring(0, 200));

    // Clean potential markdown
    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("Cleaned JSON (first 200 chars):", cleanJson.substring(0, 200));
    
    const keywords = JSON.parse(cleanJson);
    console.log("Successfully parsed keywords. Count:", keywords.length);
    console.log("Sample keyword:", keywords[0]);

    return c.json({ keywords });
  } catch (err) {
    console.error("Generate Keywords Error:", err);
    console.error("Error stack:", err.stack);
    return c.json({ error: err.message || "Failed to generate keywords" }, 500);
  }
});

// Generate negative keywords with AI using website URL analysis
app.post("/make-server-6757d0ca/ai/generate-negative-keywords", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { url, coreKeywords, userGoal } = body;
    
    console.log("Received generate-negative-keywords request:", { url, coreKeywords, userGoal });
    
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return c.json({ error: "Server misconfiguration: API Key missing" }, 500);
    }

    if (!url || !coreKeywords || !userGoal) {
        console.error("Required parameters missing");
        return c.json({ error: "URL, core keywords, and user goal are required" }, 400);
    }

    const prompt = `
      Act as a Google Ads expert specializing in negative keyword research.
      
      Website URL: ${url}
      Core Keywords: ${coreKeywords}
      User Goal: ${userGoal}
      
      Based on the URL provided, imagine you are analyzing this website to understand:
      1. What business/service it provides
      2. What the call-to-action (CTA) is
      3. What type of customers they want to attract
      4. What searches would waste their ad budget
      
      Generate a comprehensive list of 50-100 negative keywords that would:
      - Prevent ads from showing for irrelevant searches
      - Filter out job seekers, DIY searchers, or free/cheap seekers (if not appropriate)
      - Exclude competitor brand names
      - Block informational queries if the goal is transactional
      - Prevent wasted spend based on the user goal (${userGoal})
      
      Consider common negative keyword categories:
      - Employment-related (job, career, salary, resume, hiring)
      - Educational (free, how to, tutorial, DIY, course, training)
      - Competitor brands
      - Low-intent (review, comparison, vs, alternative)
      - Price-focused (cheap, free, discount) if not appropriate for the business
      - Informational (what is, definition, meaning)
      - Wrong product/service type
      
      Return a pure JSON array of objects (no markdown, no backticks) with these keys:
      - keyword: string (the negative keyword without brackets)
      - reason: string (why this should be excluded)
      - category: string (category like "Employment", "Educational", "Low Intent", "Competitor", etc.)
      
      Important: Return ONLY the JSON array, no other text or formatting.
    `;

    console.log("Calling Gemini API for negative keywords...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("Gemini API Error:", errData);
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("No content generated");
    }

    // Clean potential markdown
    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const keywords = JSON.parse(cleanJson);

    console.log("Successfully generated negative keywords:", keywords.length);
    return c.json({ keywords });
  } catch (err) {
    console.error("Generate Negative Keywords Error:", err);
    return c.json({ error: err.message || "Failed to generate negative keywords" }, 500);
  }
});

// Generate AI-optimized ads
app.post("/make-server-6757d0ca/generate-ads", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { keywords, adType, count, groupName } = body;
    
    console.log("Received generate-ads request:", { keywords, adType, count, groupName });
    
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return c.json({ error: "Server misconfiguration: API Key missing" }, 500);
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      console.error("Keywords parameter is missing or invalid");
      return c.json({ error: "Keywords array is required" }, 400);
    }

    if (!adType || !['RSA', 'DKI', 'CallOnly'].includes(adType)) {
      console.error("Invalid ad type");
      return c.json({ error: "Valid adType is required (RSA, DKI, or CallOnly)" }, 400);
    }

    const keywordList = keywords.join(', ');
    
    let prompt = '';
    
    if (adType === 'RSA') {
      prompt = `You are a Google Ads expert specializing in creating high-performing Responsive Search Ads (RSA) that maximize Ad Rank and Quality Score.

Create ${count || 5} unique Responsive Search Ad variations for these keywords: ${keywordList}

Each ad should be optimized for maximum Google Ad Rank with:
- Compelling, click-worthy headlines that include keywords naturally
- Clear value propositions and calls-to-action
- Description text that reinforces the headlines
- Excellent keyword relevance
- Strong expected CTR signals

RSA Requirements:
- Headlines should be 30 characters or less
- Descriptions should be 90 characters or less
- Include the main keyword in at least one headline
- Use power words and urgency when appropriate
- Add path1 and path2 (each 15 characters max) that are relevant to keywords

Return a pure JSON array (no markdown, no backticks) with these exact keys for each ad:
{
  "headline1": "string",
  "headline2": "string", 
  "headline3": "string",
  "headline4": "string (optional)",
  "headline5": "string (optional)",
  "description1": "string",
  "description2": "string",
  "path1": "string",
  "path2": "string",
  "finalUrl": "https://www.example.com"
}

Important: Return ONLY the JSON array, no other text or formatting.`;
    } else if (adType === 'DKI') {
      prompt = `You are a Google Ads expert specializing in Dynamic Keyword Insertion (DKI) ads that maximize relevance and Quality Score.

Create ${count || 5} unique DKI ad variations for these keywords: ${keywordList}

DKI ads should:
- Use {KeyWord:DefaultText} syntax to dynamically insert the user's search query
- Have compelling default text that makes sense if keyword insertion fails
- Maximize relevance and expected CTR
- Include the keyword placeholder in headlines and descriptions strategically
- Work well across all the provided keywords

Each DKI ad headline/description should be 30/90 characters or less including the DKI syntax.

Return a pure JSON array (no markdown, no backticks) with these exact keys for each ad:
{
  "headline1": "string with {KeyWord:default}",
  "headline2": "string with {KeyWord:default}",
  "headline3": "string with {KeyWord:default}",
  "description1": "string with {KeyWord:default}",
  "description2": "string with {KeyWord:default}",
  "path1": "string",
  "path2": "string",
  "finalUrl": "https://www.example.com"
}

Important: Return ONLY the JSON array, no other text or formatting.`;
    } else if (adType === 'CallOnly') {
      prompt = `You are a Google Ads expert specializing in Call-Only ads that drive phone calls and maximize conversion rates.

Create ${count || 5} unique Call-Only ad variations for these keywords: ${keywordList}

Call-Only ads should:
- Encourage immediate phone calls with strong CTAs
- Highlight availability (24/7, speak to expert, etc.)
- Create urgency and trust
- Be optimized for mobile users
- Include compelling reasons to call NOW

Requirements:
- Headline 1: 30 characters or less
- Headline 2: 30 characters or less  
- Descriptions: 90 characters or less
- Focus on driving calls, not clicks to website

Return a pure JSON array (no markdown, no backticks) with these exact keys for each ad:
{
  "headline1": "string",
  "headline2": "string",
  "description1": "string",
  "description2": "string",
  "phoneNumber": "+1-800-123-4567",
  "businessName": "Your Business Name"
}

Important: Return ONLY the JSON array, no other text or formatting.`;
    }

    console.log("Calling Gemini API for ad generation...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return c.json({ error: `Gemini API error: ${errorText}` }, response.status);
    }

    const data = await response.json();
    console.log("Gemini API response received");

    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      console.error("No text content in Gemini response");
      return c.json({ error: "Invalid response from AI" }, 500);
    }

    console.log("Raw AI response:", textContent.substring(0, 200));

    // Parse the JSON from the response (handle markdown code blocks)
    let cleanedText = textContent.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    let ads;
    try {
      ads = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Attempted to parse:", cleanedText);
      return c.json({ error: "Failed to parse AI response as JSON" }, 500);
    }

    if (!Array.isArray(ads)) {
      console.error("Response is not an array");
      return c.json({ error: "Invalid response format from AI" }, 500);
    }

    console.log(`✅ Successfully generated ${ads.length} ${adType} ads`);

    return c.json({ 
      ads,
      count: ads.length,
      adType,
      groupName
    });

  } catch (error: any) {
    console.error("Error in generate-ads endpoint:", error);
    return c.json({ error: error.message || "Failed to generate ads" }, 500);
  }
});

// --- History Endpoints ---

app.post("/make-server-6757d0ca/history/save", async (c) => {
  try {
    const body = await c.req.json();
    const { type, name, data } = body;
    
    const userId = "user-default"; 
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const entry = { id, userId, type, name, data, timestamp };
    const key = `history:${userId}:${id}`;
    
    await kv.set(key, entry);
    return c.json({ success: true, id });
  } catch (err) {
    console.error("History Save Error:", err);
    return c.json({ error: "Failed to save history" }, 500);
  }
});

app.get("/make-server-6757d0ca/history/list", async (c) => {
  try {
    const userId = "user-default"; 
    const prefix = `history:${userId}`;
    
    const entries = await kv.getByPrefix(prefix);
    const sorted = entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json({ history: sorted });
  } catch (err) {
    console.error("History List Error:", err);
    return c.json({ error: "Failed to fetch history" }, 500);
  }
});

app.post("/make-server-6757d0ca/history/delete", async (c) => {
    try {
        const { id } = await c.req.json();
        const userId = "user-default";
        await kv.del(`history:${userId}:${id}`);
        return c.json({ success: true });
    } catch (err) {
        console.error("History Delete Error:", err);
        return c.json({ error: "Failed to delete" }, 500);
    }
});

// --- Support Ticket Endpoints ---

app.post("/make-server-6757d0ca/tickets/create", async (c) => {
  try {
    const { subject, message, priority } = await c.req.json();
    const id = crypto.randomUUID();
    const userId = "user-default";
    const timestamp = new Date().toISOString();
    
    const ticket = { 
      id, 
      userId, 
      subject, 
      message, 
      priority, 
      status: 'Open', 
      timestamp 
    };
    
    await kv.set(`ticket:${userId}:${id}`, ticket);
    return c.json({ success: true, ticket });
  } catch (err) {
    console.error("Ticket Create Error:", err);
    return c.json({ error: "Failed to create ticket" }, 500);
  }
});

app.get("/make-server-6757d0ca/tickets/list", async (c) => {
  try {
    const userId = "user-default";
    const tickets = await kv.getByPrefix(`ticket:${userId}`);
    const sorted = tickets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ tickets: sorted });
  } catch (err) {
    console.error("Tickets List Error:", err);
    return c.json({ error: "Failed to fetch tickets" }, 500);
  }
});

// --- Billing Endpoints (Mock) ---

app.get("/make-server-6757d0ca/billing/info", (c) => {
  return c.json({
    plan: "Free",
    nextBillingDate: "2025-12-01",
    invoices: [
        { id: "inv_1", date: "2025-11-01", amount: "$0.00", status: "Paid" },
        { id: "inv_2", date: "2025-10-01", amount: "$0.00", status: "Paid" }
    ]
  });
});

app.post("/make-server-6757d0ca/billing/subscribe", async (c) => {
    return c.json({ success: true, message: "Redirecting to payment provider..." });
});

Deno.serve(app.fetch);