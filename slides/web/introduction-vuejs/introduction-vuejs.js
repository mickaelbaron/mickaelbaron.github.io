const {
  createApp,
  ref,
  getCurrentInstance,
  reactive,
  toRefs,
  computed,
  watch,
  watchEffect,
  provide,
  inject,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
} = Vue;

// HelloWorld => slide 6-1
createApp({
  setup() {
    const value = ref("Helloworld");
    return { value };
  },
}).mount("#helloworld");

// ref => slide 8-4
createApp({
  setup() {
    const value = ref("HelloWorld");
    console.log(value.value);
    value.value = "HelloWorld2";

    return {
      value,
    };
  },
}).mount("#app-ref");

// reactive => slide 8-6
createApp({
  setup() {
    const data = reactive({ myprop: "HelloWorld" });
    console.log(data.myprop);
    data.myprop = "HelloWorld2";

    return {
      data,
    };
  },
}).mount("#app-reactive");

// reactive => slide 8-6
createApp({
  setup() {
    const data = reactive({
      myprop1: "HelloWorld1",
      myprop2: "HelloWorld2",
    });

    return { ...toRefs(data) };
  },
}).mount("#app-reactivetorefs");

// v-model => slide 9-3
createApp({
  setup() {
    const value = ref("Helloworld");
    return { value };
  },
}).mount("#app-vmodel");

// v-bind => slide 9-4
createApp({
  setup() {
    const value = ref("Helloworld");
    return { value };
  },
}).mount("#app-vbind");

// v-if & v-show => slide 9-6
createApp({
  setup() {
    const show = ref(true);
    return { show };
  },
}).mount("#app-cond");

// v-for => slide 9-8
createApp({
  setup() {
    const tab = ref(["rouge", "bleu", "blanc"]);
    const obj = ref({ p1: "val1", p2: "val2", p3: "val3" });
    return { tab, obj };
  },
}).mount("#app-vfor");

// v-on => slide 9-10
createApp({
  setup() {
    const value = ref(0);

    function increase() {
      value.value++;
    }
    function decrease() {
      value.value--;
    }

    return { value, increase, decrease };
  },
}).mount("#app-von");

// v-html & v-text & v-once & v-pre => 9-12
createApp({
  setup() {
    const html = ref("<b>HelloWorld</b>");
    const value = ref("HelloWorld");

    return { html, value };
  },
}).mount("#app-directives");

// Instancier un composant => 10-4
let clock = {
  template: `<div>{{ clock }}</div>`,
  setup() {
    const clock = ref(new Date().toLocaleTimeString());

    setInterval(() => {
      computeClock();
    }, 1000);

    function computeClock() {
      clock.value = new Date().toLocaleTimeString();
    }

    return { clock };
  },
};

const parentClock = createApp({
  setup() {
    const value = ref("HelloWorld");

    return { value };
  },
});
parentClock.component("Clock", clock);
parentClock.mount("#app-instance");

// Computed => 10-6
createApp({
  setup() {
    const value = ref("HelloWorld");
    const messageLength = computed(() => value.value.length);

    return {
      value,
      messageLength,
    };
  },
}).mount("#app-computed");

// Computed Writable => 10-7
createApp({
  setup() {
    const value = ref("HelloWorld");
    const writableValue = computed({
      get() {
        return value.value;
      },
      set(newValue) {
        if (newValue.length <= 10) {
          value.value = newValue;
        }
      },
    });
    return {
      value,
      writableValue,
    };
  },
}).mount("#app-computed-setter");

// Watch => 10-9
createApp({
  setup() {
    const value = ref("");
    const message = ref("Parfait");
    watch(value, (newValue, oldValue) => {
      if (newValue.length > 10) {
        message.value = "Trop Grand";
      } else {
        message.value = "Parfait";
      }
    });
    return {
      value,
      message,
    };
  },
}).mount("#app-watch");

// WatchEffect => 10-10
createApp({
  setup() {
    const val1 = ref("");
    const val2 = ref("");
    const text = ref(" ");

    const stop = watchEffect(
      () => (text.value = val1.value + " " + val2.value)
    );

    function stopWatch() {
      stop();
    }
    return {
      val1,
      val2,
      text,
      stopWatch,
    };
  },
}).mount("#app-watcheffect");

// Lifecycle => 10-13
createApp({
  setup() {
    console.log("before Create");
    const value = ref("HelloWorld");

    onBeforeMount(() => {
      console.log("Before Mount: " + value.value);
    });

    onMounted(() => {
      console.log("Mounted: " + value.value);
    });

    onBeforeUpdate(() => {
      console.log("Before Update: " + value.value);
    });

    onUpdated(() => {
      console.log("Updated: " + value.value);
    });

    onBeforeUnmount(() => {
      console.log("Before Umount: " + value.value);
    });

    onUnmounted(() => {
      console.log("Umounted: " + value.value);
    });

    console.log("after Created: " + value.value);

    return {
      value,
    };
  },
}).mount("#app-lifecycle");

