use serde::{Deserialize, Serialize};

// This matches the data your React frontend sends
#[derive(Debug, Deserialize, Serialize)]
pub struct OrderItem {
    name: String,
    quantity: u32,
    price: f64,
}

// This is the function React calls!
#[tauri::command]
fn print_receipt(
    category: String, 
    items: Vec<OrderItem>, 
    order_id: String, 
    customer_name: String, 
    timestamp: String
) -> Result<String, String> {
    
    // We are going to build raw ESC/POS machine code
    let mut receipt: Vec<u8> = Vec::new();

    // 1. Initialize Printer (Wake up command)
    receipt.extend_from_slice(&[0x1B, 0x40]);

    // 2. Align Center & Print Header
    receipt.extend_from_slice(&[0x1B, 0x61, 0x01]); 
    receipt.extend_from_slice(b"QUETTA FOOD POINT\n");
    receipt.extend_from_slice(b"Delivery: 0336-0007631\n\n");

    // 3. Align Left & Print Order Details
    receipt.extend_from_slice(&[0x1B, 0x61, 0x00]);
    receipt.extend_from_slice(format!("Ref: #{}\n", order_id).as_bytes());
    receipt.extend_from_slice(format!("Date: {}\n", timestamp).as_bytes());
    receipt.extend_from_slice(format!("Client: {}\n", customer_name).as_bytes());
    receipt.extend_from_slice(format!("Category: {}\n", category).as_bytes());
    receipt.extend_from_slice(b"--------------------------------\n");

    // 4. Print Items Loop
    let mut total = 0.0;
    for item in items {
        let line_total = item.price * (item.quantity as f64);
        total += line_total;
        
        // Item name and qty
        receipt.extend_from_slice(format!("{}  x{}\n", item.name, item.quantity).as_bytes());
        
        // Align Right for price
        receipt.extend_from_slice(&[0x1B, 0x61, 0x02]);
        receipt.extend_from_slice(format!("Rs. {}\n", line_total).as_bytes());
        
        // Back to Align Left
        receipt.extend_from_slice(&[0x1B, 0x61, 0x00]);
    }

    // 5. Print Totals
    receipt.extend_from_slice(b"--------------------------------\n");
    receipt.extend_from_slice(&[0x1B, 0x61, 0x02]); // Align Right
    receipt.extend_from_slice(format!("TOTAL: Rs. {}\n\n", total).as_bytes());

    // 6. Footer & Spacing
    receipt.extend_from_slice(&[0x1B, 0x61, 0x01]); // Align Center
    receipt.extend_from_slice(b"Thank You for Visiting!\n\n\n\n\n\n"); // Feed paper past the blade

    // 7. Fire the Cutter Blade! (GS V 0)
    receipt.extend_from_slice(&[0x1D, 0x56, 0x00]);

    // 8. Send the raw bytes directly to the Windows Printer Share
    // Notice this now correctly points to POS-80
    let printer_path = r"\\127.0.0.1\POS-80";
    
    match std::fs::write(printer_path, receipt) {
        Ok(_) => Ok("Print job sent successfully!".to_string()),
        Err(e) => Err(format!("Failed to connect to printer: {}", e)),
    }
}

// This runs your app and registers the command
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Keep your database store plugin!
        .plugin(tauri_plugin_store::Builder::new().build())
        
        // ---> THIS IS THE NEW LINE THAT CONNECTS REACT TO RUST <---
        .invoke_handler(tauri::generate_handler![print_receipt])
        
        // Keep your logging plugin!
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}