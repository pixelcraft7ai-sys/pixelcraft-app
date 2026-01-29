export const config = {
  runtime: 'edge',
};

export default function (req) {
  return new Response('Hello World', {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
  });
}