// Props => 11-3
let clockProps = {
  template: `<div>{{ clock }} {{ message }}</div>`,
  props: {
    message: String,
  },
  setup() {
    const clock = ref(new Date().toLocaleTimeString());

    setInterval(() => {
      computeClock();
    }, 1000);

    function computeClock() {
      clock.value = new Date().toLocaleTimeString();
    }

    return { clock };
  },
};

const parentClockProps = createApp({
  setup() {
    const value = ref("HelloWorld");

    return { value };
  },
});
parentClockProps.component("Clock", clockProps);
parentClockProps.mount("#app-props");

// Provide/Inject => 11-6
const clockDisplayProvide = {
  template: `{{ message }}`,
  setup() {
    const message = inject("message");

    return { message };
  },
};

const clockProvide = {
  template: `{{ clock }} <ClockDisplayProvide></ClockDisplayProvide>`,
  components: {
    ClockDisplayProvide: clockDisplayProvide,
  },
  setup() {
    const clock = ref(new Date().toLocaleTimeString());

    setInterval(() => {
      computeClock();
    }, 1000);

    function computeClock() {
      clock.value = new Date().toLocaleTimeString();
    }

    return { clock };
  },
};

const appProvide = createApp({
  setup() {
    const value = ref("HelloWorld");
    provide("message", value);

    return { value };
  },
});
appProvide.component("Clock", clockProvide);
appProvide.mount("#app-provide");

// CustomEvent => 11-9
const clockCustomEvent = {
  template: `<button v-on:click="$emit('save-clock', clock)">{{clock}}</button>`,
  setup() {
    const clock = ref(new Date().toLocaleTimeString());

    setInterval(() => {
      computeClock();
    }, 1000);

    function computeClock() {
      clock.value = new Date().toLocaleTimeString();
    }

    return { clock };
  },
};

const parentCustomEvent = createApp({
  setup() {
    const value = ref("HelloWorld");

    function saveClock(currentClock) {
      value.value = currentClock;
    }

    return { value, saveClock };
  },
});
parentCustomEvent.component("Clock", clockCustomEvent);
parentCustomEvent.mount("#app-customevent");

// ComponentVModel => 11-12
const FormInput = {
  template: `<input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`,
  props: {
    modelValue: String,
  },
  setup() {},
};

const parentComponentVModel = createApp({
  setup() {
    const person = reactive({ name: "" });

    return { person };
  },
});
parentComponentVModel.component("forminput", FormInput);
parentComponentVModel.mount("#app-componentvmodel");

// MultipleComponentVModel => 11-12
const MultipleFormInput = {
  template: `<input :value="name" @input="$emit('update:name', $event.target.value)" />
             <input :value="city" @input="$emit('update:city', $event.target.value)" />`,
  props: {
    name: String,
    city: String,
  },
  setup() {},
};

const parentMultipleComponentVModel = createApp({
  setup() {
    const person = reactive({ name: "", city: "" });

    return { person };
  },
});
parentMultipleComponentVModel.component("multipleforminput", MultipleFormInput);
parentMultipleComponentVModel.mount("#app-multiplecomponentvmodel");

// State manager => 11-11
const debug = true;
const state = reactive({
  message: "HelloWorld",
});

function setMessage(newValue) {
  if (debug) console.log("setMessage triggered with ", newValue);

  state.message = newValue;
}

const readable = {
  template: `{{ state.message }}`,

  setup() {
    return { state };
  },
};

const writable = {
  template: `<input v-model="state.message" type="text" />`,

  setup() {
    return { state };
  },
};

const appStateManager = createApp({
  setup() {
    const message = computed({
      get() {
        return state.message;
      },
      set(newValue) {
        setMessage(newValue);
      },
    });

    return { message };
  },
});
appStateManager.component("Readable", readable);
appStateManager.component("Writable", writable);
appStateManager.mount("#app-statemanager");

// Ref => 11-14
const child = {
  template: `Enfant`,
  setup() {
    const instance = getCurrentInstance();
    function callChild() {
      instance.proxy.$parent.callParent("Hello from Child");
    }

    return { callChild };
  },
};

const appReference = createApp({
  setup() {
    const refChild = ref(null);
    const value = ref("");

    function callParent(pValue) {
      value.value = pValue;
    }

    return { value, refChild, callParent };
  },
});
appReference.component("Child", child);
appReference.mount("#app-ref-component");
