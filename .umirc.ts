import { defineConfig } from 'umi';

export default defineConfig({
  routes: [{ path: '/', component: 'index' }, { path: '/event', component: 'eventLister' }, { path: '/hooksForm', component: 'hooksForm' }],

  npmClient: 'yarn',
});
