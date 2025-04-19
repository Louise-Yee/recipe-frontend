# Recipe Sharing Platform - Frontend

This repository contains the frontend code for a recipe sharing platform built with Next.js and Material UI. The application allows users to browse, create, update, and share recipes.

## Features

- User authentication (sign up, login, logout)
- Create and edit recipes with images, ingredients, and step-by-step instructions
- Browse and search for recipes
- Responsive design for mobile and desktop

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Material UI](https://mui.com/) - Component library
- [Firebase Authentication](https://firebase.google.com/docs/auth) - User authentication
- [Firebase Storage](https://firebase.google.com/docs/storage) - Image storage
- [Firebase Hosting](https://firebase.google.com/docs/hosting) - Deployment platform

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Louise-Yee/recipe-frontend.git
   cd recipe-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root with the following configuration:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com/api
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

## Local Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

To create a production build:

```bash
npm run build
```

This command will create a static export in the `out` directory which can be deployed to Firebase Hosting.

To preview the production build locally:

```bash
npm run start
```

## Deployment to Firebase Hosting

### Manual Deployment

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init
   ```
   - Select 'Hosting' when prompted for features
   - Select your Firebase project
   - Specify `out` as your public directory
   - Configure as a single-page app: `Yes`
   - Set up automatic builds and deploys with GitHub: `No` (you can set this up later)

3. Build your project:
   ```bash
   npm run build
   ```

4. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### Automated Deployment with GitHub Actions

This project includes a GitHub Actions workflow for automated deployments when you push to the master branch.

1. Add Firebase secrets to your GitHub repository:
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets > Actions
   - Add the following secrets:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `FIREBASE_SERVICE_ACCOUNT_YOUR_PROJECT_ID` (Generate this using Firebase CLI)

2. Generate a Firebase service account key:
   ```bash
   firebase login:ci
   ```
   Copy the token and add it as a secret named `FIREBASE_SERVICE_ACCOUNT_YOUR_PROJECT_ID` in your GitHub repository.

3. Push your code to the master branch:
   ```bash
   git push origin master
   ```

The GitHub Actions workflow will automatically build and deploy your application to Firebase Hosting.

## Troubleshooting

### Next.js Static Export Issues

If you encounter errors when building for static export:

1. Make sure your Next.js config is properly set for static export:
   ```javascript
   // next.config.js
   module.exports = {
     output: 'export',
     distDir: 'out',
     images: {
       unoptimized: true,
     },
     trailingSlash: true,
   };
   ```

2. For dynamic routes, ensure you've implemented `generateStaticParams()` in your page components.

3. Check that any server components are properly adapted for static export.

### Firebase Hosting Issues

If your deployment fails:

1. Check that your `firebase.json` file specifies the correct public directory:
   ```json
   {
     "hosting": {
       "public": "out",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

2. Verify that your Firebase project has hosting enabled.

3. Check the GitHub Actions logs for specific error messages.

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
