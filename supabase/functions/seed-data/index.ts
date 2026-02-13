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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: string[] = [];

    // 1. Create superadmin
    const { data: saData, error: saError } = await supabase.auth.admin.createUser({
      email: "superadmin@restrocloud.com",
      password: "SuperAdmin@123",
      email_confirm: true,
      user_metadata: { name: "Super Admin" },
    });

    if (saError && !saError.message.includes("already been registered")) {
      results.push(`Superadmin error: ${saError.message}`);
    } else if (saData?.user) {
      await supabase.from("user_roles").insert({ user_id: saData.user.id, role: "superadmin" });
      results.push("Superadmin created");
    } else {
      results.push("Superadmin already exists");
    }

    // 2. Create 5 hotel accounts
    const hotels = [
      { name: "Grand Palace Restaurant", adminName: "Rajesh Kumar", adminEmail: "rajesh@grandpalace.com", adminPass: "Admin@123", staffEmail: "staff@grandpalace.com", staffPass: "Staff@123" },
      { name: "Ocean Breeze Cafe", adminName: "Priya Sharma", adminEmail: "priya@oceanbreeze.com", adminPass: "Admin@123", staffEmail: "staff@oceanbreeze.com", staffPass: "Staff@123" },
      { name: "Mountain View Bistro", adminName: "Arjun Patel", adminEmail: "arjun@mountainview.com", adminPass: "Admin@123", staffEmail: "staff@mountainview.com", staffPass: "Staff@123" },
      { name: "Spice Garden", adminName: "Meera Nair", adminEmail: "meera@spicegarden.com", adminPass: "Admin@123", staffEmail: "staff@spicegarden.com", staffPass: "Staff@123" },
      { name: "Urban Plate", adminName: "Vikram Singh", adminEmail: "vikram@urbanplate.com", adminPass: "Admin@123", staffEmail: "staff@urbanplate.com", staffPass: "Staff@123" },
    ];

    for (const h of hotels) {
      // Create admin user
      const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
        email: h.adminEmail, password: h.adminPass, email_confirm: true,
        user_metadata: { name: h.adminName },
      });
      if (adminErr) { results.push(`${h.name} admin err: ${adminErr.message}`); continue; }

      const adminId = adminData.user.id;

      // Create staff user
      const { data: staffData, error: staffErr } = await supabase.auth.admin.createUser({
        email: h.staffEmail, password: h.staffPass, email_confirm: true,
        user_metadata: { name: `${h.name} Staff` },
      });
      if (staffErr) { results.push(`${h.name} staff err: ${staffErr.message}`); continue; }

      const staffId = staffData.user.id;

      // Create hotel
      const { data: hotel, error: hotelErr } = await supabase.from("hotels").insert({
        name: h.name, admin_user_id: adminId, staff_user_id: staffId,
        staff_email: h.staffEmail, staff_password: h.staffPass,
      }).select().single();

      if (hotelErr) { results.push(`${h.name} hotel err: ${hotelErr.message}`); continue; }

      const hotelId = hotel.id;

      // Roles
      await supabase.from("user_roles").insert([
        { user_id: adminId, role: "admin", hotel_id: hotelId },
        { user_id: staffId, role: "staff", hotel_id: hotelId },
      ]);

      // Update profiles
      await supabase.from("profiles").update({ hotel_id: hotelId }).eq("user_id", adminId);
      await supabase.from("profiles").update({ hotel_id: hotelId }).eq("user_id", staffId);

      // Settings
      await supabase.from("restaurant_settings").insert({
        hotel_id: hotelId, name: h.name, email: h.adminEmail,
        tax_rate: 10, currency: "INR",
      });

      // Menu items
      await supabase.from("menu_items").insert([
        { hotel_id: hotelId, name: "Butter Chicken", price: 350, category: "Main Course", available: true },
        { hotel_id: hotelId, name: "Paneer Tikka", price: 250, category: "Starters", available: true },
        { hotel_id: hotelId, name: "Masala Dosa", price: 120, category: "Breakfast", available: true },
        { hotel_id: hotelId, name: "Mango Lassi", price: 80, category: "Beverages", available: true },
        { hotel_id: hotelId, name: "Gulab Jamun", price: 100, category: "Desserts", available: true },
      ]);

      // Tables
      await supabase.from("restaurant_tables").insert([
        { hotel_id: hotelId, number: 1, capacity: 2, status: "free" },
        { hotel_id: hotelId, number: 2, capacity: 4, status: "free" },
        { hotel_id: hotelId, number: 3, capacity: 6, status: "free" },
        { hotel_id: hotelId, number: 4, capacity: 4, status: "free" },
      ]);

      results.push(`${h.name} ✓`);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
