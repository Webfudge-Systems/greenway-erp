'use strict';

const UID = 'api::vehicle.vehicle';
const authFalse = { auth: false };

module.exports = {
  type: 'content-api',
  routes: [
    { method: 'GET', path: '/vehicles', handler: `${UID}.find`, config: authFalse },
    { method: 'GET', path: '/vehicles/:id', handler: `${UID}.findOne`, config: authFalse },
    { method: 'POST', path: '/vehicles', handler: `${UID}.create`, config: authFalse },
    { method: 'PUT', path: '/vehicles/:id', handler: `${UID}.update`, config: authFalse },
    { method: 'DELETE', path: '/vehicles/:id', handler: `${UID}.delete`, config: authFalse },
  ],
};

