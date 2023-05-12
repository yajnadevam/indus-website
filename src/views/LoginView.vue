<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import axios from 'axios';

export default {
  setup() {
    const inkline = inject("inkline", {} as any);
    const colorMode = ref(inkline.options.colorMode);

    // Set the initial color mode value to determine the icon to be displayed
    if (colorMode.value === "system" && typeof window !== "undefined") {
      colorMode.value = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
    }

    return {
      colorMode,
    };
  },
  watch: {
    "$inkline.options.colorMode"(newValue, oldValue) {
      this.colorMode = newValue;
    }
  },
  data() {
    return {
      username: "",
      password: "",
      checked: false,
      errText: "",
    };
  },
  methods: {
    onLogin() {
      console.log(this.username + this.password);
      axios.post('/api/login', {
        username: this.username,
        password: this.password
      }).then(response => {
        // Handle Successful Login
        // alert("Sucessful Login!");
        //Update Stored Username
        this.$store.commit("updateUser", response.data.user);
        this.errText = ""

        //Display login popup below navbar
        this.emitter.emit("updateLogin");
        
        //Navigate to home page
        this.$router.push("/");
      }).catch(error => {
        // Handle login Error
        console.log(JSON.stringify(error));
        this.errText = error.response.data.message;
        console.log(error);
      })
    }
  }
};
</script>

<template>
  <div style="margin: auto" class="center">
    <div style="text-align: center">
      <img
        src="../assets/Logo-White.svg"
        alt="Indus logo"
        class="logo -white"
        v-if="colorMode === 'dark'"
        style="width: 15%; height: auto"
      />
      <img
        src="../assets/Logo-Black.svg"
        alt="Indus logo"
        class="logo -black"
        style="width: 15%; height: auto"
        v-else
      />

      <h3><span>Login to continue</span></h3>
    </div>

    <div style="padding-left: 30%; padding-right: 30%; padding-top: 1rem;">
      <i-form @submit="onLogin">
        <i-form-group>
          <i-input
            id="username"
            v-model="username"
            type="text"
            placeholder="Username"
          />
        </i-form-group>

        <i-form-group>
          <i-input
            id="password"
            type="password"
            v-model="password"
            placeholder="Password"
            :toggleMask="true"
            inputClass="w-full"
            inputStyle="padding:1rem"
          />
        </i-form-group>

        <i-form-group>
          <p class="error" id="errorText"><strong> {{ errText }}</strong></p>
        </i-form-group>
      
        <i-form-group style="margin-top: 1.5rem;">
          <i-button type="submit"> Log In </i-button>
        </i-form-group>
      </i-form>

      <p>Register 
        <router-link to="/register">here</router-link>
        if you haven't done so. </p>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@import "@inkline/inkline/css/variables";
@import "@inkline/inkline/css/mixins";

.center {
  float: center;
  justify-content: center;
}

.error {
  color: red;
}
</style>
