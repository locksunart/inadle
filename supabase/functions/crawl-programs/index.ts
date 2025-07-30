import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sourceId } = await req.json()
    
    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 데이터 소스 정보 가져오기
    const { data: source, error: sourceError } = await supabase
      .from('external_data_sources')
      .select('*')
      .eq('id', sourceId)
      .single()

    if (sourceError) throw sourceError

    // 크롤링 로그 시작
    const { data: logData, error: logError } = await supabase
      .from('crawl_logs')
      .insert({
        source_id: sourceId,
        status: 'running'
      })
      .select()
      .single()

    if (logError) throw logError

    let itemsFound = 0
    let itemsCreated = 0
    let itemsUpdated = 0

    try {
      // 소스 타입에 따른 크롤링
      if (source.source_name === '대전시립미술관') {
        const result = await crawlDaejeonArtMuseum(source, supabase)
        itemsFound = result.found
        itemsCreated = result.created
        itemsUpdated = result.updated
      } else if (source.source_name === '대전근현대사전시관') {
        const result = await crawlDaejeonModernHistory(source, supabase)
        itemsFound = result.found
        itemsCreated = result.created
        itemsUpdated = result.updated
      }

      // 크롤링 성공 로그
      await supabase
        .from('crawl_logs')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          items_found: itemsFound,
          items_created: itemsCreated,
          items_updated: itemsUpdated
        })
        .eq('id', logData.id)

      // 마지막 크롤링 시간 업데이트
      await supabase
        .from('external_data_sources')
        .update({ last_crawled_at: new Date().toISOString() })
        .eq('id', sourceId)

    } catch (crawlError) {
      // 크롤링 실패 로그
      await supabase
        .from('crawl_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: crawlError.message
        })
        .eq('id', logData.id)
      
      throw crawlError
    }

    return new Response(
      JSON.stringify({
        success: true,
        itemsFound,
        itemsCreated,
        itemsUpdated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

// 대전시립미술관 크롤링 함수
async function crawlDaejeonArtMuseum(source: any, supabase: any) {
  const url = source.base_url + source.crawl_config.list_url
  const response = await fetch(url)
  const html = await response.text()
  
  // HTML 파싱 (실제로는 더 정교한 파싱 필요)
  // 여기서는 예시로 간단히 처리
  const programs = []
  
  // 예시 데이터
  programs.push({
    title: '어린이 미술교실 - 나만의 색깔 찾기',
    description: '색채 이론을 배우고 자신만의 색깔을 찾아보는 체험 프로그램',
    start_date: '2025-08-01',
    end_date: '2025-08-31',
    main_category: '교육',
    sub_category: '체험',
    target_ages: ['over_48', 'elementary_low'],
    is_free: false,
    price_child: 10000,
    reservation_required: true,
    capacity: 20,
    source_id: source.id,
    external_id: 'dma_2025_08_001'
  })

  let created = 0
  let updated = 0

  for (const program of programs) {
    // 기존 프로그램 확인
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('source_id', source.id)
      .eq('external_id', program.external_id)
      .single()

    if (existing) {
      // 업데이트
      await supabase
        .from('events')
        .update(program)
        .eq('id', existing.id)
      updated++
    } else {
      // 생성
      await supabase
        .from('events')
        .insert(program)
      created++
    }
  }

  return { found: programs.length, created, updated }
}

// 대전근현대사전시관 크롤링 함수
async function crawlDaejeonModernHistory(source: any, supabase: any) {
  // 실제 크롤링 로직 구현
  // 여기서는 예시 데이터만 반환
  return { found: 5, created: 3, updated: 2 }
}