module.exports = {
  client: {
    service: {
      name: 'gaming-platform-api',
      url: 'http://localhost:4000/graphql',
    },
    includes: ['src/**/*.js'],
    excludes: ['**/node_modules/**/*'],
  },
}; 