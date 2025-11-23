# 🐾 Pet Adoption Platform

A modern, full-stack pet adoption website where users can browse pets, submit adoption requests, and admins can manage pet listings. Built with React, TypeScript, Tailwind, and Supabase.

---

## 🚀 Features

### 👤 User Features
- Browse adoptable pets with filters  
- View detailed pet profiles  
- Submit adoption requests  
- Email-based authentication (Supabase Auth)  
- Fully responsive UI  

### 🛠️ Admin Features
- Add / edit / delete pets  
- Manage adoption requests  
- Dashboard for quick overview  

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Deployment** | Vercel / Netlify (recommended) |
| **Other** | PL/pgSQL (Supabase functions), REST APIs |

---

## 📁 Project Structure

pet-adoption/
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── contexts/
│ ├── integrations/
│ ├── styles/
│ └── main.tsx
├── supabase/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts


---

## ⚙️ Getting Started

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/PrajwalSingh-git/pet-adoption.git
cd pet-adoption

2️⃣ Install Dependencies
npm install

Configure Environment Variables

Create a .env file:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4️⃣ Run the Dev Server
npm run dev

The app will start at:
http://localhost:3000

🐾 Usage Guide
User

Visit the homepage

Browse or filter pets

Open a profile for details

Log in / Sign up

Submit adoption request

Admin

Login as admin

Access dashboard

Add/edit/delete pets

Manage adoption requests

🤝 Contributing

Contributions are welcome!

Fork the repo

Create your feature branch

Commit and push your changes

Open a pull request

📜 License

This project is licensed under the MIT License.
