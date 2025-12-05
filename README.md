# sumone-nativewind-mcp

styled-components/Tamagui/@monymony-public/ui-core → NativeWind 마이그레이션용 MCP 서버

## 설치

```bash
yarn && yarn build
```

## MCP 설정

```bash
claude mcp add -s project sumone-nativewind-mcp -- node $PATH_TO_SUMONE_NATIVEWIND_MCP/dist/index.js
```

확인: `/mcp`

## 개발

```bash
yarn dev      # Watch mode
yarn test     # Run tests
yarn test:run # Run tests once
```

---

# 사용 가이드

## 개요

MCP 도구 = **분석 + 제안** 담당
Claude Code = **실제 파일 작성** 담당

---

## 마이그레이션 워크플로우

### Step 1: Plan Mode 진입
`Shift+Tab`

### Step 2: 자연어로 요청
```
"sumone-mobile의 ComponentA를 sumone-new-arch로 마이그레이션해줘. sumone-nativewind-mcp를 사용해."
```

### Step 3: Claude가 MCP 도구로 분석
- `analyze_component` → 패턴 파악
- `suggest_migration` → 변환 방법 제안
- `get_token_mapping` → 토큰 매핑 확인

### Step 4: 계획 승인 후 실행
- Claude Code가 제안 기반으로 실제 파일 작성

---

## 도구 목록

| 도구 | 용도 |
|------|------|
| `analyze_component` | 스타일 패턴 분석 |
| `convert_styles` | 변환 제안 (dryRun) |
| `get_token_mapping` | 토큰 → Tailwind 매핑 |
| `suggest_migration` | 복잡 패턴 마이그레이션 제안 |
| `batch_analyze` | 디렉토리 전체 스캔 |
| `generate_tailwind_config` | Tailwind 설정 생성 |

---

## 지원 패턴

- `styled-components/native`
- `Tamagui styled()`
- `@monymony-public/ui-core` (XStack, YStack, Typography, Button)

---

## 주의사항

- 레거시 토큰 (`theme.main.colors.*`) → `legacy-*` 클래스
- 로케일별 typography 다름 (ko/en/ja 등)
- `batch_analyze`로 전체 범위 먼저 파악
