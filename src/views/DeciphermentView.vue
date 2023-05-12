<script lang="ts">
import axios from 'axios'
  
export default {
created() {
  if (!this.$store.state.user) {
    this.$router.push('/login');
    return -1;
  } else {
    this.username = this.$store.state.user.username;
    this.resyncTable();
  }
},

data() {
  return {
    username: "",
    decipherments: [],
    deciphermentState: [],
    creating: false,
    createId: "",
    createDirection: "",
    createText: "",
    createTransliteration: "",
    createLoading: false,
    createErrText: "",
    createForm: this.$inkline.form({
      icit: {
        validators: [
          { name: 'custom', message: "Please enter a valid ICIT ID", validator: this.checkId}
        ]
      },
      transliteration: {},
    })
  }
},
methods: {
  resyncTable() {
    axios.post('/api/decipherments', { username: this.username }).then(response => {
      this.decipherments = response.data.decipherments;
      this.deciphermentState = this.decipherments.map(i => {
        return {
          editing: false,
          loading: false,
          input: i.TRANSLITERATION,
        };
      });
    });
  },
  goToSeal(sealId) {
    this.$router.push({ name: 'seal', params: { sealId, } });
  },
  onDeciphermentUpdate(index) {
    this.deciphermentState[index].editing = false;
    this.deciphermentState[index].loading = true;
    const newTransliteration = this.deciphermentState[index].input; 
    const username = this.username;
    const sealId = this.decipherments[index].SEALID;

    axios.post('/api/updateDecipherment', { newTransliteration, username, sealId }).then(response => {
      console.log("Successfully updated decipherment!");
      this.resyncTable();
    })
  },
  cancelChanges(index) {
    this.deciphermentState[index].editing = false;
    this.deciphermentState[index].input = this.decipherments[index].TRANSLITERATION;
  },
  
  onDeciphermentDelete(index) {
    this.deciphermentState[index].editing = false;
    this.deciphermentState[index].loading = true;
    const username = this.username;
    const sealId = this.decipherments[index].SEALID;

    axios.post('/api/deleteDecipherment', { username, sealId }).then(response => {
      console.log("Successfully deleted decipherment!");
      this.resyncTable();
    });
  },
  async checkId(v) {
    try {
      const response = await axios.get(`/api/checkId/${encodeURIComponent(v)}`);
      if (response.data.toReturn.direction || response.data.toReturn.toRender) {
        this.createDirection = response.data.toReturn.direction;
        this.createText = response.data.toReturn.toRender;
        if (this.createErrText !== "Cannot create duplicate decipherment entries") {
          this.createErrText = "";
        }
        return true;
      } else {
        this.createDirection = "";
        this.createText = "";
        this.createErrText = "Could not find ICIT ID";
        return false;
      }
    } catch (err) {
      this.createDirection = "";
      this.createText = "";
      this.createErrText = "Could not find ICIT ID";
      return false;
    }
  },
  onDeciphermentCreate() {
    if (this.createErrText) {
      return ;
    } else if (this.decipherments.map((decipherment) => decipherment.SEALID).indexOf(Number(this.createId)) != -1) {
      this.createErrText = "Cannot create duplicate decipherment entries";
      return ;
    } else {
      this.createLoading = true;

      const newTransliteration = this.createTransliteration; 
      console.log(newTransliteration);
      const username = this.username;
      const sealId = this.createId;


      axios.post('/api/updateDecipherment', { newTransliteration, username, sealId }).then(async response => {
        console.log("Successfully updated decipherment!");
        this.createLoading = false;
        this.createForm.icit.value = "";
        this.createForm.transliteration.value = "";
        this.creating = false;

        this.resyncTable();
      });
    }
  },
},
}
</script>

