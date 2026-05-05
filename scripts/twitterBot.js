/**
 * Arcana Insight - Twitter Auto-Reply Bot
 * 
 * Usage:
 * 1. Install dependencies: npm install twitter-api-v2 dotenv
 * 2. Set environment variables in .env
 * 3. Run: node scripts/twitterBot.js
 */

import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 타로 데이터 로드 (로컬 파일)
import tarotData from '../src/tarotData.js';

dotenv.config();

// 트위터 API 클라이언트 설정 (개발자 포털에서 발급)
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const TARGET_HASHTAG = '#무료타로'; // 감지할 해시태그 또는 검색어
const SITE_URL = 'https://arcana-insight.com';

async function startBot() {
  console.log('🤖 Arcana Insight Twitter Bot Started...');
  
  try {
    // 1. 최근 멘션이나 해시태그 검색 (단순 예시)
    // 실제 운영 시에는 User Stream이나 Polling을 사용합니다.
    const searchResult = await client.v2.search(TARGET_HASHTAG, {
      'tweet.fields': ['author_id', 'created_at'],
      max_results: 10,
    });

    for await (const tweet of searchResult) {
      // 이미 답글을 달았는지 체크하는 로직 필요 (여기서는 생략)
      
      // 2. 랜덤 카드 1장 뽑기
      const randomCard = tarotData[Math.floor(Math.random() * tarotData.length)];
      const keyword = randomCard.keywords[Math.floor(Math.random() * randomCard.keywords.length)];
      
      // 3. 답글 텍스트 구성
      const replyText = `🔮 오늘의 카드는 [${randomCard.nameKo}] 입니다.\n\n` +
                        `핵심 키워드: ${keyword}\n\n` +
                        `이 카드가 당신의 질문에 어떤 답을 주고 있는지, 아래 링크에서 무료 AI 타로 마스터에게 물어보세요! ✨\n\n` +
                        `${SITE_URL}`;

      console.log(`Replying to tweet ${tweet.id} with card: ${randomCard.nameKo}`);
      
      // 4. 답글 전송 (주석 해제 시 실제 전송됨)
      /*
      await client.v1.reply(replyText, tweet.id);
      */
      
      // 스팸 방지를 위해 딜레이
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('Bot Error:', error);
  }
}

// 1시간마다 실행
setInterval(startBot, 1000 * 60 * 60);
startBot();
