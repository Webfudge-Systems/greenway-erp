'use strict';

const UID = 'api::vehicle-event.vehicle-event';
const authFalse = { auth: false };

module.exports = {
  type: 'content-api',
  routes: [
    { method: 'GET', path: '/vehicle-events', handler: `${UID}.find`, config: authFalse },
    { method: 'GET', path: '/vehicle-events/:id', handler: `${UID}.findOne`, config: authFalse },
    { method: 'POST', path: '/vehicle-events', handler: `${UID}.create`, config: authFalse },
    { method: 'PUT', path: '/vehicle-events/:id', handler: `${UID}.update`, config: authFalse },
    { method: 'DELETE', path: '/vehicle-events/:id', handler: `${UID}.delete`, config: authFalse },
  ],
};

