<script>
	import GoMarkGithub from 'svelte-icons/go/GoMarkGithub.svelte';
	import FaInstagram from 'svelte-icons/fa/FaInstagram.svelte';
	import FaLinkedinIn from 'svelte-icons/fa/FaLinkedinIn.svelte';
</script>

<section class="flex items-center mx-auto w-fit h-7">
	<a href="https://github.com/Metaphysics0" target="_blank" rel="noreferrer">
		<GoMarkGithub />
	</a>
	<a
		href="https://www.instagram.com/mathrockryan/"
		target="_blank"
		rel="noreferrer"
	>
		<FaInstagram />
	</a>
	<a
		href="https://www.linkedin.com/in/ryanroberts0/"
		target="_blank"
		rel="noreferrer"
	>
		<FaLinkedinIn />
	</a>
</section>

<style>
	a {
		height: 100%;
		margin: 0 10px;
		opacity: 0.5;
		transition: all 0.3s ease;
	}
	a:hover {
		opacity: 1;
	}
</style>
