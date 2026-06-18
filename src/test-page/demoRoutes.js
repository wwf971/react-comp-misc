import { components } from './examples.jsx';

export const defaultComponentKey = 'Login';

const normalizeRoutePart = (value) => String(value || '').trim().toLowerCase();

export const getComponentRouteSlug = (componentKey) => (
  normalizeRoutePart(componentKey)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const componentKeyByRouteSlug = Object.keys(components).reduce((result, componentKey) => {
  const routeSlug = getComponentRouteSlug(componentKey);
  if (routeSlug) {
    result[routeSlug] = componentKey;
  }
  return result;
}, {});

export const getComponentKeyFromRouteSlug = (routeSlug) => (
  componentKeyByRouteSlug[normalizeRoutePart(routeSlug)] || ''
);

export const getRoutePathForComponentKey = (componentKey) => {
  const routeSlug = getComponentRouteSlug(componentKey);
  return routeSlug ? `/${routeSlug}` : '/';
};

export const isComponentRouteKey = (componentKey) => Boolean(components[componentKey]);
