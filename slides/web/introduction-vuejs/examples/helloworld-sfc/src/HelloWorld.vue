<template>
  <div id="helloworld">
    <input v-model="value" type="text" />
    <p>{{ value }}</p>
  </div>
</template>

<script>
export default {
  name: "helloworld",
  data() {
    return {
      value: "HelloWorld",
    };
  },
};
</script>

<style>
#helloworld {
  text-align: center;
}
</style>
