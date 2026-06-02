'use strict';

/**
 * Extend users-permissions user schema without replacing base attributes.
 * A partial schema.json extension shallow-merges and wipes email/username/password.
 */
module.exports = (plugin) => {
  const userSchema = plugin.contentTypes?.user?.schema;
  if (!userSchema?.attributes) {
    return plugin;
  }

  userSchema.attributes = {
    ...userSchema.attributes,
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    isPlatformAdmin: {
      type: 'boolean',
      default: false,
    },
  };

  return plugin;
};
