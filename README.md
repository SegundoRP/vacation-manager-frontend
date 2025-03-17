# Vacations manager

Manage the vacations for employees. This repository uses this [API](https://github.com/SegundoRP/vacations_api).
The frontend is deployed on Vercel and the api backend is in production with Railway.

## Requirements

- Next 15.2.2
- Node.js (v18 o superior)
- npm o yarn


## Installation

1. Clone the repository:

```bash
  git@github.com:SegundoRP/vacation-manager-frontend.git
  cd vacation-manager-frontend
```

2. Clone backend repository:

```bash
  git@github.com:SegundoRP/vacations_api.git
  cd vacations_api
```

Check the [backend repository](https://github.com/SegundoRP/vacations_api) for the installation remaining.

3. Install dependencies in frontend  repository:

```bash
npm install
# o
yarn install
```

4. Set Up local env for api url in your environment variables:

```bash
NEXT_PUBLIC_API_URL
```

5.  Start the server:

```bash
npm run dev
```

Frontend will be available in http://localhost:3001

## Production

The application is available in production [here](https://vacation-manager-frontend.vercel.app/vacations). It was deployed in Vercel and it uses an api deployed in Railway.

