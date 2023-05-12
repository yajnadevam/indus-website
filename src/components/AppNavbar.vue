<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import axios from "axios";

export default defineComponent({
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
});
</script>

<template>
  <i-navbar>
    <i-navbar-brand to="/">
      <img
        src="../assets/Logo-White.svg"
        class="logo -white"
        style="width: 80px; height: 80px"
      />
      <img
        src="../assets/Logo-Black.svg"
        class="logo -black"
        style="width: 80px; height: 80px"
      />
    </i-navbar-brand>
    <i-navbar-collapsible>
      <i-nav>
        <!-- <i-nav-item to="/"> Home </i-nav-item> -->
        <i-nav-item  to="/search" style="padding-top: 0.5rem; padding-bottom: 0.5rem;"> Search </i-nav-item>
        <i-nav-item  to="/contact" style="padding-top: 0.5rem; padding-bottom: 0.5rem;"> Contact </i-nav-item>
        <i-nav-item  to="/decipherment" style="padding-top: 0.5rem; padding-bottom: 0.5rem;" v-if="this.$store.state.user && this.$store.state.user.usertype === 'd'"> My Decipherments </i-nav-item>
        <i-nav-item  to="/assignment" style="padding-top: 0.5rem; padding-bottom: 0.5rem;" v-else-if="this.$store.state.user && this.$store.state.user.usertype === 'a'"> My Assignments </i-nav-item>
      </i-nav>
    </i-navbar-collapsible>
    <i-navbar-collapsible class="_justify-content:end">
      <i-nav>
        <i-nav-item  @click="toggleColorMode" style="padding-top: 1rem; padding-bottom: 1rem; display: flex; align-items: center;">
          <icons-fas-moon v-if="colorMode === 'light'" size="20px" />
          <icons-fas-sun v-else size="20px" />
        </i-nav-item>

        <i-nav-item to="/profile" style="padding-top: 1rem; padding-bottom: 1rem; display: flex; align-items: center;" v-if="this.$store.state.user">
          <icons-fas-circle-user size="20px"/>
          <a style="margin-left: 0.4rem;" id="username" >{{ this.$store.state.user.username }}</a>
        </i-nav-item>

        <i-nav-item to="/login" style="padding-top: 1rem; padding-bottom: 1rem; display: flex; align-items: center;" v-else>
          <icons-fas-circle-user size="20px"/>
        </i-nav-item>
      </i-nav>
      <!-- <i-input placeholder="Type something.."> -->
      <!--     <template #append> -->
      <!--         <i-button color="primary"> -->
      <!--             <i-icon name="ink-search" /> -->
      <!--         </i-button> -->
      <!--     </template> -->
      <!-- </i-input> -->
    </i-navbar-collapsible>
  </i-navbar>

  <div id="alertContainer"></div>
  
</template>

<style lang="scss">
@import "@inkline/inkline/css/variables";
@import "@inkline/inkline/css/mixins";

.alert {
  margin-top: 0.5rem;
  margin-left: 20rem;
  margin-right: 20rem;

  padding-left: 1rem;
  padding-right: 1rem;
}


@include i-navbar() {
  ----border-radius: 0;
  --padding-bottom: 0.5rem;
  --padding-top: 0.3rem;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  transition-duration: var(--transition-duration);
  transition-timing-function: var(--transition-easing);
  transition-property: background-color;
  border-top: 0;
  border-left: 0;
  border-right: 0;
  .logo {
    height: 24px;
    width: auto;
    margin-right: spacing("1/2");
  }
  .nav {
    .nav-item {
      ----border-radius: var(--border-radius);
      background: transparent;
      cursor: pointer;
      display: inline-flex;
    }
  }
  #navbar-item-docsearch {
    padding-top: 0;
    padding-bottom: 0;
  }
  @include variant("light") {
    ----background: var(--color--white);
    ----border-bottom-color: var(--color--gray-10);
    .logo.-white {
      display: none;
    }
  }
  @include variant("dark") {
    .logo.-black {
      display: none;
    }
  }
  /**
     * Responsive design
     */
  @media screen and (max-width: 360px) {
    .navbar-brand {
      margin-right: 0;
      img {
        margin-right: 0;
      }
      span {
        display: none;
      }
    }
  }
  @include breakpoint-down("xs") {
    #navbar-item-documentation {
      span:first-child {
        display: inline-block;
      }
      span:last-child {
        display: none;
      }
    }
  }
  @include breakpoint-up("sm") {
    #navbar-item-documentation {
      span:first-child {
        display: none;
      }
      span:last-child {
        display: inline-block;
      }
    }
  }
}

</style>
