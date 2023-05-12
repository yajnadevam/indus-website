<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import axios from 'axios';

export default {
  data() {
    return {
      profileHeader: 'Profile Header',
      profileBody: 'Profile Body',
      editing: false,
      editedProfileBody: '',
      editedProfileHeader: '',
      userType: 'd',
      loading: false,
      statusText: "",
      errorText: "",
    };
  },
  created() {
  

    if (!this.$store.state.user) {
      this.$router.push({ name: 'login' });
      return -1;
    } else {
      this.profileHeader = this.$store.state.user.header;
      this.profileBody = this.$store.state.user.body;
      console.log(JSON.stringify(this.$store.state.user));
      this.userType = this.$store.state.user.usertype;
    }
  },
  methods: {
    startEdit() {
      this.editing = true;
      this.editedProfileHeader = this.profileHeader;
      this.editedProfileBody = this.profileBody;
    },
    cancelEdit() {
      this.editing = false;
    },

    saveEdit() {
      this.profileHeader = this.editedProfileHeader;
      this.profileBody = this.editedProfileBody;
      var user = this.$store.state.user;
      user.header = this.profileHeader;
      user.body = this.profileBody;

      this.$store.commit("updateUser", user);
      
      axios.post("/api/updateUser", { user }).then(response => {
        console.log(JSON.stringify(response));
        this.editing = false;
      }).catch(error => {
        console.log(error);
      });
    },
    
    onSubmit() {
      this.loading = true;
      var user = this.$store.state.user;
      user.usertype = this.userType;

      this.$store.commit("updateUser", user);
      
      axios.post("/api/updateUser", { user }).then(response => {
        this.loading = false;
        this.errorText = "";
        this.statusText = "Successfully updated user!";
      }).catch(error => {
        this.statusText = "";
        this.errorText = "Error updating user!";
        console.log(error);
      });
    }
  },
};
</script>

<template>
  <div style="margin-left: 20%; margin-right: 17%; margin-top: 2%;">
    <h2>This is your profile</h2>
    <div style="display: grid; grid-template-columns: 97% 1fr;" v-if="!editing">
      <i-card style="grid-column: inherit;">
        <template #header>
          <h3>{{ profileHeader }}</h3> 
        </template>

      <p>{{ profileBody }}</p>
      </i-card>

    <i-button circle @click="startEdit" class="headerButton"> <icons-fas-pen-to-square size="20px" /> </i-button>
    </div>
    <div style="display: grid; grid-template-columns: 97% 1fr;" v-else>
      <i-card style="grid-column: inherit;">
        <template #header>
          <i-textarea v-model="editedProfileHeader" size="lg" placeholder="Enter your profile header here." /> 
        </template>
      <i-textarea v-model="editedProfileBody" placeholder="Enter your profile body here." />
      </i-card>
  
      <div>
        <i-button circle @click="saveEdit" class="headerButton"> <icons-fas-floppy-disk size="20px" /> </i-button> <br>
        <i-button circle @click="cancelEdit" class="headerButton"> <icons-fas-xmark size="20px" /> </i-button>
      </div>
    </div>
    
    <h3>Settings: </h3>
      <i-form @submit="onSubmit">
      <i-form-group><i-form-label>Usertype: </i-form-label>
        <i-radio-group name="userType" v-model="userType">
            <i-radio name="userType" value="d">Decipherer</i-radio>
            <i-radio name="userType" value="a">Archaeologist</i-radio>
        </i-radio-group>
      </i-form-group>
      
      <i-form-group>
          <i-button type="submit" :loading="loading">
              Submit
          </i-button>
          <p v-if="statusText">{{ statusText }}</p>
          <p style="color: red;" v-else-if="errorText">{{ errorText }}</p>
      </i-form-group>
      </i-form>
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

.float {
  display: inline;
  float: left;
  text-justify: left;
  align-content: middle;
  align-self: middle;
}

.headerButton {
  margin: 0.4rem;
}
</style>
