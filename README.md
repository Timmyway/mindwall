# Mindwall
Mindwall is an intuitive application designed to help you organize, expand, and bring your ideas to life using Google Gemini through their REST api. Built on Vue.js and Laravel, Mindwall integrates Gemini's advanced API to provide a seamless experience for generating and managing content through a visual canvas using KonvaJS.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Prompts](#prompts)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Canvas-Based Idea Management**: Add, organize, and manipulate text and images on a dynamic canvas.
- **AI-Powered Content Generation**: Use specialized AI characters to generate content in multiple languages and styles.
- **Image Analysis**: Automatically analyze and generate content based on images uploaded to the canvas.
- **Customizable Workflows**: Tailor the behavior of AI prompts to suit your specific needs.
- **Multilingual Support**: Create and manage content in different languages effortlessly.
- **Intuitive Interface**: Simple drag-and-drop functionality for easy idea management.

## Installation

To run Mindwall locally, follow these steps:

### Prerequisites

- Node.js (version 20 or higher)
- npm or Yarn
- PHP (version 8.2 or higher)
- Composer
- MySQL or PostgreSQL database

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Timmyway/mindwall
   cd mindwall

2. Install dependencies:
npm install
composer install

3. Copy the .env.example file to .env:
Update the .env file with your database credentials and other necessary environment variables (Freepik api infos, and Gemini api infos).

4. Run migrations and seeders:
php artisan migrate --seed

Create a Virtual Host:
Set up a virtual environment for mindwall.local. Update your hosts file (usually located at /etc/hosts on Linux/Mac or C:\Windows\System32\drivers\etc\hosts on Windows) to include:
127.0.0.1 mindwall.local

Configure your web server (e.g., Apache, Nginx) to serve the application from mindwall.local.

6. Start the development server:
npm run dev
Access the app at : http://mindwall.local/


## About Mindwall
Mindwall is a web application that uses AI Gemini API and Konva JS library to help people unleash their thoughts!

## Contributing
Contributions are welcome! If you'd like to contribute to Mindwall

## Credits
<a href="https://fr.freepik.com/photos-gratuite/fond-humain-poignee-main-robot-ere-numerique-futuriste_17850426.htm#query=intelligence%20artificielle&position=1&from_view=keyword&track=ais_hybrid&uuid=99fe9006-f7b5-4978-a799-15ed169a3d0c">Image de rawpixel.com</a> sur Freepik

## Mindwall is licensed under the MIT License.
