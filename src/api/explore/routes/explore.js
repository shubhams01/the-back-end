module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/explore',
     handler: 'explore.random',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/explore/:id',
     handler: 'explore.findOne',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    
  ],
};
