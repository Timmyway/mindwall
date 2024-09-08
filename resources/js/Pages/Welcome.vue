<script setup>
import TwAuthorCredit from '@/Components/media/TwAuthorCredit.vue';
import Layout from '../Layouts/Layout.vue';
</script>

<template>
<Layout no-style>
    <section class="mw-welcome bg-indigo-600 bg-no-repeat bg-cover" style="background-image: url('images/pages/login/human-x-machine.WebP');">
        <div class="pt-10 relative lg:pt-20">

                <tw-author-credit>
                    <!-- Image by natanaelginting on Freepik -->
                </tw-author-credit>

            <div>
                <div class="max-w-4xl mx-auto px-12 py-2 text-center">
                    <h1 class="text-3xl text-white font-black uppercase lg:text-6xl">MINDWALL: Unleash Your Thoughts</h1>
                    <p class="py-6 text-lg max-w-xl mx-auto text-gray-100 xl:text-2xl leading-8">
                        Hey there! Welcome to Mindwall, a cool place for boundless inspiration and idea generation,
                        powered by Google Gemini.<br>
                        Dive into a world of endless possibilities and make your ideas come to life with a little dose of fun!
                        <br><br>
                    </p>
                    <Link :href="route('thematic.list')"
                        class="call-to-action-button mt-32 py-4 px-3 flex items-center justify-center text-xl font-black border-primary border-4 text-black rounded-full bg-yellow-400 hover:bg-yellow-300 lg:text-3xl lg-py-8 lg:px-6 transition-all duration-100 hover:text-black"
                        style="text-decoration: none;"
                    >
                        Get Started with Mindwall
                    </Link>
                </div>
            </div>
        </div>
    </section>
</Layout>
</template>

<style>
.mw-welcome {
    height: calc(100vh - 160px);
}
@keyframes futuristic-glow {
  0% {
    box-shadow: 0 0 5px rgb(255, 209, 102), 0 0 10px rgb(255, 209, 102), 0 0 15px rgb(255, 209, 102), 0 0 20px #29335C, 0 0 30px #29335C;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 10px rgb(255, 209, 102), 0 0 20px rgb(255, 209, 102), 0 0 30px rgb(255, 209, 102), 0 0 40px #29335C, 0 0 60px #29335C;
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 5px rgb(255, 209, 102), 0 0 10px rgb(255, 209, 102), 0 0 15px rgb(255, 209, 102), 0 0 20px #29335C, 0 0 30px #29335C;
    transform: scale(1);
  }
}

.call-to-action-button {
  background-color: rgb(255, 209, 102);
  color: #29335C;
  border: none;
  padding: 30px 30px;
  /* font-size: 18px; */
  cursor: pointer;
  /* border-radius: 5px; */
  transition: all 0.3s ease-in-out;
  animation: futuristic-glow .7s infinite;
}

.call-to-action-button:hover {
  transform: scale(1.1);
}
</style>
