import { app } from './app.ts'

app
  .listen({
    port: 8080,
    host: '0.0.0.0',
  })
  .then(() => console.log('HTTP server running!'))
