module.exports = function override(config, env) {
  config.resolve.fallback = { 
    ...config.resolve.fallback, // copy other fallback settings
    "os": false 
  };
  return config;
}
