import router from "../utils/router.js";

const Navbar = {
  template: `
    <nav class="h3 w-auto d-flex justify-content-between">
      <router-link to='/'>Home</router-link>
      <router-link v-if="!state.loggedIn" to='/login'>Login</router-link>
      <router-link v-if="!state.loggedIn" to='/signup'>Signup</router-link>
      <router-link v-if="state.loggedIn && state.role==='cus'" to='/cus_dash'>DashboardCus</router-link>
      <router-link v-if="state.loggedIn && state.role==='pro'" to='/pro_dash'>DashboardPro</router-link>
      <router-link v-if="state.loggedIn && state.role==='admin'" to='/ad_dash'>DashboardAdmin</router-link>
      <router-link v-if="state.loggedIn && state.role==='admin'" to='/search_ad'>Search</router-link>
      <router-link v-if="state.loggedIn && state.role==='admin'" to='/stats_ad'>Statistics</router-link>
      <router-link v-if="state.loggedIn && state.role==='cus'" to='/search_cus'>SearchCus</router-link>
      <router-link v-if="state.loggedIn && state.role==='cus'" to='/stats_cus'>SummaryCus</router-link>
      <router-link v-if="state.loggedIn && state.role==='cus'" to='/profile_cus'>ProfileCus</router-link>
      <router-link v-if="state.loggedIn && state.role==='pro'" to='/search_pro'>SearchPro</router-link>
      <router-link v-if="state.loggedIn && state.role==='pro'" to='/stats_pro'>SummaryPro</router-link>
      <router-link v-if="state.loggedIn && state.role==='pro'" to='/profile_pro'>ProfilePro</router-link>
      <button class="btn btn-warning text-xl" v-if="state.loggedIn" @click="logout">Logout</button>
    </nav>
  `,

  methods: {
    logout() {
      // Clear session and Vuex state
      sessionStorage.clear();
      this.$store.commit("logout");
      this.$store.commit("setRole", null);

      this.$router.push("/");
    },
  },
  computed: {
    state() {
      return this.$store.state;
    },
  },
};

export default Navbar;