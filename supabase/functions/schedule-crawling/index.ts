import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 크롤링이 필요한 소스 확인
    const { data: sources, error: sourcesError } = await supabase
      .from("external_data_sources")
      .select("*")
      .eq("is_active", true)
      .or(`last_crawled_at.is.null,last_crawled_at.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);

    if (sourcesError) throw sourcesError;

    const results = [];

    for (const source of sources || []) {
      try {
        // 크롤링 함수 호출
        const crawlResponse = await fetch(`${supabaseUrl}/functions/v1/crawl-library-programs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sourceId: source.id })
        });

        const crawlResult = await crawlResponse.json();
        
        // 마지막 크롤링 시간 업데이트
        await supabase
          .from("external_data_sources")
          .update({ last_crawled_at: new Date().toISOString() })
          .eq("id", source.id);

        results.push({
          sourceId: source.id,
          sourceName: source.source_name,
          success: crawlResponse.ok,
          result: crawlResult
        });

      } catch (err) {
        console.error(`Error crawling ${source.source_name}:`, err);
        results.push({
          sourceId: source.id,
          sourceName: source.source_name,
          success: false,
          error: err.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sourcesProcessed: results.length,
        results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in schedule-crawling:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});