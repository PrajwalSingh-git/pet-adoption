Pet Adoption

A modern pet-adoption platform built with full-stack technologies

Table of Contents

About

Features

Tech Stack

Getting Started

Prerequisites

Installation

Running Locally

Usage

Project Structure

Contributing

License

Contact

About

This application provides a platform for users to browse adoptable pets, submit adoption requests, and for administrators or staff to manage listings, track adoption workflow, and maintain pet data. The aim is to streamline the adoption process and provide a pleasant user experience.

Features

Browse available pets with filters (species, age, location)

View detailed pet profiles (photos, description, health info)

Submit an adoption request (with basic user info)

Admin panel: add/edit/delete pet listings, review adoption requests

Responsive UI built for desktop & mobile

Secure backend & database to manage pet and request data

Tech Stack

Frontend: React + TypeScript + Vite for fast build & hot-reload

Styling: Tailwind CSS for utility-first styling

Backend / Database: (If present) A SQL/NoSQL DB + REST API, or serverless functions

Hosting / Dev Tools: (Mentioned hints: supabase folder present) Possibly using Supabase for backend/data & auth

Language Breakdown: ~95% TypeScript + some PL/pgSQL (as per language stats) 
GitHub

Getting Started
Prerequisites

Node.js (v16+ recommended)

npm or yarn

(If using Supabase) A Supabase account & project

Installation

Clone the repo:

git clone https://github.com/PrajwalSingh-git/pet-adoption.git  
cd pet-adoption  


Install dependencies:

npm install  
# or  
yarn  


Configure environment variables / backend connection (e.g., to Supabase). Create a .env file:

VITE_SUPABASE_URL=your_supabase_url  
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  

Running Locally
npm run dev  
# or  
yarn dev  


This should spin up the dev server (via Vite) and you can visit http://localhost:3000 (or whichever port) to view the app.

Usage

Visit the homepage and browse available pets.

Use filters to narrow your search by species, age, etc.

Click on a pet to view full profile.

If you wish to adopt, submit an adoption request (you might need to create an account / login).

As an admin/staff user, log into the admin dashboard to manage pets and view requests.

Project Structure
pet-adoption/
├── public/
│   └── index.html
├── src/
│   ├── components/         ← Reusable UI components  
│   ├── pages/              ← Views / routes (home, pet details, admin)  
│   ├── services/           ← API / Supabase interaction  
│   ├── styles/             ← Tailwind config, global styles  
│   └── main.tsx  
├── supabase/               ← (Optional) Database schema / functions  
├── package.json  
├── tsconfig.json  
├── tailwind.config.ts  
└── vite.config.ts  


Note: adjust structure to exactly match your codebase

Contributing

Contributions are welcome! If you’d like to help with features, bug-fixes, or improvements:

Fork the repository

Create a feature branch (git checkout -b feature/YourFeature)

Commit your changes and push (git push origin feature/YourFeature)

Open a Pull Request and describe your changes & rationale

Please ensure your code adheres to the existing style conventions (TypeScript, Tailwind, ESLint).

License

This project is licensed under the MIT License. See the LICENSE
 file for details.

Contact
