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
   
    // Toggle between light and dark mode
    const toggleColorMode = () => {
      const mode = colorMode.value === "dark" ? "light" : "dark";

      inkline.options.colorMode = mode;
      colorMode.value = mode;
    };

    return {
      colorMode,
      toggleColorMode,
    };
  },
  watch: {
    "$inkline.options.colorMode"(newValue, oldValue) {
      this.colorMode = newValue;
    }
  },
  data() {
    return {
      form: this.$inkline.form({
        username: {
            validators: [
                { name: 'required' }
            ]
        },
        password: {
            validators: [
                { name: 'required' },
                { name: 'minLength', value: 8 },
                { name: 'custom', // numeric
                  message: 'Please enter at least one numeric character.',
                  validator: (v) => /[0-9]/.test(v)
                },
            ]
        },
        passwordConfirmation: {
            validators: [
                { name: 'sameAs', target: 'password', schema: () => this.form }
            ]
        }
      }),
      username: "",
      password: "",
      email: "",
      passwordConfirmation: "",
      userType: "d",
      errText: "",
    };
  },
  methods: {
    onRegister() {
      console.log(this.username + " " + this.password + " " + this.userType);

      axios.post('/api/register', {
        username: this.username,
        email: this.email,
        password: this.password,
        userType: this.userType
      }).then(response => {
        //Update Stored Username
        this.$store.commit("updateUser", response.data.user);
        console.log(response.data.user);
        
        this.errText = ""
        
        //Display login popup below navbar
        this.emitter.emit("updateLogin");
        
        //Navigate to home page
        this.$router.push("/");

      }).catch(error => {
        // Handle login Error
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

      <h3><span>Register to continue</span></h3>
    </div>

    <div style="padding-left: 30%; padding-right: 30%; padding-top: 1rem;">
      <i-form @submit="onRegister" v-model="form">
        <i-form-group>
          <i-input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your Username"
            name="username"
          />
          <i-form-error for="username" />
        </i-form-group>
        
        <i-form-group>
          <i-input
            id="email"
            v-model="email"
            type="text"
            placeholder="Enter your Email (Optional)"
            name="email"
          />
        </i-form-group>

        <i-form-group>
          <i-input
            id="password"
            name="password"
            type="password"
            v-model="password"
            placeholder="Enter your Password"
            :toggleMask="true"
            inputClass="w-full"
            inputStyle="padding:1rem"
          />
          <i-form-error for="password" />
        </i-form-group>

        <i-form-group>
          <i-input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            v-model="passwordConfirmation"
            placeholder="Confirm your Password"
            :toggleMask="true"
            inputClass="w-full"
            inputStyle="padding:1rem"
          />
          <i-form-error for="passwordConfirmation" />
        </i-form-group>
        
        <i-form-group>
            <i-form-label>Are you a decipherer or an archaeologist?</i-form-label>
            <i-radio-group name="userType" v-model="userType">
                <i-radio name="userType" value="d">Decipherer</i-radio>
                <i-radio name="userType" value="a">Archaeologist</i-radio>
            </i-radio-group>
        </i-form-group>

        <i-form-group>
          <p class="error" id="errorText"><strong> {{ errText }}</strong></p>
        </i-form-group>
      
        <i-form-group style="margin-top: 1.5rem;">
          <i-button type="submit"> Register </i-button>
        </i-form-group>
      </i-form>
        
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
