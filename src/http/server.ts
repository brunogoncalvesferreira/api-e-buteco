import { app } from './app.ts'

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => console.log('HTTP server running on port 3333!'))
