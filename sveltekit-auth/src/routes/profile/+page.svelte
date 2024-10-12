<script lang="ts">
    import { page } from '$app/stores'
    import { enhance } from '$app/forms'

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

<h1>Server side</h1>

{#if $page.data.currentUser}
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
        <button><a href="/auth/google">Sign in with Google</a></button>
    </div>
{/if}
