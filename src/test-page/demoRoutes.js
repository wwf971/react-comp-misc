import { components } from './examples.jsx';

export const defaultComponentKey = 'Login';

const ROUTE_SUFFIXES_TO_STRIP = ['panel', 'component', 'comp', 'example', 'view'];

const normalizeRoutePart = (value) => String(value || '').trim().toLowerCase();

export const getComponentRouteSlug = (componentKey) => (
  normalizeRoutePart(componentKey)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const collectRouteAliasSlugs = (componentKey, componentEntry) => {
  const aliasSlugs = new Set();
  const primarySlug = getComponentRouteSlug(componentKey);
  if (primarySlug) {
    aliasSlugs.add(primarySlug);
  }

  ROUTE_SUFFIXES_TO_STRIP.forEach((suffix) => {
    const suffixToken = `-${suffix}`;
    if (primarySlug.endsWith(suffixToken)) {
      aliasSlugs.add(primarySlug.slice(0, -suffixToken.length));
    }
  });

  const entryAliases = Array.isArray(componentEntry?.routeAliases) ? componentEntry.routeAliases : [];
  entryAliases.forEach((aliasSlug) => {
    const normalizedAliasSlug = normalizeRoutePart(aliasSlug)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (normalizedAliasSlug) {
      aliasSlugs.add(normalizedAliasSlug);
    }
  });

  return aliasSlugs;
};

const componentKeyByRouteSlug = Object.entries(components).reduce((result, [componentKey, componentEntry]) => {
  collectRouteAliasSlugs(componentKey, componentEntry).forEach((routeSlug) => {
    if (!result[routeSlug]) {
      result[routeSlug] = componentKey;
    }
  });
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
