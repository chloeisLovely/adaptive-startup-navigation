// Balanced browsing categories, not market-size or popularity rankings.
export const sectorGroups=[
 ['technology','💻','AI·디지털','AI & digital',[['ai','AI·소프트웨어','AI & software'],['cloud','IT·클라우드·보안','IT, cloud & security'],['data','데이터·자동화','Data & automation'],['robot','로봇·반도체·전자','Robotics, chips & electronics']]],
 ['learning','📚','교육·돌봄','Learning & care',[['education','교육·에듀테크','Education & edtech'],['training','직무교육·평생학습','Professional & lifelong learning'],['senior','시니어·돌봄','Ageing & care'],['family','아동·가족 서비스','Children & family services']]],
 ['health','🧬','건강·생명','Health & life',[['health','의료·디지털 헬스','Healthcare'],['bio','바이오·제약','Biotech & pharma'],['wellness','스포츠·웰니스','Sports & wellness'],['pet','반려동물','Pet care']]],
 ['food','🌿','먹거리·생활','Food & daily life',[['food','식품·외식·베이커리','Food & bakeries'],['agri','농업·애그테크','Agriculture'],['local','지역 생활서비스','Local services'],['home','주거·가사 서비스','Home & household services']]],
 ['industry','🏭','제조·이동','Industry & mobility',[['manufacture','제조·B2B 산업','Industrial B2B'],['logistics','물류·공급망','Logistics & supply chains'],['rail','철도·모빌리티','Rail & mobility'],['safety','산업안전·설비관리','Industrial safety & maintenance']]],
 ['creative','🎨','문화·콘텐츠','Culture & creativity',[['content','콘텐츠·미디어','Content & media'],['games','게임·인터랙티브','Games & interactive'],['design','디자인·창작 도구','Design & creator tools'],['culture','예술·문화·행사','Arts, culture & events']]],
 ['commerce','🛍️','소비·경험','Commerce & experiences',[['retail','유통·이커머스','Retail & commerce'],['fashion','패션·뷰티','Fashion & beauty'],['travel','관광·여행·숙박','Travel & hospitality'],['leisure','여가·공간 서비스','Leisure & shared spaces']]],
 ['planet','🌏','환경·공공','Planet & public good',[['climate','에너지·기후테크','Energy & climate'],['city','건설·스마트시티','Construction & smart cities'],['public','공공서비스·GovTech','Public services'],['social','사회적기업·순환경제','Social ventures & circular economy']]],
 ['business','💼','금융·전문서비스','Finance & professional services',[['finance','금융·핀테크','Finance & fintech'],['property','부동산·프롭테크','Property'],['professional','법무·회계·전문서비스','Legal, accounting & professional services'],['work','조직·인사·업무 도구','People & workplace tools']]]
];
export const sectors=sectorGroups.flatMap(g=>g[4]);
