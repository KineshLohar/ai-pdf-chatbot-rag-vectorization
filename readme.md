# NotebookLM Project

This repository contains two main parts:

- **Frontend**: React application (\`notebooklm-frontend\` folder)  
- **Backend**: Express API server (\`notebooklm-backend\` folder)

---

## Prerequisites

- Node.js v18 or above  
- npm (comes with Node) or yarn  
- Git

---

## Backend Setup (\`notebooklm-backend\`)

### 1. Navigate to backend directory

\`\`\`bash
cd notebooklm-backend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Configure environment variables

Create a \`.env\` file in the \`notebooklm-backend\` folder with the following content:

\`\`\`env
PORT=5000
FRONTEND_URL=http://localhost:5173
WEAVIATE_CLUSTER_URL=your_weaviate_url_here
# Add other environment variables your backend requires
\`\`\`

### 4. Start the backend server

\`\`\`bash
npm start
# or, if you have a dev script
npm run dev
\`\`\`

The backend API will be running at \`http://localhost:5000\` (or the port you specify).

---

## Frontend Setup (\`notebooklm-frontend\`)

### 1. Navigate to frontend directory

\`\`\`bash
cd notebooklm-frontend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Configure environment variables

Create a \`.env\` file in the \`notebooklm-frontend\` folder with the following content:

\`\`\`env
VITE_BACKEND_URL=http://localhost:5000/api
# Add other frontend environment variables here
\`\`\`

> Note: Vite requires env variables to start with \`VITE_\` prefix.

### 4. Start the frontend dev server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The frontend will be running at \`http://localhost:5173\` by default.

---

## Running Both Frontend and Backend Locally

Open two terminal windows or tabs:

- In the first, start backend:

  \`\`\`bash
  cd notebooklm-backend
  npm start
  \`\`\`

- In the second, start frontend:

  \`\`\`bash
  cd notebooklm-frontend
  npm run dev
  \`\`\`

---

## Deployment

- **Backend**: Deploy the contents of \`notebooklm-backend\` on your preferred Node.js hosting platform (Railway, Heroku, Render, etc).  
- **Frontend**: Deploy the contents of \`notebooklm-frontend\` on platforms like Vercel, Netlify, or any static hosting provider.

Make sure to update the frontend environment variable \`VITE_BACKEND_URL\` to point to your deployed backend URL.

---

## Troubleshooting

- Verify Node.js version compatibility.  
- Ensure \`.env\` files exist and are correctly configured.  
- Check CORS settings in backend (should allow your frontend origin).  
- If port conflicts occur, update the \`PORT\` variable in backend \`.env\`.  
- Restart servers after changing environment variables.

---

## Support

For questions or issues, please open an issue in this repository or contact the maintainer.

---

Happy coding! 🚀
