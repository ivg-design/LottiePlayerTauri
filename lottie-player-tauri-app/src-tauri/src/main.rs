// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod hidden_dirs;

use std::{fs, path::Path};
use tauri::command;
use hidden_dirs::{combined_mac_hidden_dirs, combined_windows_hidden_dirs};

#[derive(serde::Serialize)]
struct DirEntry {
    name: String,
    is_dir: bool,
    path: String,
}

#[command]
fn read_dir(path: String) -> Result<Vec<DirEntry>, String> {
    let path = Path::new(&path);
    let os_type = std::env::consts::OS;
    let hidden_dirs = match os_type {
        "macos" => combined_mac_hidden_dirs(),
        "windows" => combined_windows_hidden_dirs(),
        _ => Vec::new(), // For other OS, we'll just use an empty Vec for now.
    };

    match fs::read_dir(path) {
        Ok(entries) => {
            let files: Vec<DirEntry> = entries.filter_map(Result::ok).filter_map(|entry| {
                let file_name = entry.file_name();
                let file_name_str = file_name.to_string_lossy();
                let file_path = entry.path().to_string_lossy().into_owned();

                // Only include the entry if it is not hidden
                if !hidden_dirs.contains(&file_path) && !file_name_str.starts_with('.') {
                    Some(DirEntry {
                        name: file_name_str.into_owned(),
                        is_dir: entry.file_type().map_or(false, |ft| ft.is_dir()),
                        path: file_path,
                    })
                } else {
                    None
                }
            }).collect();
            Ok(files)
        }
        Err(err) => Err(err.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
