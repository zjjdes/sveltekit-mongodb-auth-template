<script lang="ts">
    const { data } = $props()
    const verified = data.verified
</script>

{#if verified}
    <h1>Verified</h1>
    <p>Your email has been verified.</p>
    <button><a href="/profile">Signin/Signout</a></button>
{:else}
    <h1>Not Verified</h1>
    <p>Email verification failed.</p>
{/if}
