<script lang="ts">
    import { page } from '$app/stores'
    import { enhance } from '$app/forms'
    import { signIn, signOut } from '@auth/sveltekit/client' // this is for client side
    import { browser } from '$app/environment'

    let { form } = $props()

    // Signin credentials
    let email = $state('tester@example.com')
    let password = $state('testpassword')

    // Registration data
    let newUser: App.RegisterSchema = $state({
        email: 'tester@example.com',
        password: 'testpassword',
        name: 'John Doe',
    })
</script>

<!-- Message returned from form actions, if any -->
<div>
    <strong>Form return: </strong>{JSON.stringify(form?.message)}
</div>

<!-- On server side, use form actions from Auth.js -->
<h1>Server side</h1>

{#if $page.data.session}
    <form
        method="POST"
        action="?/signout"
        use:enhance
    >
        <button type="submit">Signout</button>
    </form>

    <form
        method="POST"
        action="?/changePassword"
        use:enhance
    >
        <input
            type="password"
            name="newPassword"
        />

        <button type="submit">Change password</button>
    </form>
{:else}
    <div>
        <h3>Provider: Credentials</h3>
        <h4>Signin</h4>
        <form
            method="POST"
            action="?/signin"
            use:enhance
        >
            <!-- Provide parameters to form actions as hidden inputs -->
            <!-- This specifies the provider for signIn -->
            <input
                type="hidden"
                name="providerId"
                value="credentials"
            />
            <input
                type="hidden"
                name="redirectTo"
                value="/"
            />

            <input
                type="email"
                name="email"
                bind:value={email}
                required
            />
            <input
                type="password"
                name="password"
                bind:value={password}
                required
            />
            <button type="submit">Signin with Credentials</button>
        </form>

        <h4>Register</h4>
        <form
            method="POST"
            action="?/register"
            use:enhance
        >
            <input
                type="email"
                name="email"
                bind:value={newUser.email}
                required
            />
            <input
                type="password"
                name="password"
                bind:value={newUser.password}
                required
            />
            <input
                type="text"
                name="name"
                bind:value={newUser.name}
                required
            />
            <button type="submit">Register with Credentials</button>
        </form>

        <h4>Reset password</h4>
        <form
            method="POST"
            action="?/resetPassword"
            use:enhance
        >
            <input
                type="text"
                name="email"
                bind:value={email}
            />

            <button type="submit">Reset password</button>
        </form>
    </div>

    <div>
        <h3>Provider: Google</h3>
        <form
            method="POST"
            action="?/signin"
            use:enhance
        >
            <input
                type="hidden"
                name="providerId"
                value="google"
            />
            <input
                type="hidden"
                name="redirectTo"
                value="/"
            />

            <button type="submit">Signin with Google</button>
        </form>
    </div>

    <div>
        <!-- Note that the built-in SignIn component in @auth/sveltekit does not recognise -->
        <!-- the providerId 'nodemailer', instead it uses 'email' -->
        <!-- As at 10/10/2024 -->
        <h3>Provider: Nodemailer (Magic Links)</h3>
        <form
            method="POST"
            action="?/signin"
            use:enhance
        >
            <input
                type="hidden"
                name="providerId"
                value="nodemailer"
            />
            <input
                type="hidden"
                name="redirectTo"
                value="/"
            />

            <input
                type="email"
                name="email"
                bind:value={email}
                required
            />
            <button type="submit">Signin with Magic Links</button>
        </form>
    </div>
{/if}

<!-- On client side, use signIn and signOut from @auth/sveltekit/client -->
<h1>
    Client side
    {#if !browser}
        (DISABLED)
    {/if}
</h1>

{#if $page.data.session}
    <button onclick={() => signOut()}>Signout</button>
{:else}
    <div>
        <h3>Provider: Credentials</h3>

        <input
            type="email"
            name="email"
            bind:value={email}
            required
        />
        <input
            type="password"
            name="password"
            bind:value={password}
            required
        />

        <button onclick={() => signIn('credentials', { email, password })}>
            Signin with Credentials
        </button>
    </div>

    <div>
        <h3>Provider: Google</h3>
        <button onclick={() => signIn('google')}>Sign in with Google</button>
    </div>

    <div>
        <h3>Provider: Email (Magic Links)</h3>
        <input
            type="text"
            bind:value={email}
            required
        />
        <button onclick={() => signIn('nodemailer', { email })}>Sign in with Magic Links</button>
    </div>
{/if}
