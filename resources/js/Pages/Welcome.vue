<script setup>
import TwAuthorCredit from '@/Components/media/TwAuthorCredit.vue';
import Layout from '../Layouts/Layout.vue';
</script>

<template>
<Layout>
    <section>
        <div class="bg-indigo-600 bg-no-repeat bg-cover py-36 relative"
            style="background-image: url('images/pages/home/home.WebP')"
            x-data="{
                form: { email: '', password: '' }
            }"
        >

                <tw-author-credit>
                    <!-- Image by natanaelginting on Freepik -->
                </tw-author-credit>

            <div>
                <div class="max-w-4xl mx-auto px-12 py-8 text-center">
                    <h1 class="text-3xl text-white font-black uppercase lg:text-6xl">INFINIDEA: Unleash Your Thoughts</h1>
                    <p class="py-6 text-lg max-w-xl mx-auto text-gray-100 xl:text-2xl leading-8">
                        Hey there! Welcome to Infinidea, a cool place for boundless inspiration and idea generation,
                        powered by cutting-edge AI technology.<br>
                        Dive into a world of endless possibilities and make your ideas come to life with a little dose of fun!
                        <br><br>
                    </p>
                    <Link :href="route('thematic.list')"
                        class="py-4 px-3 flex items-center justify-center text-xl font-black border-primary border-4 text-black rounded-full bg-yellow-400 hover:bg-yellow-300 lg:text-3xl lg-py-8 lg:px-6 transition-all duration-100 hover:text-black"
                        style="text-decoration: none;"
                    >
                        Get Started with Infinidea
                    </Link>
                </div>
            </div>
        </div>
    </section>
</Layout>
</template>
