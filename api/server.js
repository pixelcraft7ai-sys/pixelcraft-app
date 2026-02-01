export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Health check
  if (url.pathname.includes('/api/health')) {
    return new Response(JSON.stringify({ status: 'ok', runtime: 'edge' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Simple response for other API calls to test connectivity
  return new Response(JSON.stringify({ 
    error: 'Not Found', 
    path: url.pathname,
    message: 'Edge API is active' 
  }), {
    status: 404,
    headers: { 'content-type': 'application/json' },
  });
}
