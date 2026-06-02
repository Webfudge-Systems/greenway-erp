'use strict';

const UID = 'api::warranty-record.warranty-record';
const authFalse = { auth: false };

module.exports = {
  type: 'content-api',
  routes: [
    { method: 'GET', path: '/warranty-records', handler: `${UID}.find`, config: authFalse },
    { method: 'GET', path: '/warranty-records/:id', handler: `${UID}.findOne`, config: authFalse },
    { method: 'POST', path: '/warranty-records', handler: `${UID}.create`, config: authFalse },
    { method: 'PUT', path: '/warranty-records/:id', handler: `${UID}.update`, config: authFalse },
    { method: 'DELETE', path: '/warranty-records/:id', handler: `${UID}.delete`, config: authFalse },
  ],
};

