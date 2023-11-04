# Lottie Player Application (WIP)

## Overview
The Lottie Player Application is a dynamic Tauri-based platform currently under development. It is designed for animators and developers who wish to interact with Lottie animations. The application enables users to select, view, and control Lottie animations embedded in `.json` or `.html` files, and will be available as a compiled multi-platform application.

## Features
- **File Selection:** Choose individual or multiple files or folders containing Lottie animations.
- **Animation Playback:** Play, pause, rewind, or loop animations. Access playback for specific segments.
- **Custom Controls:** Modify the appearance of animation elements in real-time.
- **Lottie-API Integration:** Apply Lottie-API for asynchronous animation customization and advanced interaction.

## Getting Started
Clone the repository to your local environment to get started:

```bash
git clone https://github.com/your-repository/lottie-player.git
```

### Prerequisites
- Node.js
- npm or Yarn
- Tauri
- A modern web browser

### Installation
Install the required dependencies within the cloned repository:

```bash
cd lottie-player
npm install
```

### Running the Application
To launch the application, execute:

```bash
npm run tauri dev
```

This command will start the application in development mode.

## Usage
When you start the application, you'll be presented with an interface to select Lottie animation files. The application allows for comprehensive file navigation and manipulation of animations.

### File Navigation
- Browse folders using the sidebar.
- Select an animation file to view it.

### Animation Controls
Controls available in the application include:
- **Play/Pause:** Toggle animation playback.
- **Segments:** Isolate and play defined segments of the animation.
- **Modify Elements:** Adjust properties such as color and opacity of animation elements.
- **Lottie-API Controls:** Use custom JavaScript code for interacting with animations programmatically.

## Contributing
We encourage contributions to the Lottie Player Application. Please make sure to update tests as appropriate.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
- Thanks to LottieFiles for providing the Lottie-web library.
- Appreciation to all contributors who are helping to enhance this tool.

## Contact
For any inquiries, please reach out to [IVG Design](mailto:ilyav@gusinski.us)

## Changelog
For a comprehensive list of changes made to the application, refer to the [CHANGELOG.md](CHANGELOG.md) file.
