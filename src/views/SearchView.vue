<script lang="ts">
import { throwStatement } from '@babel/types';
import axios from 'axios';
import router from '../router';

export default {
  data() {
    return {
      searchText: '',
      loading: false,
      page: 1,
      itemsPerPage: 9,
      itemsTotal: 300,
      res: [],
      slice: [],
      maxRows: 0,
    }
  },
  watch: {
    page: function(newVal) {
      this.$router.push({ name: 'search', query: {query: this.searchText ? this.searchText : undefined, page: newVal && newVal != 1 ? newVal : undefined}})
    },
    res: function(newVal) {
      this.slice = newVal.slice((this.page - 1) * this.itemsPerPage, this.page * this.itemsPerPage);
    },
    '$route.query.query': function(newVal) {
      this.updateTable();
      this.updatePage();
    },
    '$route.query.page': function(newVal) {
      this.updatePage();
      window.scrollTo(0,0);
    }
  },
  methods: {
    onSearch() {
      this.$router.push({ name: 'search', query: {query: this.searchText ? this.searchText : undefined}})
    },
    updateTable() {
      this.searchText = this.$route.query.query || '';
      this.loading = true;
      if (!this.$store.state.searchRes || !this.$store.state.searchRes.get(this.searchText) ) {
        const queryString = `/api/getTable` + (this.searchText ? '/' + encodeURIComponent(this.searchText) : "")
        
        axios
          .get(queryString)
          .then((response) => {
            this.loading = false;
            this.res = response.data.toReturn;
            this.itemsTotal = this.res.length;
            // It looks like a bug if the whole paginator disappears once a search returns no results. 
            this.itemsTotal = this.itemsTotal == 0 ? 1 : this.itemsTotal;
            
            this.$store.commit("updateSearchRes", {res: this.res, query: this.searchText || "" });
          });
      } else {
        this.res = this.$store.state.searchRes.get(this.searchText);

        this.itemsTotal = this.res.length;
        // It looks like a bug if the whole paginator disappears once a search returns no results. 
        this.itemsTotal = this.itemsTotal == 0 ? 1 : this.itemsTotal;
        this.loading = false;
      }
    },
    updatePage() {
      if (typeof this.$route.query.page === 'undefined') {
        this.page = 1;
        this.slice = this.res.slice(0, this.itemsPerPage);
      } else if (isNaN(this.$route.query.page)) {
        this.$router.push({ name: 'search', query: {query: this.searchText ? this.searchText : undefined, page: undefined}})
      } else {
        this.page = Number(this.$route.query.page);
        this.slice = this.res.slice((this.page - 1) * this.itemsPerPage, this.page * this.itemsPerPage);
      }
    },
    goToSeal(sealId) {
      this.$router.push({ name: 'seal', params: { sealId, } });
    }
  },
  mounted() {
    this.updateTable();
    this.updatePage();
  },
};
</script>

<template>
  <div style="margin: auto; padding-bottom : 20rem;" class="center">
    <div style="text-align: center">
      <h3>Search for the Inscription here</h3>
    </div>

    <div style="padding-left: 20%; padding-right: 20%">
      <i-form @submit.prevent="onSearch">
        <i-input id="search" name="search"  placeholder="Enter ICIT, CISI ID, Material, Museum ..."  v-model="searchText">
          <template #append>
            <i-button color="primary" type="submit">
              <i-icon name="ink-search" />
            </i-button>
          </template>
        </i-input>
      </i-form>

      <i-pagination v-model="page" :items-total="itemsTotal" :items-per-page="itemsPerPage" :limit="10" style="padding-top: 1rem; display: flex; justify-content: center; " quick-link />

      <i-table class="table" style="padding-top: 2rem" id="table" responsive striped>
        <thead>
          <tr>
            <th width="8%">ID</th>
            <th width="10%">Site</th>
            <th width="10%">Direction</th>
            <th width="80%">Text</th>
            <th width="20%">View</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="this.loading">
            <td colspan="5" style="text-align: center"><i-loader color="primary"></i-loader></td>
          </tr>
          <tr v-else-if="slice.length === 0">
            <td colspan="5" style="text-align:center">No results found</td>
          </tr>
          <tr v-else v-for="(item, index) in slice" :key="index">
            <th scope="row">{{  item["SEALID"] }}</th>
            <td><div class="cell">{{ item["NAME"] }}</div></td>
            <td><div class="cell">{{ item["DIRECTION"] }}</div></td>
            <td><div class="cell indus_text" v-html="item['toRender']" width="100%" style="text-align: right" v-if="item['DIRECTION'] === 'R/L'"></div>
            <div class="cell indus_text" v-html="item['toRender']" width="100%" v-else></div>
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

      <i-pagination v-model="page" :items-total="itemsTotal" :items-per-page="itemsPerPage" :limit="10" style="padding-top: 1rem; padding-bottom: 6rem; display: flex; justify-content: center; " quick-link />
    </div>
  </div>
</template>

<style scoped>
.table {
  table-layout: fixed;
  float: center;
  position: sticky;
  width: 100%;
}
.center {
  float: center;
  justify-content: center;
}

.indus_text {
  font-family: indus;
  font-size: 40px;
}

.cell {
  width: 80%;
  float: center; 
}

.sealBtn {
  display: flexbox;
  vertical-align: middle;
}
</style>
