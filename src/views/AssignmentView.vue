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
        assignments: [],
        assignmentState: [],
        surveys: [],
        creating: false,
        createId: "",
        createDirection: "",
        createText: "",
        createSurvey: "",
        createLoading: false,
        createErrText: "",
        createForm: this.$inkline.form({
          icit: {
            validators: [
              { name: 'custom', message: "Please enter a valid ICIT ID", validator: this.checkId},
            ]
          },
          survey: {},
        })
      }
    },
    methods: {
      resyncTable() {
        axios.post('/api/assignments', { username: this.username }).then(response => {
          console.log(JSON.stringify(response.data));
          this.assignments = response.data.assignments;
          this.surveys = response.data.surveys.map((survey) => {return { id: survey.SURVID, label: survey.NAME };});
          this.assignmentState = this.assignments.map(i => {
            return {
              editing: false,
              loading: false,
              inputSurvey: this.surveys[i.SURVID - 1],
            };
          });
        });
      },
      goToSeal(sealId) {
        this.$router.push({ name: 'seal', params: { sealId, } });
      },
      onAssignmentUpdate(index) {
        this.assignmentState[index].editing = false;
        this.assignmentState[index].loading = true;
        const newSurvey = this.assignmentState[index].inputSurvey.id; 
        const username = this.username;
        const sealId = this.assignments[index].SEALID;

        axios.post('/api/updateAssignment', { newSurvey, username, sealId }).then(response => {
          console.log("Successfully updated assignment!");
          this.resyncTable();
        })
      },
      cancelChanges(index) {
        this.assignmentState[index].editing = false;
        this.assignmentState[index].inputSurvey = this.surveys[this.assignments[index].SURVID - 1];
      },
      
      onAssignmentDelete(index) {
        this.assignmentState[index].editing = false;
        this.assignmentState[index].loading = true;
        const username = this.username;
        const sealId = this.assignments[index].SEALID;
        const survId = this.assignmentState[index].inputSurvey.id; 

        axios.post('/api/deleteAssignment', { username, sealId, survId }).then(response => {
          console.log("Successfully deleted assignment!");
          this.resyncTable();
        });
      },
      async checkId(v) {
        try {
          const response = await axios.get(`/api/checkId/${encodeURIComponent(v)}`);
          if (response.data.toReturn.direction || response.data.toReturn.toRender) {
            this.createDirection = response.data.toReturn.direction;
            this.createText = response.data.toReturn.toRender;
            this.createErrText = "";
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
      onAssignmentCreate() {
        if (this.createErrText) {
          return ;
        } else if (this.assignments.map((assignment) => assignment.SEALID).indexOf(Number(this.createId)) != -1) {
          this.createErrText = "Cannot create duplicate assignment entries";
          return ;
        } else {
          this.createLoading = true;

          const newSurvey = this.createSurvey.id; 
          console.log(newSurvey);
          const username = this.username;
          const sealId = this.createId;
          

          axios.post('/api/updateAssignment', { newSurvey, username, sealId }).then(async response => {
            console.log("Successfully updated assignment!");
            this.createLoading = false;
            this.createForm.icit.value = "";
            this.createForm.survey.value = "";
            this.creating = false;
            this.resyncTable();
          })
        }
      },
    },
  }
</script>

<template>
  <div style="margin: auto;" class="center">
    <h3>
      My Assignments
    </h3>
    <div style="display: grid; grid-template-columns: 97% 1fr;" >
      <i-card v-if="creating" style="margin-bottom: 5rem;" >
        <i-form style="display: grid; grid-template-columns: 1fr 1fr;" v-model="createForm">
          <div>
          <i-form-group inline class="form-group">
            <i-form-label placement="left" style="vertical-align: top;">ICIT ID: </i-form-label>
            <span><i-input name="icit" id="icit" style="width: 100%" v-model="createId" placeholder="Enter ICIT ID" /></span>
          </i-form-group>

          <i-form-group inline class="form-group">
            <i-form-label placement="left">Survey: </i-form-label>
            <span><i-select :options="surveys" name="survey" id="survey" style="width: 100%" v-model="createSurvey" placeholder="Enter Survey" /></span>
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
          
          <i-button :loading="createLoading" @click="onAssignmentCreate" > 
            Submit Assignment
          </i-button>
        </i-form>
      </i-card>
      <div v-if="creating"><span></span></div>
      
      <i-table class="table" style="padding-top: 2rem;" id="table" responsive striped>
        <thead>
          <th width="8%">ID</th>
          <th width="10%">Site</th>
          <th width="30%">Text</th>
          <th width="50%">Survey</th>
          <th width="2%">View Inscription</th>
        </thead>
        <tbody v-if="assignments.length === 0"> 
          <tr>
            <td colspan="5" style="text-align:center">No assignments found</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(item, index) in assignments" :key="index">
            <th scope="row">{{  item["SEALID"] }}</th>
            <td><div class="cell">{{ item["NAME"] }}</div></td>
            <td><div class="cell indus-text" v-html="item['toRender']" width="100%" style="text-align: right" v-if="item['DIRECTION'] === 'R/L'"></div>
            <div class="cell indus-text" v-html="item['toRender']" width="100%" v-else></div>
            </td>
            <td>
              <i-form >
                <i-form-group inline >
                  <i-select :options="surveys" v-model="assignmentState[index].inputSurvey" v-if="assignmentState[index].editing" style="margin-right: 10px;"/>
                  <i-select :options="surveys" v-model="assignmentState[index].inputSurvey" v-else disabled style="margin-right: 10px;"/>

                  <div v-if="assignmentState[index].editing"> 
                    <i-button circle @click="onAssignmentUpdate(index)" class="headerButton"> <icons-fas-floppy-disk size="10px" /> </i-button>
                    <i-button circle @click="cancelChanges(index)" class="headerButton"> <icons-fas-xmark size="10px" /> </i-button>
                  </div>

                  <div v-else> 
                    <i-button circle @click="assignmentState[index].editing = true;" class="headerButton"> <icons-fas-pen-to-square size="10px" /> </i-button>
                    <i-button circle @click="onAssignmentDelete(index)" class="headerButton"> <icons-fas-trash-can size="10px" /> </i-button>
                  </div>

                  <div v-if="assignmentState[index].loading" style="margin-left: 10px;">
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
  vertical-align: middle;
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