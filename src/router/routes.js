const routes = [
    {
        path: "/privacy",
        component: () => import("pages/Privacy.vue"),
    },
    {
        path: "/",
        component: () => import("layouts/MainLayout.vue"),
        children: [
            {
                path: "/:trackerId",
                component: () => import("pages/IndexPage.vue"),
            },
            { path: "/", component: () => import("pages/IndexPage.vue") },
        ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: "/:catchAll(.*)*",
        name: "404",
        component: () => import("pages/ErrorNotFound.vue"),
    },
];

export default routes;
