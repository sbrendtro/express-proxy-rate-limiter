# express-proxy-rate-limiter
A simple rate-limiting proxy based on express.


## Installation
Clone or download this repo.

## Configuration
The configuration file can be found at `config/default.json`. Refer to 
'Config Options' below for more information.

## Usage
There are multiple ways to use this rate-limiting proxy.

### Stand-Alone
Edit the config to reflect your environment, specifically pointing the 
backendUrl and redis url to appropriate endpoints.

Install the required modules, then build and run.

```
npm i
npm run build
node dist/index.js
```

### Docker / Docker Compose
We have created an example `docker-compose.yml` config that provides both 
redis server, as well as a Node 18 image for the app.

```
docker-compose up -d
```

Or use the image `sbrendtro/express-proxy-rate-limiter:latest` in your own
docker compose, Dockerfile, etc.


#### Config Using Environment Variables
By setting environment variables, you can override the JSON config file 
settings. This can be helpful when using our Docker image:

- RATELIMITER_BACKEND_URL=https://your.server:8000
- RATELIMITER_REDIS_URL=redis://your.redis.server:6379
- RATELIMITER_WINDOW_MS=60000
- RATELIMITER_MAX=100
- RATELIMITER_FRONTEND_PORT=3000

## Config Options
The configuration file can be found here:

config/default.json
```
{
    "proxy": {
        "frontendPort": 3000,
        "backendUrl": "https://localhost:8000",
        "options": {},
        "verbs": [ "GET", "POST", "PUT", "HEAD", "DELETE" ]
    },
    "redis": {
        "url": "redis://redis:6379"
    },
    "limiter": {
        "windowMs": 60000,
        "max": 100,
        "standardHeaders": true,
        "legacyHeaders": false
    }
  }
```

The config setup is based on [node-config](https://www.npmjs.com/package/config).
You may edit default.json directly, or override it using enviornment-based config
naming convention (`production.json`) by setting the environment variable 
`NODE_ENV=production` 

## Configuration Options
### - proxy
This is the configuration for the proxy portion of the app.
#### frontendPort
The port that Express will bind to on the front end. Note, if changing this, 
you will also need to update `Dockerfile` and `docker-compose.yml`

#### backendUrl
The URL that will handle the backend requests for the proxy. All requests 
will be forwarded here.

#### options
These are any valid options for **express-http-proxy**. They are passed in 
directly to `proxy()` when setting up the Express middleware.

#### verbs
The valid HTTP verbs that will be routed by the proxy. This can be helpful, 
for instance when proxying a connection to a Elasticsearch server backend 
where only allowing GET would restrict to read-only. Many other use cases, 
to be sure.

### - redis
#### url
The URL for your Redis intsance. The default config points to redis as 
configured in `docker-compose.yml`

### - limiter
The configuration for the rate limiting portion of the app. These are any valid 
options for **express-http-proxy**, as it is passed directly into the 
`rateLimit()` middleware.
#### window
The number of milliseconds of the sliding window in which to count requests.

#### max
The maximum number of requests per sliding window timeframe

#### standardHeaders
Option to return rate limit info in the `RateLimit-*` headers

#### legacyHeaders
Option to return rate limit info on the `X-RateLimit-*` headers