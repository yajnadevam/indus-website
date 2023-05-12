<script lang="ts">
import axios from 'axios';
import { mapActions } from 'vuex';
import mapData from '../data/usefulMaps'

const {qualityMap, symbolMap} = mapData;

export default {
  created() {
    const sealId = this.$route.params.sealId;
    
    this.sealId = sealId;
    axios.get(`/api/getSeal/${sealId}`).then(response => {
      const sealInfo = response.data.sealInfo;
      console.log(JSON.stringify(sealInfo));

      this.sealText = sealInfo.toRender;
      this.site = sealInfo.NAME;
      this.writingDirection = sealInfo.DIRECTION;
      this.completeness = sealInfo.ISCOMPLETE;
      this.sealId = sealInfo.SEALID;
      this.cisiId = sealInfo.CISI;
      this.material = sealInfo.MATERIAL;
      this.museum = sealInfo.MUSEUM;
      this.width = sealInfo.WIDTH;
      this.height = sealInfo.HEIGHT;
      this.thickness = sealInfo.THICKNESS;
      this.iconographyQuality = qualityMap.get(sealInfo.QUALITY);
      if (symbolMap.get(sealInfo.DESCRIPTION).replace("Unkown", "").trim() === "Unknown") {
        this.iconographyDescription = null;
      } else {
        this.iconographyDescription = symbolMap.get(sealInfo.DESCRIPTION).replace("Unkown", "");
      }
      
      this.decipherments = response.data.decipherments[0];
      console.log(JSON.stringify(this.decipherments));
    });
  },
  data() {
    return {
      sealText: "",
      writingDirection: "",
      completeness: "",
      site: "",
      sealId: "",
      cisiId: "",
      material: "",
      museum: "",
      width: "",
      height: "",
      thickness: "",
      iconographyQuality: "",
      iconographyDescription: "",
      decipherments: [],
      modalVisible: false,
      deciphermentInput: "",
    }
  },
  methods: {
    updateDecipherment() {
      this.deciphermentInput
    },
    deleteDecipherment() {

    },
    addDecipherment() {

    }
  }
};
</script>

<template>

<div class="seal-view" style="display: grid; grid-template-columns: 1fr 97%;">
  <i-button circle @click="this.$router.go(-1)" class="headerButton"> <icons-fas-arrow-left size="40px" /> </i-button>

  <i-card style="padding-left: 1rem;">
    <template #header>
      <h1 v-html="sealText" class="indus-text" v-if="writingDirection && writingDirection === 'R/L'" style="text-align: right"></h1>
      <h1 v-html="sealText" class="indus-text" v-else></h1>
    </template>

    <div style="padding-left: 5%; padding-right: 5%;">
      <div class="cell" >
        <h2>Inscription Information</h2>
        <p v-if="writingDirection == 'R/L'"><strong>Writing Direction:</strong> Right-to-Left</p>
        <p v-else-if="writingDirection == 'L/R'"><strong>Writing Direction:</strong> Left-to-Right</p>
        <p v-if="completeness"><strong>Complete:</strong> {{ completeness }}</p>
        <p v-if="site"><strong>Site: </strong> {{ site }} </p>
      </div>

      <div class="cell">
        <h3 v-if="iconographyQuality">{{ iconographyQuality }}</h3>
        <h3 v-else>Seal</h3>
        <p v-if="sealId"><strong>ICIT ID:</strong> {{ sealId }}     </p>
        <p v-if="cisiId"><strong>CISI ID:</strong> {{ cisiId }}     </p>
        <p v-if="material"><strong>Material:</strong> {{ material }}  </p>
        <p v-if="museum"><strong>Museum:</strong> {{ museum }}      </p>
        <p v-if="iconographyDescription"><strong>Iconography:</strong> {{ iconographyDescription }}</p>

        <p v-if="width && height && thickness" >
          <strong>Dimensions:</strong>
            {{ Number(width).toFixed(2) }} x {{ Number(height).toFixed(2) }} x {{ Number(thickness).toFixed(2) }} mm
        </p>
        
        <p v-else-if="width && height">
          <strong>Dimensions:</strong>
            {{ Number(width).toFixed(2) }} x {{ Number(height).toFixed(2) }} mm
        </p>
      </div>
    </div>
  </i-card>
</div>

<div class="decipherment-view">
<h3>Decipherments</h3>

<i-card>
  <div v-for="d in decipherments" :key="d.USERNAME" v-if="decipherments.length >= 1">
      <p><strong>{{ d["USERNAME"] }}: </strong>{{d.TRANSLITERATION}}</p>
  </div>
  <div v-else><h5 style="text-align: center;">No decipherments exist for this inscription.</h5> </div>
</i-card>

</div>
</template>

<style scoped>
.seal-view {
  margin-top: 3rem;
  margin-bottom: 3rem;
  margin-left: 17%;
  margin-right: 20%;
}
.decipherment-view {
  margin-top: 3rem;
  margin-bottom: 3rem;
  margin-left: 20%;
  margin-right: 20%;
}
.indus-text {
  font-family: indus;
  font-size: 80px;
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 1rem;
}

.cell {
  font-size: 16px;
}

</style>
