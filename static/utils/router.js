import store from "./store.js";
// import Navbar from "../components/Navbar.js";
// Import your pages/components
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Signup from "../pages/Signup.js";
import logout from "../pages/logout.js";
import DashboardCus from "../pages/cus_dash.js";
import DashboardPro from "../pages/pro_dash.js";
import Dashboard from "../pages/ad_dash.js";
import Search from "../pages/search_ad.js";
import Statistics from "../pages/stats_ad.js";
import ProfilePro from "../pages/profile_pro.js";
import SearchPro from "../pages/search_pro.js";
import SummaryPro from "../pages/stats_pro.js";
import ProfileCus from "../pages/profile_cus.js";
import SearchCus from "../pages/search_cus.js";
import SummaryCus from "../pages/stats_cus.js";
import AddService from "../pages/AddService.js";
import ServiceBooking from "../pages/ServiceBooking.js";
import ServicePage from "../pages/servicePage.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/logout", component: logout },
  { path: "/cus_dash", component: DashboardCus, meta: { requiresLogin: true, role: "cus" }},
  { path: "/pro_dash", component: DashboardPro, meta: { requiresLogin: true, role: "pro" }},
  { path: "/ad_dash", component: Dashboard, meta: { requiresLogin: true, role: "admin" }},
  { path: "/search_ad", component: Search, meta: { requiresLogin: true, role: "admin" }},
  { path: "/stats_ad", component: Statistics, meta: { requiresLogin: true, role: "admin" }},
  { path: "/add_service", component: AddService, meta: { requiresLogin: true, role: "admin" }},
  { path: "/search_pro", component: SearchPro, meta: { requiresLogin: true, role: "pro" }},
  { path: "/stats_pro", component: SummaryPro, meta: { requiresLogin: true, role: "pro" }},
  { path: "/profile_pro", component: ProfilePro, meta: { requiresLogin: true, role: "pro" }},
  { path: "/search_cus", component: SearchCus, meta: { requiresLogin: true, role: "cus" }},
  { path: "/stats_cus", component: SummaryCus, meta: { requiresLogin: true, role: "cus" }},
  { path: "/profile_cus", component: ProfileCus, meta: { requiresLogin: true, role: "cus" }},
  { path: '/service/:serviceName', component: ServiceBooking, name: "ServiceBooking" },
  { path: '/servicePage', component: ServicePage, name: "servicePage", meta: { requiresLogin: true, role: "cus"}},
];

const router = new VueRouter({
    routes,
}); 

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)) {
      if (!store.state.loggedIn) {
        next({ path: "/login" });
      } else if (to.meta.role && to.meta.role !== store.state.role) {
        next({ path: "/" });
      } else {
        next();
      }
    } else {
      next();
    }
  });

export default router;
