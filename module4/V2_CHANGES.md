# ASNM Module 4 V2 — 구현 및 교체 안내

기준 main: `db9487588800d37ecbf3d04e01057a79eb4c0db1`

기존 Module 4를 확장했습니다. Module 1~3 계산식 및 Module 4의 네 엔진은 보존했습니다. ZIP은 기존 저장소 위에 적용하는 **교체 파일 묶음**이며, 독립적인 전체 저장소 배포본이 아닙니다.

## 수정 파일 전체 목록

| 파일 | 변경 이유 |
|---|---|
| `index.html` | 한국어 완료 선택 버튼, Digital Twin Hub, 완료 이벤트와 기존 리포트 복원 hook, bridge 로드 |
| `en/index.html` | 동일한 영문 통합 및 올바른 프로젝트 상대경로 |
| `module4/bridge.js` | 실제 완료 결과 저장·전달, Hub 활성화, Module 3 리포트로 복귀 |
| `module4/main.js` | 공통 진입 흐름, Welcome, 세션 보호, NPC 카드, 방 이동 연결, 기존 기능 유지 |
| `module4/world/createWorld.js` | 아바타 연결, 방별 가구/식물, 부드러운 카메라, 렌더 일시정지·정리 |
| `module4/styles/world.css` | Hub·Wizard·Welcome·Persona 카드와 모바일 레이아웃 |
| `module4/tests/engine.test.js` | 원본 14개 테스트 유지, 독립 입력·검증·세션 보호 3개 추가 |
| `module4/tests/browser.cjs` | 새 진입 흐름, 원본 리포트, 실제 아바타 이동·NPC, 독립 설정 및 세션 보호 검증 |
| `module4/README.md` | 실제 실행 방법, 두 경로, 아바타 구조와 교체 안내 정정 |
| `module4/ASSUMPTIONS.md` | 독립 실행 기본값 및 시각적 NPC 역할 명시 |
| `module4/VALIDATION.md` | 이번 V2에서 실제 실행한 검증과 한계 기록 |

## 새 파일 전체 목록

| 파일 | 역할 |
|---|---|
| `module4/state/StandaloneAdapter.js` | 독립 입력을 공통 ASNMState로 변환하고 검증 |
| `module4/ui/entry.js` | 한·영 Hub, 4단계 Wizard, 실제 데이터 기반 Welcome |
| `module4/world/avatars.js` | Founder·7 NPC 생성, 걷기·idle, 경로 탐색, dispose |
| `module4/V2_CHANGES.md` | 이 변경·설치 안내 |

`ASNMState.js`, `Module3Adapter.js`, `StateStore.js`, `rooms.js`는 기존 구현으로 요구사항을 충족하여 수정하지 않았습니다. `SimulationEngine.js`, `DecisionEngine.js`, `EventEngine.js`, `CalibrationEngine.js`도 수정하지 않았습니다. Babylon vendor, Worker, API 설정, Streamlit과 원본 데이터도 그대로입니다.

## 두 가지 데이터 흐름

**Module 3 연결:** 실제 `runSimulation()` 완료 → `simData`·BARL·창업자 유형·트렌드·계산 결과 snapshot → `asnm:module3-complete` → 기존 `Module3Adapter` → `ASNMState` → Welcome → 입장 시 `StateStore` 세션 저장 → 기존 엔진과 Babylon World.

첫 매출 예상은 실제 `barl.months`에서 표시합니다. `barl.biases`, `failReason1/2/3`, 회사·인재·기술·원본 점수는 `provenance.module3`에 유지됩니다. 미입력 기대값은 만들지 않습니다. 자본은 기존 입력 화면의 단위에 따라 `capital × 10,000,000 KRW`로 전달합니다. 원래 scoring 설명의 단위 불일치는 기존 가정 문서에 명시되어 있으며 계산식을 바꾸지 않았습니다.

**독립 실행:** Digital Twin 탭 → 새 World → 벤처 / 팀·제품 / 시장 / 기대·Seed의 4단계 입력 → `StandaloneAdapter` → 같은 `ASNMState`와 `validateState()` → Welcome → 같은 `StateStore`, 엔진, World. `provenance.source`는 `standalone`입니다.

보고서는 진입 전제 조건이 아닙니다. Module 3 완료 후 보고서 또는 World를 선택하며, World의 리포트 탭에서 기존 Module 3 전체 리포트로 돌아갈 수도 있습니다.

## Founder / NPC 구조

Founder는 CEO Office에서 시작합니다. 방 메뉴나 3D 오브젝트 선택 → `selectRoom()` → `world.goToRoom()` → 카메라 보간·Founder 실제 위치 이동 → 도착 callback → 해당 NPC 카드입니다. 기본 mesh로 머리·몸통·팔·다리를 만들고 걷기/idle을 구현했습니다.

작은 격자 경로 탐색으로 방 외곽을 돌고 남쪽 출입구로 이동합니다. 중간에 다른 방을 선택하면 현재 위치에서 경로를 변경합니다. CFO·Customer·CTO·Developer·Marketer·Investor는 상태를 읽는 시각적 역할이며, 자동으로 결정을 실행하지 않습니다. 금액·Runway·유지율 등은 현재 state에서 읽습니다. NPC 인원은 실제 채용 인원이라는 의미가 아닙니다.

## 세션 보호

기존 세션이 있으면 Continue / Export / Start New 선택을 제공합니다. Wizard나 Welcome에 머무르는 동안 저장 세션은 교체되지 않습니다. World 입장 시 확정합니다. 기존 저장/JSON 재현 검증과 다른 탭 충돌 감지도 유지합니다.

## 검증

엔진·Adapter 테스트 **17/17 통과**. 브라우저 통합 테스트에서 한·영 완료→리포트, 완료→Welcome→World, 독립 Wizard, 실제 아바타 이동·NPC, 월별 결정, 새로고침, JSON export/import, 세션 보호, 모바일, WebGL/저장 차단 fallback을 확인했습니다. 자세한 환경과 결과는 `VALIDATION.md`를 확인하세요.

## 적용 및 URL

1. 기존 저장소의 main 기준으로 작업 브랜치를 만듭니다.
2. ZIP 안의 `index.html`, `en/`, `module4/`를 저장소 루트의 같은 경로에 복사합니다. ZIP 폴더 자체를 하위 디렉터리로 업로드하지 않습니다.
3. 파일을 검토하고 테스트한 다음 커밋·PR을 생성합니다.
4. 자동 merge는 하지 않습니다. 사용자가 검토 후 병합하면 기존 Pages 배포 절차로 공개됩니다.

예상 URL (병합·배포 이후):

- 한국어 메인: https://chloeislovely.github.io/adaptive-startup-navigation/
- 영어 메인: https://chloeislovely.github.io/adaptive-startup-navigation/en/
- Module 4: https://chloeislovely.github.io/adaptive-startup-navigation/module4/
- 영어 Module 4: https://chloeislovely.github.io/adaptive-startup-navigation/module4/?lang=en

권장 브랜치: `codex/module4-v2-living-world`
PR 제목: `Enhance Module 4 with Dual Entry and Living Venture World`

ZIP의 코드에는 API 키, 새 CDN, 새 빌드 시스템, 서버 의존성이 없습니다. 기존 vendor와 원본 파일은 교체 패키지에 중복 포함하지 않습니다.
