use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
    menu::{Menu, MenuItem},
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

const MINI_WIDTH: f64 = 480.0;
const MINI_HEIGHT: f64 = 100.0;
const EXPANDED_WIDTH: f64 = 480.0;
const EXPANDED_HEIGHT: f64 = 580.0;
const HEADER_HEIGHT: f64 = 52.0;

#[tauri::command]
fn set_window_mode(window: tauri::WebviewWindow, mode: &str) -> Result<(), String> {
    let e = |err: tauri::Error| err.to_string();
    match mode {
        "mini" => {
            let pos = window.outer_position().map_err(e)?;
            let scale = window.scale_factor().unwrap_or(2.0);
            let offset = (HEADER_HEIGHT * scale) as i32;
            window.set_decorations(false).map_err(e)?;
            window.set_size(tauri::LogicalSize::new(MINI_WIDTH, MINI_HEIGHT)).map_err(e)?;
            window.set_position(tauri::PhysicalPosition::new(pos.x, pos.y + offset)).map_err(e)?;
            window.set_always_on_top(true).map_err(e)?;
        }
        "expanded" => {
            let pos = window.outer_position().map_err(e)?;
            let scale = window.scale_factor().unwrap_or(2.0);
            let offset = (HEADER_HEIGHT * scale) as i32;
            window.set_size(tauri::LogicalSize::new(EXPANDED_WIDTH, EXPANDED_HEIGHT)).map_err(e)?;
            window.set_position(tauri::PhysicalPosition::new(pos.x, pos.y - offset)).map_err(e)?;
            window.set_decorations(true).map_err(e)?;
        }
        _ => return Err(format!("Invalid mode: {mode}")),
    }
    Ok(())
}

#[tauri::command]
fn show_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn hide_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())?;
    Ok(())
}

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let open = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &settings, &quit])?;

    TrayIconBuilder::new()
        .tooltip("Inklet Portal")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            "settings" => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                    let _ = w.emit("navigate", "settings");
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up, ..
            } = event {
                let app = tray.app_handle();
                if let Some(w) = app.get_webview_window("main") {
                    if w.is_visible().unwrap_or(false) {
                        let _ = w.hide();
                    } else {
                        let _ = w.show();
                        let _ = w.set_focus();
                    }
                }
            }
        })
        .build(app)?;
    Ok(())
}

fn setup_shortcut(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let shortcut = "CmdOrCtrl+L".parse::<Shortcut>()?;
    app.global_shortcut().on_shortcut(shortcut, |app, _scut, event| {
        if event.state == ShortcutState::Pressed {
            if let Some(w) = app.get_webview_window("main") {
                if w.is_visible().unwrap_or(false) {
                    let _ = w.hide();
                } else {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
        }
    })?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![set_window_mode, show_window, hide_window])
        .setup(|app| {
            setup_tray(app)?;
            setup_shortcut(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
