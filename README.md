# sveltekit-mongodb-auth-template

This is a template of a full-stack SvelteKit (Svelte 5) app with a MongoDB database. It features fully implemented authentication made in two approaches: using [Auth.js](https://authjs.dev/) and using no library (except for arctic for third-party OAuth) following [Lucia](https://lucia-next.pages.dev/).

## Features

1. Svelte 5 in rune mode
2. SSR (CSR is disabled by default)
3. CRUD services using MongoDB through mongoose
4. JWT-based authentication
5. Email-based user management
   1. Email/password registration
   2. Email/password login
   3. Email verification
   4. Change password
   5. Reset password
6. Google OAuth
   1. Automatically links with email credentials if existing

## `sveltekit-authjs`

This project uses [Auth.js](https://authjs.dev/), specifically its Credentials, Google and Magic Links providers.

Auth.js has good SvelteKit support on both server and client sides. However, its Credentials provider only supports signing in with a username/password. Therefore, registration, email verification, change password and reset password are implemented separately in this project.

`src/routes/profile` demonstrates the implementation of `signIn` and `signOut` without using the built-in components in Auth.js, which are suggested by the documentation. It also implements everything for both server and client sides. Although the client-side functions here should work after enabling `csr` in `+layout.server.ts`, authentication will fail because it is performed using `event.locals`.

This project also implements the user management functions as API endpoints which are called in the components, hence they can be used as an independent backend.

## `sveltekit-auth` [preferred]

This project realises exactly the same functionalities as `sveltekit-authjs` except the absence of Magic Links, without using Auth.js. Everything is implemented from scratch following [Lucia](https://lucia-next.pages.dev/) guidelines.

This is SSR only, since authentication is performed using `event.locals` and form actions.

Unlike `sveltekit-authjs`, the user management functions are implemented directly in the form actions without API endpoints.

## How to use

1. Pick a project
2. Install dependencies: `bun i`
3. Create a `.env` file as follows
    ```
        MONGODB_URI=
        AUTH_SECRET=
        AUTH_MAXAGE=
        AUTH_SALT_ROUNDS=
        AUTH_GOOGLE_ID=
        AUTH_GOOGLE_SECRET=
        EMAIL_SERVER_HOST=
        EMAIL_SERVER_PORT=
        EMAIL_SERVER_USER=
        EMAIL_SERVER_PASSWORD=
        EMAIL_FROM=
      ```
4. Run: `bun run dev --port 5173`
   1. In a couple of places `http://localhost:5173` is hardcoded

## Why

While searching for an authentication solution for SvelteKit, I realised that MongoDB is overlooked by most libraries. Auth.js is a great and easy-to-use library with support for both SvelteKit and MongoDB. However, it is missing one thing: Credentials authentication with email verification. While it seems old, I still prefer to have it in my applications. Moreover, Auth.js is a bit opinionated and adapting it to custom data shapes can be a little annoying.

After implementing what is missing for me alongside Auth.js, I realised that I was not getting much value from Auth.js anymore, apart from JWT and Google OAuth. That was when I learnt that another library, Lucia, [was being deprecated because 'it is easier to teach authentication than making/using a library for it'](https://github.com/lucia-auth/lucia/discussions/1707) and I fully agreed. By following [Lucia's guidelines](https://lucia-next.pages.dev/), I made this clear and simple template that works. Just putting this here as the starting point for my future SvelteKit+MongoDB projects.