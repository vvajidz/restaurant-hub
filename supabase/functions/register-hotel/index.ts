import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { hotelName, adminName, adminEmail, adminPassword, staffEmail, staffPassword } = await req.json();

    if (!hotelName || !adminEmail || !adminPassword || !staffEmail || !staffPassword || !adminName) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName },
    });

    if (adminError) {
      return new Response(JSON.stringify({ error: `Admin creation failed: ${adminError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserId = adminData.user.id;

    // 2. Create staff user
    const { data: staffData, error: staffError } = await supabase.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
      user_metadata: { name: `${hotelName} Staff` },
    });

    if (staffError) {
      // Cleanup admin user
      await supabase.auth.admin.deleteUser(adminUserId);
      return new Response(JSON.stringify({ error: `Staff creation failed: ${staffError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const staffUserId = staffData.user.id;

    // 3. Create hotel record
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .insert({
        name: hotelName,
        admin_user_id: adminUserId,
        staff_user_id: staffUserId,
        staff_email: staffEmail,
        staff_password: staffPassword,
      })
      .select()
      .single();

    if (hotelError) {
      await supabase.auth.admin.deleteUser(adminUserId);
      await supabase.auth.admin.deleteUser(staffUserId);
      return new Response(JSON.stringify({ error: `Hotel creation failed: ${hotelError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hotelId = hotel.id;

    // 4. Assign roles
    await supabase.from("user_roles").insert([
      { user_id: adminUserId, role: "admin", hotel_id: hotelId },
      { user_id: staffUserId, role: "staff", hotel_id: hotelId },
    ]);

    // 5. Update profiles with hotel_id
    await supabase.from("profiles").update({ hotel_id: hotelId }).eq("user_id", adminUserId);
    await supabase.from("profiles").update({ hotel_id: hotelId }).eq("user_id", staffUserId);

    // 6. Create default restaurant settings
    await supabase.from("restaurant_settings").insert({
      hotel_id: hotelId,
      name: hotelName,
      address: "",
      phone: "",
      email: adminEmail,
      tax_rate: 10,
      currency: "USD",
      invoice_footer: "Thank you for dining with us!",
    });

    return new Response(
      JSON.stringify({
        success: true,
        hotel: { id: hotelId, name: hotelName },
        message: "Hotel registered successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
