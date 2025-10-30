module.exports = {
  apps: [
    {
      name: 'job-thrive-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3001',
      cwd: '/home/ec2-user/job-thrive',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_restarts: 5,
      restart_delay: 5000,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'job-thrive-backend',
      script: 'npm',
      args: 'start',
      cwd: '/home/ec2-user/job-thrive/server', // 👈 add if backend is in its own folder
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      restart_delay: 5000,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true
    }
  ]
};
