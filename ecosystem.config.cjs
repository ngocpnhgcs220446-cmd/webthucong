module.exports = {
  apps: [
    {
      name: "experience-platform",
      script: "./server/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};
