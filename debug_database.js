// 데이터베이스 디버깅 스크립트
// 현재 저장된 장소 데이터를 확인하고 문제를 진단합니다

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음');
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
  console.log('🔍 데이터베이스 진단 시작...\n');

  try {
    // 1. 연결 테스트
    console.log('1️⃣ 연결 테스트');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('places')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ 연결 실패:', connectionError.message);
      return;
    }
    console.log('✅ 데이터베이스 연결 성공\n');

    // 2. 장소 테이블 확인
    console.log('2️⃣ places 테이블 확인');
    