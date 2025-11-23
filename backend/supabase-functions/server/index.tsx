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

// ============================================
// SUPER ADMIN ENDPOINTS
// ============================================

// Helper to verify super admin
async function verifySuperAdmin(c: any): Promise<{ valid: boolean; userId?: string }> {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { valid: false };
    }

    const token = authHeader.substring(7);
    // In production, verify JWT token with Supabase
    // For now, we'll use a simple check - in production use Supabase Admin API
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing");
      return { valid: false };
    }

    // Verify token and check user role
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { valid: false };
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "superadmin") {
      return { valid: false };
    }

    return { valid: true, userId: user.id };
  } catch (err) {
    console.error("Super admin verification error:", err);
    return { valid: false };
  }
}

// Get all users (Super Admin only)
app.get("/make-server-6757d0ca/admin/users", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { search, page = "1", limit = "50" } = c.req.query();
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }

    return c.json({
      users: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (err) {
    console.error("Get users error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user by ID
app.get("/make-server-6757d0ca/admin/users/:id", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("id");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: data });
  } catch (err) {
    console.error("Get user error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update user
app.put("/make-server-6757d0ca/admin/users/:id", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("id");
    const body = await c.req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("users")
      .update(body)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }

    // Log audit
    await supabase.from("audit_logs").insert({
      user_id: auth.userId,
      action: "update_user",
      resource_type: "user",
      resource_id: userId,
      metadata: { changes: body }
    });

    return c.json({ user: data });
  } catch (err) {
    console.error("Update user error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete user
app.delete("/make-server-6757d0ca/admin/users/:id", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param("id");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) {
      console.error("Error deleting user:", error);
      return c.json({ error: "Failed to delete user" }, 500);
    }

    // Log audit
    await supabase.from("audit_logs").insert({
      user_id: auth.userId,
      action: "delete_user",
      resource_type: "user",
      resource_id: userId
    });

    return c.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get system overview stats
app.get("/make-server-6757d0ca/admin/overview", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: recentSignups } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get system health
    const { data: healthData } = await supabase
      .from("system_health")
      .select("*")
      .order("last_check_at", { ascending: false })
      .limit(10);

    return c.json({
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      recentSignups: recentSignups || 0,
      systemHealth: healthData || []
    });
  } catch (err) {
    console.error("Get overview error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get audit logs
app.get("/make-server-6757d0ca/admin/audit-logs", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { page = "1", limit = "50", action, userId } = c.req.query();
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from("audit_logs")
      .select("*, users(email, full_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (action) {
      query = query.eq("action", action);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching audit logs:", error);
      return c.json({ error: "Failed to fetch audit logs" }, 500);
    }

    return c.json({
      logs: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (err) {
    console.error("Get audit logs error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get billing/subscription stats
app.get("/make-server-6757d0ca/admin/billing/stats", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get subscription counts by plan
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("plan, status");

    const planDistribution: Record<string, number> = {};
    subscriptions?.forEach(sub => {
      const key = `${sub.plan}_${sub.status}`;
      planDistribution[key] = (planDistribution[key] || 0) + 1;
    });

    // Get recent transactions
    const { data: recentInvoices } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return c.json({
      planDistribution,
      recentTransactions: recentInvoices || []
    });
  } catch (err) {
    console.error("Get billing stats error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get usage metrics
app.get("/make-server-6757d0ca/admin/usage", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { metricType, period = "24h" } = c.req.query();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const periodStart = new Date();
    if (period === "24h") {
      periodStart.setHours(periodStart.getHours() - 24);
    } else if (period === "7d") {
      periodStart.setDate(periodStart.getDate() - 7);
    } else {
      periodStart.setDate(periodStart.getDate() - 30);
    }

    let query = supabase
      .from("usage_metrics")
      .select("*")
      .gte("period_start", periodStart.toISOString())
      .order("created_at", { ascending: false });

    if (metricType) {
      query = query.eq("metric_type", metricType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching usage metrics:", error);
      return c.json({ error: "Failed to fetch usage metrics" }, 500);
    }

    return c.json({ metrics: data || [] });
  } catch (err) {
    console.error("Get usage metrics error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get system health
app.get("/make-server-6757d0ca/admin/health", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("system_health")
      .select("*")
      .order("last_check_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching system health:", error);
      return c.json({ error: "Failed to fetch system health" }, 500);
    }

    return c.json({ health: data || [] });
  } catch (err) {
    console.error("Get system health error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Feature flags endpoints
app.get("/make-server-6757d0ca/admin/feature-flags", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feature flags:", error);
      return c.json({ error: "Failed to fetch feature flags" }, 500);
    }

    return c.json({ flags: data || [] });
  } catch (err) {
    console.error("Get feature flags error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/make-server-6757d0ca/admin/feature-flags", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("feature_flags")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Error creating feature flag:", error);
      return c.json({ error: "Failed to create feature flag" }, 500);
    }

    return c.json({ flag: data });
  } catch (err) {
    console.error("Create feature flag error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.put("/make-server-6757d0ca/admin/feature-flags/:id", async (c) => {
  try {
    const auth = await verifySuperAdmin(c);
    if (!auth.valid) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const flagId = c.req.param("id");
    const body = await c.req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("feature_flags")
      .update(body)
      .eq("id", flagId)
      .select()
      .single();

    if (error) {
      console.error("Error updating feature flag:", error);
      return c.json({ error: "Failed to update feature flag" }, 500);
    }

    return c.json({ flag: data });
  } catch (err) {
    console.error("Update feature flag error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);