export * from '../workflow'

interface Env extends CloudflareEnv {
  HACKER_NEWS_WORKFLOW: Workflow
  BROWSER: Fetcher
  HACKER_NEWS_WEB_URL?: string
}

export default {
  runWorkflow(event: ScheduledEvent | Request, env: Env, ctx: ExecutionContext) {
    console.info('trigger event by:', event)

    const createWorkflow = async () => {
      const instance = await env.HACKER_NEWS_WORKFLOW.create()

      const instanceDetails = {
        id: instance.id,
        details: await instance.status(),
      }

      console.info('instance detail:', instanceDetails)
      return instanceDetails
    }

    ctx.waitUntil(createWorkflow())

    return new Response('create workflow success')
  },
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const { pathname, hostname } = new URL(request.url)
    if (request.method === 'POST' && hostname === 'localhost') {
      // curl -X POST http://localhost:8787
      return this.runWorkflow(request, env, ctx)
    }
    if (pathname.includes('/static')) {
      const filename = pathname.replace('/static/', '')
      const file = await env.HACKER_NEWS_R2.get(filename)
      console.info('fetch static file:', filename, {
        uploaded: file?.uploaded,
        size: file?.size,
      })
      return new Response(file?.body)
    }

    // Redirect to web application (configurable via HACKER_NEWS_WEB_URL)
    const webUrl = env.HACKER_NEWS_WEB_URL || 'https://hacker-news-worker.vwanghao.workers.dev'
    return Response.redirect(`${webUrl}${pathname}`, 302)
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    return this.runWorkflow(event, env, ctx)
  },
}
