const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Use BDT (UTC+6) for date consistency
    const nowUtc = new Date();
    const bdtOffset = 6 * 60 * 60 * 1000;
    const todayDate = new Date(nowUtc.getTime() + bdtOffset);
    const today = todayDate.toISOString().split("T")[0];
    const month = todayDate.toLocaleDateString("bn-BD", { month: "long", timeZone: "Asia/Dhaka" });
    const day = todayDate.toLocaleDateString("bn-BD", { day: "numeric", timeZone: "Asia/Dhaka" });

    // Check existing content
    const existingRes = await fetch(`${supabaseUrl}/rest/v1/daily_content?date=eq.${today}&select=content_type`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    const existing = existingRes.ok ? await existingRes.json() : [];
    const existingTypes = existing.map((e: any) => e.content_type);

    const needed: string[] = [];
    if (!existingTypes.includes("on_this_day")) needed.push("on_this_day");
    if (!existingTypes.includes("horoscope")) needed.push("horoscope");
    if (!existingTypes.includes("quote")) needed.push("quote");

    if (needed.length === 0) {
      return new Response(JSON.stringify({ message: "All content exists for today" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: string[] = [];

    for (const type of needed) {
      let prompt = "";
      if (type === "on_this_day") {
        prompt = `আজ ${day} ${month}। আজকের এই দিনে ঘটে যাওয়া ৫টি উল্লেখযোগ্য ঐতিহাসিক ঘটনা বাংলায় লেখো। প্রতিটি ঘটনার জন্য year (সাল সংখ্যায়) এবং event (ঘটনার সংক্ষিপ্ত বর্ণনা) দাও।`;
      } else if (type === "horoscope") {
        prompt = `আজ ${day} ${month} এর জন্য বাংলায় ১২টি রাশিফল লেখো। রাশিগুলো: মেষ (♈), বৃষ (♉), মিথুন (♊), কর্কট (♋), সিংহ (♌), কন্যা (♍), তুলা (♎), বৃশ্চিক (♏), ধনু (♐), মকর (♑), কুম্ভ (♒), মীন (♓)। প্রতিটির জন্য name, symbol, prediction দাও।`;
      } else {
        prompt = `আজকের জন্য একটি বিখ্যাত অনুপ্রেরণামূলক উক্তি বাংলায় দাও। text (উক্তিটি) এবং author (লেখকের নাম) দাও। প্রতিদিন ভিন্ন উক্তি দাও।`;
      }

      const toolName = type === "on_this_day" ? "return_events" : type === "horoscope" ? "return_horoscopes" : "return_quote";
      const toolParams = type === "on_this_day"
        ? { type: "object", properties: { events: { type: "array", items: { type: "object", properties: { year: { type: "string" }, event: { type: "string" } }, required: ["year", "event"] } } }, required: ["events"] }
        : type === "horoscope"
        ? { type: "object", properties: { signs: { type: "array", items: { type: "object", properties: { name: { type: "string" }, symbol: { type: "string" }, prediction: { type: "string" } }, required: ["name", "symbol", "prediction"] } } }, required: ["signs"] }
        : { type: "object", properties: { text: { type: "string" }, author: { type: "string" } }, required: ["text", "author"] };

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "তুমি একজন বাংলা কন্টেন্ট জেনারেটর। সবসময় বাংলায় উত্তর দাও। প্রতিদিন আলাদা ও অনন্য কন্টেন্ট তৈরি করো।" },
              { role: "user", content: prompt },
            ],
            tools: [{ type: "function", function: { name: toolName, description: "Return structured data", parameters: toolParams } }],
            tool_choice: { type: "function", function: { name: toolName } },
          }),
        });

        if (!response.ok) {
          console.error(`AI error for ${type}:`, response.status);
          continue;
        }

        const aiData = await response.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) { console.error(`No tool call for ${type}`); continue; }

        const parsed = JSON.parse(toolCall.function.arguments);

        // Upsert via REST API
        const upsertRes = await fetch(`${supabaseUrl}/rest/v1/daily_content`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({ content_type: type, date: today, data: parsed }),
        });

        if (!upsertRes.ok) {
          console.error(`Insert error for ${type}:`, await upsertRes.text());
        } else {
          results.push(type);
        }
      } catch (e) {
        console.error(`Error generating ${type}:`, e);
      }
    }

    return new Response(JSON.stringify({ generated: results, date: today }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-daily-content error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
