import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 연령 그룹 매핑 함수
function mapAgeGroups(targetText: string): string[] {
  const ageGroups: string[] = [];
  
  // 연령 패턴 매칭
  const patterns = {
    '0_12': /영아|0세|1세|12개월|돌전|베이비/i,
    '13_24': /13개월|18개월|2세|두살|토들러/i,
    '24_48': /3세|4세|세살|네살|유아/i,
    'over_48': /5세|6세|7세|다섯|여섯|일곱|미취학/i,
    'elementary_low': /초등|1학년|2학년|3학년|저학년/i,
    'elementary_high': /4학년|5학년|6학년|고학년/i
  };
  
  // 특수 케이스
  if (targetText.includes('성인') || targetText.includes('부모')) {
    return ['parent'];
  }
  
  // 패턴 매칭
  for (const [group, pattern] of Object.entries(patterns)) {
    if (pattern.test(targetText)) {
      ageGroups.push(group);
    }
  }
  
  // 범위 표현 처리 (예: "3~5세")
  const rangeMatch = targetText.match(/(\d+)\s*[~-]\s*(\d+)\s*세/);
  if (rangeMatch) {
    const startAge = parseInt(rangeMatch[1]);
    const endAge = parseInt(rangeMatch[2]);
    
    if (startAge <= 1) ageGroups.push('0_12');
    if (startAge <= 2 || endAge >= 2) ageGroups.push('13_24');
    if ((startAge <= 4 && endAge >= 3) || (startAge >= 3 && startAge <= 4)) ageGroups.push('24_48');
    if (endAge >= 5) ageGroups.push('over_48');
  }
  
  // 개월 수 처리
  const monthMatch = targetText.match(/(\d+)\s*개월/);
  if (monthMatch) {
    const months = parseInt(monthMatch[1]);
    if (months <= 12) ageGroups.push('0_12');
    else if (months <= 24) ageGroups.push('13_24');
    else if (months <= 48) ageGroups.push('24_48');
  }
  
  return [...new Set(ageGroups)]; // 중복 제거
}

// 날짜 파싱 함수
function parseKoreanDate(dateText: string): Date | null {
  try {
    // "2024.03.15" 형식
    const dotMatch = dateText.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    if (dotMatch) {
      return new Date(parseInt(dotMatch[1]), parseInt(dotMatch[2]) - 1, parseInt(dotMatch[3]));
    }
    
    // "2024-03-15" 형식
    const dashMatch = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dashMatch) {
      return new Date(parseInt(dashMatch[1]), parseInt(dashMatch[2]) - 1, parseInt(dashMatch[3]));
    }
    
    // "2024년 3월 15일" 형식
    const koreanMatch = dateText.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (koreanMatch) {
      return new Date(parseInt(koreanMatch[1]), parseInt(koreanMatch[2]) - 1, parseInt(koreanMatch[3]));
    }
    
    return null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 크롤링할 도서관 정보 가져오기
    const { data: sources, error: sourcesError } = await supabase
      .from("external_data_sources")
      .select("*")
      .eq("source_type", "library")
      .eq("is_active", true);

    if (sourcesError) throw sourcesError;

    const results = [];

    for (const source of sources || []) {
      try {
        console.log(`Crawling ${source.source_name}...`);
        
        // 크롤링 로그 시작
        const { data: crawlLog } = await supabase
          .from("crawl_logs")
          .insert({
            source_id: source.id,
            status: "running"
          })
          .select()
          .single();

        let itemsFound = 0;
        let itemsCreated = 0;
        let itemsUpdated = 0;

        // 강좌 목록 페이지 크롤링
        const lectureListUrl = `${source.base_url}${source.crawl_config.lecture_list_url}`;
        const lectureResponse = await fetch(lectureListUrl);
        const lectureHtml = await lectureResponse.text();
        const $ = cheerio.load(lectureHtml);

        // 강좌 목록 파싱 (실제 HTML 구조에 맞게 수정 필요)
        const programs: any[] = [];
        
        $(".lecture_list_item, .program_item, .board_list li").each((index, element) => {
          try {
            const $item = $(element);
            
            // 제목
            const title = $item.find(".title, .subject, .tit").text().trim();
            if (!title) return;
            
            // 대상
            const target = $item.find(".target, .age, .object").text().trim();
            const targetAges = mapAgeGroups(target);
            
            // 날짜
            const dateText = $item.find(".date, .period, .schedule").text().trim();
            const dates = parseKoreanDate(dateText);
            
            // 정원/신청 정보
            const capacityText = $item.find(".capacity, .personnel").text().trim();
            const capacityMatch = capacityText.match(/(\d+)\s*명/);
            const capacity = capacityMatch ? parseInt(capacityMatch[1]) : null;
            
            // 상세 링크
            const detailLink = $item.find("a").attr("href");
            const externalId = detailLink?.match(/lectureIdx=(\d+)/)?.[1] || 
                             `${source.id}_${Date.now()}_${index}`;
            
            // 신청 기간
            const registrationText = $item.find(".registration, .apply_period").text().trim();
            
            programs.push({
              title,
              target,
              targetAges,
              dateText,
              capacity,
              externalId,
              registrationText,
              detailLink: detailLink ? `${source.base_url}${detailLink}` : null
            });
            
            itemsFound++;
          } catch (err) {
            console.error("Error parsing program item:", err);
          }
        });

        // 데이터베이스에 저장
        for (const program of programs) {
          try {
            // 기존 프로그램 확인
            const { data: existing } = await supabase
              .from("events")
              .select("id")
              .eq("source_id", source.id)
              .eq("external_id", program.externalId)
              .single();

            const eventData = {
              place_id: source.id, // 도서관을 place로 연결해야 함
              source_id: source.id,
              external_id: program.externalId,
              event_type: "program",
              title: program.title,
              description: program.target,
              target_ages: program.targetAges,
              target_age_note: program.target,
              capacity: program.capacity,
              source_url: program.detailLink,
              is_active: true,
              start_date: program.dates || new Date(),
              program_type: "강좌"
            };

            if (existing) {
              // 업데이트
              await supabase
                .from("events")
                .update(eventData)
                .eq("id", existing.id);
              itemsUpdated++;
            } else {
              // 신규 생성
              await supabase
                .from("events")
                .insert(eventData);
              itemsCreated++;
            }
          } catch (err) {
            console.error("Error saving program:", err);
          }
        }

        // 크롤링 로그 완료
        await supabase
          .from("crawl_logs")
          .update({
            completed_at: new Date().toISOString(),
            status: "success",
            items_found: itemsFound,
            items_created: itemsCreated,
            items_updated: itemsUpdated
          })
          .eq("id", crawlLog.id);

        results.push({
          source: source.source_name,
          itemsFound,
          itemsCreated,
          itemsUpdated
        });

      } catch (err) {
        console.error(`Error crawling ${source.source_name}:`, err);
        results.push({
          source: source.source_name,
          error: err.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in crawl-library-programs:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});