afterAll(async () => {
    await new Promise((resolve, reject) => {
      if (global.server) {
        global.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  });
  