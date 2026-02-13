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

    // 1. Create subscription packages
    const { data: packages } = await supabase.from("subscription_packages").insert([
      { name: "Free", description: "Basic POS and Orders", price: 0, duration_days: 9999, features: ["POS", "Orders"], is_active: true },
      { name: "Pro", description: "Full restaurant management", price: 999, duration_days: 30, features: ["POS", "Orders", "Kitchen Display", "Seating", "Reports", "Expenses"], is_active: true },
      { name: "Enterprise", description: "Everything + priority support", price: 2499, duration_days: 30, features: ["POS", "Orders", "Kitchen Display", "Seating", "Reports", "Expenses", "Priority Support", "API Access"], is_active: true },
    ]).select();
    results.push(`Packages created: ${packages?.length || 0}`);

    const freePackageId = packages?.[0]?.id;
    const proPackageId = packages?.[1]?.id;
    const enterprisePackageId = packages?.[2]?.id;

    // 2. Create superadmin
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

    // 3. Create 5 hotel accounts with unique data
    const hotels = [
      {
        name: "Grand Palace Restaurant",
        adminName: "Rajesh Kumar",
        adminEmail: "rajesh@grandpalace.com",
        adminPass: "Admin@123",
        staffEmail: "staff@grandpalace.com",
        staffPass: "Staff@123",
        packageId: proPackageId,
        menu: [
          { name: "Butter Chicken", price: 350, category: "Main Course", available: true, description: "Creamy tomato-based curry with tender chicken" },
          { name: "Paneer Tikka", price: 250, category: "Starters", available: true, description: "Marinated cottage cheese grilled in tandoor" },
          { name: "Dal Makhani", price: 200, category: "Main Course", available: true, description: "Slow-cooked black lentils in butter" },
          { name: "Naan", price: 50, category: "Breads", available: true, description: "Soft leavened bread from tandoor" },
          { name: "Gulab Jamun", price: 100, category: "Desserts", available: true, description: "Deep-fried milk dumplings in syrup" },
          { name: "Mango Lassi", price: 80, category: "Beverages", available: true, description: "Sweet mango yogurt drink" },
          { name: "Chicken Biryani", price: 320, category: "Rice", available: true, description: "Fragrant basmati rice with spiced chicken" },
          { name: "Raita", price: 60, category: "Sides", available: true, description: "Yogurt with cucumber and spices" },
        ],
        tables: [
          { number: 1, capacity: 2, status: "free" },
          { number: 2, capacity: 4, status: "free" },
          { number: 3, capacity: 6, status: "free" },
          { number: 4, capacity: 4, status: "free" },
          { number: 5, capacity: 8, status: "free" },
          { number: 6, capacity: 2, status: "free" },
        ],
      },
      {
        name: "Ocean Breeze Cafe",
        adminName: "Priya Sharma",
        adminEmail: "priya@oceanbreeze.com",
        adminPass: "Admin@123",
        staffEmail: "staff@oceanbreeze.com",
        staffPass: "Staff@123",
        packageId: proPackageId,
        menu: [
          { name: "Fish & Chips", price: 420, category: "Seafood", available: true, description: "Crispy battered fish with fries" },
          { name: "Prawn Cocktail", price: 350, category: "Starters", available: true, description: "Chilled prawns with cocktail sauce" },
          { name: "Grilled Lobster", price: 1200, category: "Seafood", available: true, description: "Whole lobster with garlic butter" },
          { name: "Caesar Salad", price: 220, category: "Salads", available: true, description: "Romaine lettuce with caesar dressing" },
          { name: "Seafood Pasta", price: 480, category: "Main Course", available: true, description: "Mixed seafood in creamy sauce" },
          { name: "Coconut Water", price: 60, category: "Beverages", available: true, description: "Fresh tender coconut" },
          { name: "Chocolate Lava Cake", price: 180, category: "Desserts", available: true, description: "Warm chocolate cake with molten center" },
        ],
        tables: [
          { number: 1, capacity: 2, status: "free" },
          { number: 2, capacity: 2, status: "free" },
          { number: 3, capacity: 4, status: "free" },
          { number: 4, capacity: 6, status: "free" },
          { number: 5, capacity: 4, status: "free" },
        ],
      },
      {
        name: "Mountain View Bistro",
        adminName: "Arjun Patel",
        adminEmail: "arjun@mountainview.com",
        adminPass: "Admin@123",
        staffEmail: "staff@mountainview.com",
        staffPass: "Staff@123",
        packageId: freePackageId,
        menu: [
          { name: "Margherita Pizza", price: 300, category: "Pizza", available: true, description: "Classic tomato and mozzarella" },
          { name: "Pepperoni Pizza", price: 380, category: "Pizza", available: true, description: "Spicy pepperoni with cheese" },
          { name: "Garlic Bread", price: 120, category: "Starters", available: true, description: "Toasted bread with garlic butter" },
          { name: "Mushroom Soup", price: 150, category: "Soups", available: true, description: "Creamy wild mushroom soup" },
          { name: "Pasta Carbonara", price: 350, category: "Pasta", available: true, description: "Egg-based creamy pasta with bacon" },
          { name: "Cold Coffee", price: 120, category: "Beverages", available: true, description: "Iced coffee with cream" },
          { name: "Tiramisu", price: 200, category: "Desserts", available: true, description: "Coffee-flavored Italian dessert" },
          { name: "BBQ Chicken Wings", price: 280, category: "Starters", available: true, description: "Smoky BBQ glazed wings" },
          { name: "Veggie Burger", price: 220, category: "Burgers", available: true, description: "Grilled veggie patty with fixings" },
        ],
        tables: [
          { number: 1, capacity: 2, status: "free" },
          { number: 2, capacity: 4, status: "free" },
          { number: 3, capacity: 4, status: "free" },
          { number: 4, capacity: 6, status: "free" },
        ],
      },
      {
        name: "Spice Garden",
        adminName: "Meera Nair",
        adminEmail: "meera@spicegarden.com",
        adminPass: "Admin@123",
        staffEmail: "staff@spicegarden.com",
        staffPass: "Staff@123",
        packageId: enterprisePackageId,
        menu: [
          { name: "Masala Dosa", price: 120, category: "Breakfast", available: true, description: "Crispy crepe with potato filling" },
          { name: "Idli Sambar", price: 80, category: "Breakfast", available: true, description: "Steamed rice cakes with lentil soup" },
          { name: "Kerala Fish Curry", price: 400, category: "Main Course", available: true, description: "Spicy coconut fish curry" },
          { name: "Appam", price: 40, category: "Breads", available: true, description: "Fermented rice pancake" },
          { name: "Payasam", price: 90, category: "Desserts", available: true, description: "Sweet milk pudding with nuts" },
          { name: "Filter Coffee", price: 50, category: "Beverages", available: true, description: "Traditional South Indian coffee" },
          { name: "Chicken Chettinad", price: 380, category: "Main Course", available: true, description: "Fiery Chettinad-style chicken" },
          { name: "Vada", price: 60, category: "Starters", available: true, description: "Crispy lentil fritters" },
          { name: "Parotta", price: 40, category: "Breads", available: true, description: "Flaky layered flatbread" },
          { name: "Mango Juice", price: 70, category: "Beverages", available: true, description: "Fresh alphonso mango juice" },
        ],
        tables: [
          { number: 1, capacity: 2, status: "free" },
          { number: 2, capacity: 2, status: "free" },
          { number: 3, capacity: 4, status: "free" },
          { number: 4, capacity: 4, status: "free" },
          { number: 5, capacity: 6, status: "free" },
          { number: 6, capacity: 6, status: "free" },
          { number: 7, capacity: 8, status: "free" },
        ],
      },
      {
        name: "Urban Plate",
        adminName: "Vikram Singh",
        adminEmail: "vikram@urbanplate.com",
        adminPass: "Admin@123",
        staffEmail: "staff@urbanplate.com",
        staffPass: "Staff@123",
        packageId: proPackageId,
        menu: [
          { name: "Smash Burger", price: 280, category: "Burgers", available: true, description: "Double smashed beef patty" },
          { name: "Truffle Fries", price: 200, category: "Sides", available: true, description: "Hand-cut fries with truffle oil" },
          { name: "Chicken Shawarma", price: 220, category: "Wraps", available: true, description: "Spiced chicken in pita wrap" },
          { name: "Hummus Plate", price: 180, category: "Starters", available: true, description: "Creamy hummus with pita chips" },
          { name: "Falafel Bowl", price: 250, category: "Bowls", available: true, description: "Crispy falafel with tahini" },
          { name: "Iced Latte", price: 150, category: "Beverages", available: true, description: "Espresso with cold milk" },
          { name: "Churros", price: 120, category: "Desserts", available: true, description: "Cinnamon sugar churros with chocolate" },
          { name: "BBQ Pulled Pork", price: 350, category: "Main Course", available: true, description: "Slow-cooked pulled pork sandwich" },
        ],
        tables: [
          { number: 1, capacity: 2, status: "free" },
          { number: 2, capacity: 2, status: "free" },
          { number: 3, capacity: 4, status: "free" },
          { number: 4, capacity: 4, status: "free" },
          { number: 5, capacity: 6, status: "free" },
        ],
      },
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
        status: "active",
        subscription_package_id: h.packageId,
        subscription_start: new Date().toISOString().split("T")[0],
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
        invoice_footer: `Thank you for dining at ${h.name}!`,
      });

      // Menu items
      await supabase.from("menu_items").insert(
        h.menu.map(m => ({ hotel_id: hotelId, ...m }))
      );

      // Tables
      await supabase.from("restaurant_tables").insert(
        h.tables.map(t => ({ hotel_id: hotelId, ...t }))
      );

      // Create some dummy orders for each hotel
      const { data: menuData } = await supabase.from("menu_items").select("id, price").eq("hotel_id", hotelId).limit(3);
      const { data: tableData } = await supabase.from("restaurant_tables").select("id").eq("hotel_id", hotelId).limit(2);

      if (menuData && tableData && tableData.length > 0) {
        for (let i = 0; i < 3; i++) {
          const tableId = tableData[i % tableData.length].id;
          const orderItems = menuData.slice(0, 2);
          const total = orderItems.reduce((s, m) => s + Number(m.price) * (i + 1), 0);

          const { data: order } = await supabase.from("orders").insert({
            hotel_id: hotelId, table_id: tableId, status: ["new", "preparing", "ready"][i],
            total, created_by: staffId,
          }).select().single();

          if (order) {
            await supabase.from("order_items").insert(
              orderItems.map(m => ({
                order_id: order.id, menu_item_id: m.id,
                price: Number(m.price), quantity: i + 1,
              }))
            );
          }
        }
      }

      // Create some dummy expenses
      await supabase.from("expenses").insert([
        { hotel_id: hotelId, title: "Weekly Vegetables", category: "ingredients", amount: 450 + Math.floor(Math.random() * 200), created_by: adminId },
        { hotel_id: hotelId, title: "Electricity Bill", category: "utilities", amount: 1200 + Math.floor(Math.random() * 500), created_by: adminId },
        { hotel_id: hotelId, title: "Staff Uniforms", category: "other", amount: 300 + Math.floor(Math.random() * 100), created_by: adminId },
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
