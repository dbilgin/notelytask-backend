import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log("GitHub Access Token Function loaded!");

Deno.serve(async (req) => {
  const ORIGIN_URL = Deno.env.get("ORIGIN_URL");
  const requestOrigin = req.headers.get("origin");
  
  // Validate origin
  if (requestOrigin !== ORIGIN_URL) {
    return new Response(
      JSON.stringify({ error: "Forbidden: Invalid origin" }),
      { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  
  // CORS headers for specific origin
  const corsHeaders = {
    "Access-Control-Allow-Origin": ORIGIN_URL,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  const responseHeaders = new Headers({
    "Content-Type": "application/json",
    ...corsHeaders,
  });

  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get("client_id");
    const code = url.searchParams.get("code");

    const clientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");

    if (!clientId || !code) {
      return new Response(
        JSON.stringify({ error: "Missing client_id or code parameter" }),
        { status: 400, headers: responseHeaders }
      );
    }

    if (!clientSecret) {
      return new Response(
        JSON.stringify({ error: "GitHub client secret not configured" }),
        { status: 500, headers: responseHeaders }
      );
    }

    const githubResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          code: code,
          client_secret: clientSecret,
          redirect_uri: `${ORIGIN_URL}/github`,
        }),
      }
    );

    const githubData = await githubResponse.json();

    console.log("GitHub response:", githubData);

    if (!githubResponse.ok || githubData.error) {
      return new Response(JSON.stringify(githubData), {
        status: 400,
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify(githubData), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error processing GitHub OAuth:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: responseHeaders,
    });
  }
});
