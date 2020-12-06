<template>
  <div>
    <Clock/>
    <input v-model="value" type="text" />
    <p>{{ value }}</p>
  </div>
</template>

<script>
import Clock from "@/components/Clock.vue";
export default {
  name: "helloworld",
  data() {
    return {
      value: "HelloWorld",
    };
  },
  components: {
    Clock
  }
};
</script>

<style/>

