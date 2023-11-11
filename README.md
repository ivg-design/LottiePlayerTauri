# Lottie Player Tauri - README.md

## Overview

Lottie Player Tauri is a desktop application developed using Tauri and React, designed for playing and interacting with Lottie animations. It provides a rich interface with advanced features and controls for Lottie animations, making it a versatile tool for designers and developers. This project is actively developed, and new features are continually being added.

## Features

### Current Features

- **Animation Playback**: Users can load and play Lottie animations.
- **Play/Pause Control**: Integrated play and pause functionality with UI feedback.
- **Progress Tracking**: Ability to see and control the progress of the animation.
- **Color Customization**: The application includes a color picker for customizing the background.
- **Animation Information**: Display detailed information about the Lottie file, such as frame rate, duration, and size.
- **TreeView for File Selection**: Browse and select files using a TreeView structure.
- **File Selection**: Select Lottie files using both a file picker and the TreeView.

### Planned Features

- **Marker Playback**: Jump to and play specific markers within Lottie animations.
- **Segment Playback**: Ability to play specific segments of an animation.
- **Style Updates to Lottie Elements**: Update styles (color, stroke, etc.) of Lottie elements within the application.
- **Class Addition to Lottie Elements**: Ability to add classes to Lottie elements and save the modified Lottie file.
- **Interactivity Processing**: Add interactive elements to Lottie animations and generate code snippets for integration.

## Installation and Usage

To set up and use Lottie Player Tauri, follow these steps:

1. **Clone the Repository**: Clone the repository from [GitHub](https://github.com/ivg-design/LottiePlayerTauri).
2. **Install Dependencies**:
   - Install [Rust](https://www.rust-lang.org/tools/install) and [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html).
   - Ensure [Node.js](https://nodejs.org/en/) is installed.
   - Install Tauri CLI globally using `npm install -g @tauri-apps/cli` or `yarn global add @tauri-apps/cli`.
   - Run `npm install` or `yarn install` in the project directory to install necessary JavaScript dependencies.
3. **Build and Run the Application**:
   - Use `cargo tauri dev` to start the application in development mode.
   - Use `cargo tauri build` to build the application for production.

## Development

The application's entry point is `App.js`, which sets up the React components and integrates the Tauri functionalities. Key components include:

- `App.js`: Application entrypoint contains the main app and treeNode components.
- `PlayerUI.js`: The main interface for the Lottie player, containing playback controls and display elements.
- `LottiePlayer.js`: Renders the Lottie animation.
- `LottieInfoParser.js`: Parses Lottie file data and displays animation details.

## Contribution

We welcome contributions! If you're interested in contributing, feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the [MIT License](LICENSE.md).

## Note

This project is in a development phase, and the features listed are subject to change. The repository is regularly updated, and we aim to bring more functionality and improvements to the Lottie Player Tauri application.

---

*This README.md provides a comprehensive guide to the Lottie Player Tauri project. For the most current information, please refer to the project's [GitHub repository](https://github.com/ivg-design/LottiePlayerTauri).*
