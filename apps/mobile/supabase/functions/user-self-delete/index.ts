// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

console.log(`Function "user-self-deletion" up and running!`);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a single admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get("Authorization")?.split(" ")[1];
    if (!authHeader) throw new Error("No authorization header");

    // Get the user using the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(authHeader);
    if (userError) throw userError;
    if (!user) throw new Error("No user found");

    // Get and verify profile exists
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user.id);

    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) throw new Error("No profile found");

    // Delete feedback first
    const { error: feedbackError } = await supabaseAdmin
      .from("feedback")
      .delete()
      .eq("user_id", user.id);

    if (feedbackError) throw feedbackError;

    // Delete profile
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileDeleteError) throw profileDeleteError;

    console.log(`Profile deleted for user: ${user.id}`);

    // Delete auth user
    const { error: deletionError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deletionError) throw deletionError;

    console.log(`User deleted: ${user.id}`);

    return new Response(
      JSON.stringify({
        message: "User account and related data deleted successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting user:", error.message);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
