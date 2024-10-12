<script lang="ts">
    import { page } from '$app/stores'
</script>

{#if $page.data.session}
    <h1>Signed in</h1>

    <img
        src={$page.data.session.user.image}
        alt="Profile"
    />

    <div>{JSON.stringify($page.data.session)}</div>
{:else}
    <h1>Please sign in</h1>
{/if}
