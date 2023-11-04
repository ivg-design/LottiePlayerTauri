use dirs::home_dir;

// List of directories to hide for macOS
pub const MAC_HIDDEN_DIRS: &[&str] = &[
    "/bin", "/sbin", "/etc", "/usr", "/tmp", "/var", "/private", "/cores",
    "/.Spotlight-V100", "/.fseventsd", "/.vol", "/.Trashes",
    "/.DocumentRevisions-V100", "/.DS_Store", "/.TemporaryItems",
    "/.PKInstallSandboxManager", "/.PKInstallSandboxManager-SystemSoftware",
    "/.LSOverride", "/home", "/net", "/Network", "/.file", "/Volumes", "/dev", "/opt",
    "/Users/Deleted Users", "/Users/Shared", "/Users/Guest",
    // Add any other root directories you want to hide
];


// User-specific directories that should be considered hidden on macOS
pub const MAC_HIDDEN_USER_DIRS: &[&str] = &[
    ".bash_profile", ".bashrc", ".bash_logout", ".ssh", ".gitconfig",
    ".gitignore", ".viminfo", ".vimrc", ".zshrc", ".zsh_history", ".config",
    ".cups", ".Trash", ".npm", ".dropbox", ".local", ".cache", ".gnupg",
    ".mackup.cfg", ".mackup", ".bash_sessions", ".bundle", ".gem", ".iterm2",
    ".vscode", ".matplotlib", ".oracle_jre_usage", ".continuum",
    "Library/Application Support", "Library/Caches", "Library/Preferences",
    "Library/Logs", "Library/Cookies", "Library/Containers", "Library/Mail",
    "Library/Safari", "Library/Messages", "Library/Keychains",
    "Library/Fonts", "Library/Calendars", "Library/Autosave Information",
    "Library/ColorSync", "Library/Address Book", "Library/Dictionaries",
    // Add any other user directories you want to hide
];

// List of directories to hide for Windows
pub const WINDOWS_HIDDEN_DIRS: &[&str] = &[
    "C:\\Windows", "C:\\Program Files", "C:\\hiberfil.sys",
    "C:\\pagefile.sys", "C:\\swapfile.sys", "C:\\Boot", "C:\\Windows\\CSC",
    "C:\\System Volume Information", "C:\\$Recycle.Bin", "C:\\Recovery",
    "C:\\ProgramData",
    // Add any other root directories you want to hide
];

// User-specific directories that should be considered hidden on Windows
pub const WINDOWS_HIDDEN_USER_DIRS: &[&str] = &[
    "AppData", "Local Settings", "Application Data", "NetHood", "PrintHood",
    "Recent", "SendTo", "Start Menu", "Templates",
    // Add any other user directories you want to hide
];

// Utility function to get the home directory as a String
fn home_dir_string() -> String {
    home_dir()
        .expect("Could not find the home directory")
        .to_str()
        .expect("Home directory contains invalid Unicode")
        .to_owned()
}

// Combine root and user-specific hidden directories for macOS
pub fn combined_mac_hidden_dirs() -> Vec<String> {
    let mut hidden_dirs = MAC_HIDDEN_DIRS
        .iter()
        .map(|s| s.to_string())
        .collect::<Vec<String>>();
    let home_dir = home_dir_string();

    for dir in MAC_HIDDEN_USER_DIRS {
        hidden_dirs.push(format!("{}/{}", home_dir, dir));
    }

    hidden_dirs
}

// Combine root and user-specific hidden directories for Windows
pub fn combined_windows_hidden_dirs() -> Vec<String> {
    let mut hidden_dirs = WINDOWS_HIDDEN_DIRS
        .iter()
        .map(|s| s.to_string())
        .collect::<Vec<String>>();
    let home_dir = home_dir_string();

    for dir in WINDOWS_HIDDEN_USER_DIRS {
        hidden_dirs.push(format!("{}\\{}", home_dir, dir));
    }

    hidden_dirs
}
