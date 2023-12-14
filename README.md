# PonderPad

PonderPad is a note-taking application designed for simplicity and efficiency. Built with Node.js, Express, MongoDB, and EJS, it integrates Google OAuth for authentication and provides a user-friendly interface for note management.

## Folder Structure

```
PonderPad/
│
├── node_modules/
├── public/
├── server/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Note.js
│   │   └── User.js
│   └── ...
├── views/
│   ├── components/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── dashboard/
│   │   ├── create-note.ejs
│   │   ├── dashboard-header.ejs
│   │   ├── dashboard.ejs
│   │   ├── edit-note.ejs
│   │   └── search.ejs
│   ├── layouts/
│   │   ├── dashboard-layout.ejs
│   │   └── main-layout.ejs
│   └── pages/
│       ├── 404.ejs
│       ├── about.ejs
│       └── home.ejs
├── .env
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
└── tailwind.config.js
```

## Installation and Local Setup

1. **Clone the Repository:**

   ```
   git clone https://github.com/your-username/PonderPad.git
   cd PonderPad
   ```

2. **Install Dependencies:**

   ```
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following:

   ```
   MONGO_URI=your_mongo_atlas_uri
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=your_google_callback_url
   QUOTEAPI=your_api-ninjas_quote_api_key
   SESSION_SECRET=cheese
   ```

   - Sign up for MongoDB Atlas and obtain your `MONGO_URI`.
   - Set up Google OAuth credentials to get `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`.
   - Get your API key from [API Ninjas](https://api-ninjas.com/api/quotes) for `QUOTEAPI`.

4. **Run the Application:**
   ```
   npm start
   ```
   Your app should now be running on [http://localhost:3000](http://localhost:3000).

## Contributing

Contributions to PonderPad are welcome. Please ensure that your PRs are detailed with what changes you are introducing.

## License

This project is licensed under the ISC License.
