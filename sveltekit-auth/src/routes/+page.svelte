<script lang="ts">
    import { page } from '$app/stores'
</script>

{#if $page.data.currentUser}
    <h1>Signed in</h1>

    <img
        src={$page.data.currentUser.image}
        alt="Profile"
    />

    <div>{JSON.stringify($page.data.currentUser)}</div>
{:else}
    <h1>Please sign in</h1>
{/if}
