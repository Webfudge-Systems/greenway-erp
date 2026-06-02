'use strict';

const UID = 'api::allocation.allocation';
const authFalse = { auth: false };

module.exports = {
  type: 'content-api',
  routes: [
    { method: 'GET', path: '/allocations', handler: `${UID}.find`, config: authFalse },
    { method: 'GET', path: '/allocations/:id', handler: `${UID}.findOne`, config: authFalse },
    { method: 'POST', path: '/allocations', handler: `${UID}.create`, config: authFalse },
    { method: 'PUT', path: '/allocations/:id', handler: `${UID}.update`, config: authFalse },
    { method: 'DELETE', path: '/allocations/:id', handler: `${UID}.delete`, config: authFalse },
  ],
};

