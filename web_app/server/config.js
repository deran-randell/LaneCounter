const config = {
    db: {
      /* don't expose password or any sensitive info, done only for demo */
      host: "localhost",
      user: "moth",
      password: "Bazinga!",
      database: "mothdb",
      connectionLimit: 5
    },
    listPerPage: 50,
  };
  
  module.exports = config;