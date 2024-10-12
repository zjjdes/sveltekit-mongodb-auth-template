<script lang="ts">
    import { enhance } from '$app/forms'

    const { data, form } = $props()

    const userId = data.userId
    const token = data.token
</script>

<!-- Message returned from form actions, if any -->
<div>
    <strong>Form return: </strong>{JSON.stringify(form?.message)}
    {#if form?.ok}
        <a href="/profile">Signin</a>
    {/if}
</div>

<form
    method="POST"
    action="?/resetPassword"
    use:enhance
>
    <label for="password">New Password</label>
    <input
        type="text"
        name="userId"
        value={userId}
        hidden
    />
    <input
        type="text"
        name="token"
        value={token}
        hidden
    />

    <input
        id="password"
        type="password"
        name="newPassword"
        required
    />

    <button type="submit">Change password</button>
</form>
