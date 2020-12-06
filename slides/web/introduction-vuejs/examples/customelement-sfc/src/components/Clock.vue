<template>
  <div>{{ value }}</div>
</template>

<script>
export default {
  name: "Clock",
  data() {
    return {
      value: "",
    };
  },
  created() {
    this.computeClock();
    setInterval(() => {
      this.computeClock();
    }, 1000);
  },
  methods: {
    computeClock() {
      this.value = new Date().toLocaleTimeString();
    },
  },
};
</script>

<style>
</style>