<template>
  <div style="margin: auto; padding-bottom: 20rem;" class="center">
    <h3>
      My Decipherments
    </h3>
    <div style="display: grid; grid-template-columns: 97% 1fr;" >
      <i-card v-if="creating" style="margin-bottom: 5rem;" >
        <i-form style="display: grid; grid-template-columns: 1fr 1fr;" v-model="createForm">
          <div>
          <i-form-group inline class="form-group">
            <i-form-label placement="left" >ICIT ID: </i-form-label>
            <span><i-input name="icit" id="icit" style="width: 100%" v-model="createId" placeholder="Enter ICIT ID" /></span>
          </i-form-group>

          <i-form-group inline class="form-group">
            <i-form-label placement="left">Transliteration: </i-form-label>
            <span><i-input name="transliteration" id="transliteration" style="width: 100%" v-model="createTransliteration" placeholder="Enter Transliteration" /></span>
          </i-form-group>
          </div>

          <div>
            <i-form-group inline v-if="createDirection" class="form-group">
              <i-form-label placement="left">Direction: </i-form-label>
              {{ createDirection }}
            </i-form-group>

            <i-form-group inline v-if="createText" class="form-group">
              <i-form-label placement="left">Inscription Text: </i-form-label>
              <a v-html="createText" class="indus-text"></a>
            </i-form-group>
            
            <i-form-label style="color: red;" v-if="createErrText">{{ createErrText }}</i-form-label>
          </div>
          
          <i-button :loading="createLoading" @click="onDeciphermentCreate"> 
            Submit Decipherment
          </i-button>
        </i-form>
      </i-card>
      <div v-if="creating"><span></span></div>
      
      <i-table class="table" style="padding-top: 2rem;" id="table" responsive striped>
        <thead>
          <th width="8%">ID</th>
          <th width="10%">Direction</th>
          <th width="30%">Text</th>
          <th width="50%">Decipherment</th>
          <th width="2%">View Inscription</th>
        </thead>
        <tbody v-if="decipherments.length === 0"> 
          <tr>
            <td colspan="5" style="text-align:center">No decipherments found</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(item, index) in decipherments" :key="index">
            <th scope="row">{{  item["SEALID"] }}</th>
            <td><div class="cell">{{ item["DIRECTION"] }}</div></td>
            <td><div class="cell indus-text" v-html="item['toRender']" width="100%" style="text-align: right" v-if="item['DIRECTION'] === 'R/L'"></div>
            <div class="cell indus-text" v-html="item['toRender']" width="100%" v-else></div>
            </td>
            <td>
              <i-form>
                <i-form-group inline >
                  <i-input v-model="deciphermentState[index].input" v-if="deciphermentState[index].editing" style="margin-right: 10px;"/>
                  <i-input v-model="deciphermentState[index].input" v-else disabled style="margin-right: 10px;"/>

                  <div v-if="deciphermentState[index].editing"> 
                    <i-button circle @click="onDeciphermentUpdate(index)" class="headerButton"> <icons-fas-floppy-disk size="10px" /> </i-button>
                    <i-button circle @click="cancelChanges(index)" class="headerButton"> <icons-fas-xmark size="10px" /> </i-button>
                  </div>

                  <div v-else> 
                    <i-button circle @click="deciphermentState[index].editing = true;" class="headerButton"> <icons-fas-pen-to-square size="10px" /> </i-button>
                    <i-button circle @click="onDeciphermentDelete(index)" class="headerButton"> <icons-fas-trash-can size="10px" /> </i-button>
                  </div>

                  <div v-if="deciphermentState[index].loading" style="margin-left: 10px;">
                    <i-loader color="primary"/>
                  </div>
              </i-form-group>
            </i-form>
            </td>
            <td><div class="cell">
              <i-tooltip>
                <i-button class="sealBtn" circle @click="goToSeal(item['SEALID'])"> <icons-fas-arrow-right /> </i-button>
                <template #body>View Inscription {{ item["SEALID"] }}</template>
              </i-tooltip>
            </div></td>
          </tr>
        </tbody>
      </i-table>
      
    <i-button circle v-if="!creating"  @click="creating = true;" class="headerButton addBtn"> <icons-fas-plus size="20px" /> </i-button>
    <i-button circle v-else  @click="creating = false;" class="headerButton addBtn"> <icons-fas-minus size="20px" /> </i-button>
    </div>
  </div>
</template>

<style scoped>
.headerButton {
  margin: 0.4rem;
}
.addBtn {
  margin-top: 2rem;
}
.center {
  float: center;
  justify-content: center;
  padding-left: 20%;
  padding-right: 20%;
}
      
.table {
  table-layout: fixed;
  float: center;
  position: sticky;
  width: 100%;
}

.indus-text {
  font-family: indus;
  font-size: 40px;
}

.form-group {
  margin: 1rem;
  overflow: hidden;
}

.cell {
  width: 80%;
  float: center;
}
      
span {
    display: block;
    overflow: hidden;
    padding-right:10px;
} 
      
</style>