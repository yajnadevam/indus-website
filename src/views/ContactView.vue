<script>
export default {
  data() {
    const options = [
      {
        id: 0,
        label: "Recommendation",
      },
      {
        id: 1,
        label: "Question",
      },
    ];

    return {
      name_value: null,
      selected: null,
      options,
    };
  },
};
</script>

<template>
  <div style="margin: auto" class="center">
    <div style="text-align: center">
      <h1>Contact Us</h1>
      <h4>Leave us any Questions if need be.</h4>
    </div>
    <div style="padding-left: 20%; padding-right: 20%">
      <i-form>
        <i-form-group>
          <i-select v-model="selected" :options="options" placeholder="Query">
            <template #prefix>
              <span><icons-fas-clipboard-question /></span>
            </template>
          </i-select>
        </i-form-group>

        <i-form-group>
          <i-textarea v-model="name_value" placeholder="Name">
            <template #prefix
              ><span><icons-fas-circle-user /> </span
            ></template>
          </i-textarea>
        </i-form-group>

        <i-form-group>
          <i-textarea v-model="email_value" placeholder="Email">
            <template #prefix
              ><span><icons-fas-envelope/> </span
            ></template>
          </i-textarea>
        </i-form-group>

        <i-form-group>
          <i-textarea
            v-model="query_value"
            placeholder="Query/Feedback"
            style="height: 10rem"
          />
        </i-form-group>

        <i-form-group style="margin-top: 5rem;">
          <i-button type="submit" :loading="loading"> Submit </i-button>
        </i-form-group>
      </i-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.center {
  float: center;
  justify-content: center;
}

</style>
