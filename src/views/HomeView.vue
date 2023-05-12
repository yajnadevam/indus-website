<script lang="ts">
  export default {
    data() {
      return {
        visible: true,
      };
    },
    watch: {
      visible: function(newVal) {
        this.$store.commit("invertUserShown");
      }
    },
  }
</script>

<template>
  <main>
    <div style="display: inline; padding-top: 3rem" >
      <i-alert dismissible color="info" v-if="this.$store.state.user && !this.$store.state.userShown" v-model="visible">
          <template #icon>
              <i-icon name="ink-info" />
          </template>
          <p>Successfully logged in as <b>{{ this.$store.state.user.username }} </b></p>
      </i-alert>

      <div style="display: inline-block; float: left; margin-left: 20%">
        <h1>
          Welcome to <br />
          the foremost database of <br />
          the Indus script. <br />
        </h1>
      </div>
      <div
        style="
          display: inline-block;
          float: right;
          text-justify: right;
          text-align: right;
          margin-right: 20%;
        "
      >
        <h1 class="indus_title">
          &#xE640; &#xE442; &#xE3EA; &#xE559; &#xE199; <br />
          &#xE22A; &#xE199; &#xE302; &#xE402; &#xE4EA; <br />
          &#xE47D; &#xE22A; &#xE566; &#xE248; &#xE464; &#xE542; &#xE37D;
          &#xE429; &#xE248; &#xE199; <br />
        </h1>
      </div>
    </div>

    <div style="clear: both"></div>

    <div
      style="
        float: right;
        text-justify: right;
        text-align: right;
        margin-right: 20%;
      "
    >
      <caption>
        (Based on decipherment efforts by
        <a
          href="https://www.academia.edu/78867798/Deciphering_Indus_script_as_a_cryptogram"
          >Yajnadevam</a
        >)
      </caption>
    </div>

    <article>
      <p class="lead">
        The Indus Script is a currently undeciphered script, that is mainly
        found in archaeological sites located in modern-day India and Pakistan,
        dating from 3500BCE to 1900BCE. It is also found in faraway places like
        modern-day Iraq, Israel and Bahrain.
      </p>
      <p>
        The following factors are usually regarded as the biggest obstacles to
        successful decipherment:
      </p>
      <ul>
        <li>
          <p>
            Inscriptions are very short. The average length of the inscriptions
            is around five signs, and the longest only 34 characters long, found
            on a copper plate belonging to the mature Harappan period.
            Inscriptions vary between just one and seven lines, with single
            lines being most common.
          </p>
        </li>
        <li>
          <p>
            There are doubts whether the Indus script records a written language
            or is instead a system of non-linguistic signs or proto-writing
            similar to merchant's marks and house marks, and to the contemporary
            accounting tokens and numerical clay tablets of Mesopotamia. Due to
            the brevity of inscriptions, some researchers have questioned
            whether Indus symbols are even capable of expressing a spoken
            language.
          </p>
        </li>
        <li>
          <p>
            The spoken Harappan language has not been identified, so, assuming
            it is a written language, the language the script is most likely to
            express is unknown. Some theorise that the language is Sanskrit, as
            it is the only well-attested language in northern India, however,
            this is a controversial view.
          </p>
        </li>
      </ul>
      <p>
        However, a recent potential decipherment by the Yajnadevam (a
        pseudonym), using Sanskrit. In this website, we contain some of his
        decipherments, along with the associated inscription.
      </p>
      <p>
        This website serves to catalog all currently available Indus
        inscriptions. It provides a convenient means of analysing of all
        characters and glyphs, in one location, that is available to all.
      </p>
    </article>
  </main>
</template>


<style lang="scss" scoped>
@import "@inkline/inkline/css/variables";
@import "@inkline/inkline/css/mixins";

article {
  margin-left: 20%;
  margin-right: 20%;
  margin-top: 5rem;
  margin-bottom: 4rem;
}

.indus_title {
  font-family: indus;
  font-size: 2.5em;
}
</style>
