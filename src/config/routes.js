import Dashboard from '@/components/pages/Dashboard';
import Candidates from '@/components/pages/Candidates';
import Pipeline from '@/components/pages/Pipeline';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  candidates: {
    id: 'candidates',
    label: 'Candidates',
    path: '/candidates',
    icon: 'Users',
    component: Candidates
  },
  pipeline: {
    id: 'pipeline',
    label: 'Pipeline',
    path: '/pipeline',
    icon: 'Workflow',
    component: Pipeline
  }
};

export const routeArray = Object.values(routes);
export default routes;