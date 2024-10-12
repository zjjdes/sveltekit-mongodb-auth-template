<script lang="ts">
    let { children } = $props()
</script>

<svelte:head>
    <title>SvelteKit | Auth.js</title>
</svelte:head>

<nav>
    <a href="/">Home</a>
    <a href="/profile">Profile</a>
    <a href="/protected">Protected</a>
</nav>

<main>
    {@render children()}
</main>

<style>
    nav {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }
</style>
