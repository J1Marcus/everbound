// Placeholder Edge Function
// This file exists to prevent the edge-runtime from crashing
// Add your actual edge functions here

Deno.serve(async (req) => {
  return new Response(
    JSON.stringify({
      message: "Edge Functions are ready. Deploy your functions to get started.",
      status: "healthy"
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200
    }
  );
});
