<script setup>
import HomeHero from '../components/home/HomeHero.vue'
import HomePartners from '../components/home/HomePartners.vue'
import HomeWhyUs from '../components/home/HomeWhyUs.vue'
import HomeHowItWorks from '../components/home/HomeHowItWorks.vue'
import HomeTestimonials from '../components/home/HomeTestimonials.vue'
import HomeFaq from '../components/home/HomeFaq.vue'
import HomeCta from '../components/home/HomeCta.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
import '../styles/home/index.css'
</script>

<template>
  <main>
    <HomeHero />
<!--    <HomePartners />-->
<!--    <HomeWhyUs />-->
    <HomeHowItWorks />
    <HomeTestimonials />
    <HomeFaq />
    <HomeCta />
    <HomeFooter />
  </main>
</template>
