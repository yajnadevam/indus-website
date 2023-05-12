import { createApp, h } from "vue";
import { createStore } from "vuex";
import mitt from "mitt";
import App from "./App.vue";
import router from "./router";

import { Inkline, components } from "@inkline/inkline";
import "@inkline/inkline/inkline.scss";

import "./main.scss";

//Event bus integration
const emitter = mitt();

const store = createStore({
  state() {
    return {
      user: null,
      userShown: false,
      searchRes: new Map(),
    };
  },
  mutations: {
    updateUser(state, newUser) {
      state.user = newUser;
      state.userShown = false;
    },
    invertUserShown(state) {
      state.userShown = !state.userShown;
    },
    updateSearchRes(state, newValue) {
      state.searchRes.set(newValue.query, newValue.res);
    }
  },
});

const app = createApp(App);

app.use(router);

app.use(Inkline, {
  components,
  colorMode: "system",
});

app.use(store);
app.config.globalProperties.emitter = emitter;

app.component('transition', {
  setup(_, { slots }) {
    return () => h('transition', {
      enterActiveClass: 'fade-enter-active',
      enterFromClass: 'fade-enter',
      enterToClass: 'fade-enter-active',
      leaveActiveClass: 'fade-leave-active',
      leaveFromClass: 'fade-leave-to',
      leaveToClass: 'fade-leave-active',
    }, slots.default())
  }
});

app.mount("#app");
