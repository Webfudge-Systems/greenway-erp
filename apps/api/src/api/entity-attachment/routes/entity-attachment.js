'use strict';

const UID = 'api::entity-attachment.entity-attachment';
const authFalse = { auth: false };

module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/entity-attachments/list',
      handler: `${UID}.list`,
      config: authFalse,
    },
    {
      method: 'GET',
      path: '/entity-attachments/count',
      handler: `${UID}.count`,
      config: authFalse,
    },
    {
      method: 'POST',
      path: '/entity-attachments',
      handler: `${UID}.create`,
      config: authFalse,
    },
    {
      method: 'DELETE',
      path: '/entity-attachments/:id',
      handler: `${UID}.delete`,
      config: authFalse,
    },
  ],
};
