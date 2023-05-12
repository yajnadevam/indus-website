import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SearchView from "../views/SearchView.vue";
import LoginView from "../views/LoginView.vue";
import ContactView from "../views/ContactView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";
import SealView from "../views/SealView.vue";
import DeciphermentView from "../views/DeciphermentView.vue";
import AssignmentView from "../views/AssignmentView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactView,
    },
    {
      path: "/search",
      name: "search",
      component: SearchView,
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import("../views/SearchView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
    },
    {
      path: "/seal/:sealId",
      name: "seal",
      component: SealView,
    },
    {
      path: "/decipherment",
      name: "decipherment",
      component: DeciphermentView,
    },
    {
      path: "/assignment",
      name: "assignment",
      component: AssignmentView,
    }
  ],
});

export default router;
