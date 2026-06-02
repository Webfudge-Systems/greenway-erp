'use strict';

const UID = 'api::service-record.service-record';
const authFalse = { auth: false };

module.exports = {
  type: 'content-api',
  routes: [
    { method: 'GET', path: '/service-records', handler: `${UID}.find`, config: authFalse },
    { method: 'GET', path: '/service-records/:id', handler: `${UID}.findOne`, config: authFalse },
    { method: 'POST', path: '/service-records', handler: `${UID}.create`, config: authFalse },
    { method: 'PUT', path: '/service-records/:id', handler: `${UID}.update`, config: authFalse },
    { method: 'DELETE', path: '/service-records/:id', handler: `${UID}.delete`, config: authFalse },
  ],
};

