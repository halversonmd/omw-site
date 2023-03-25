import { installQuasarPlugin } from "@quasar/quasar-app-extension-testing-unit-jest";
import { mount } from "@vue/test-utils";
import MainLayout from "src/layouts/MainLayout.vue";
import IndexPage from "src/pages/IndexPage.vue";
import routes from "src/router/routes";
import { routeCoords, appendToCoords } from "src/composables/firebase";
import { createRouter, createWebHistory } from "vue-router";

installQuasarPlugin();

let router, wrapper;
beforeEach(async () => {
    router = createRouter({
        history: createWebHistory(),
        routes: routes,
    });
    router.push({ params: { trackerId: "-NRKSkXPYlHWiRkrpbd3" } });
    await router.isReady();
    wrapper = mount(MainLayout, {
        global: {
            plugins: [router],
        },
    });
});

describe("MainLayout", () => {
    it("Renders without failing", () => {
        expect(MainLayout).toBeTruthy();
    });

    it("Renders it's child component", async () => {
        const indexPage = wrapper.findComponent(IndexPage);
        expect(indexPage.exists()).toBe(true);
    });

    it("Clicks the refresh button", async () => {
        const indexPage = wrapper.findComponent(IndexPage);
        const refreshBtn = indexPage.find("#refresh-btn");
        await refreshBtn.trigger("click");
        expect(wrapper.emitted().click).toBeTruthy();
    });

    it("Reacts properly to the first coords coming in", async () => {
        const indexPage = wrapper.findComponent(IndexPage);
        expect(routeCoords.coords.length).toBe(0);
        expect(indexPage.vm.driverStarted).toBe(false);
        appendToCoords({
            lat: 40.78801932121669,
            lng: -111.73479940752783,
        });
        expect(indexPage.vm.driverStarted).toBe(true);
        expect(routeCoords.coords.length).toBe(1);
        const map = await indexPage.find("#map");
        expect(map.isVisible()).toBe(true);
    });
});
