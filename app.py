import streamlit as st
import pandas as pd
import plotly.express as px

# =========================================================
# Page config
# =========================================================
st.set_page_config(
    page_title="Adaptive Startup Navigation",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded",
)

# =========================================================
# Helpers
# =========================================================
@st.cache_data
def load_trend_data() -> pd.DataFrame:
    return pd.read_csv("data/trends.csv")


def init_session_state() -> None:
    defaults = {
        "project_name": "Adaptive Startup Navigation Demo",
        "idea_desc": "",
        "market_type": "B2B",
        "selected_opportunity": None,
        "chat_history": [],
        "founder_scores": {
            "Creative": 4,
            "Business": 3,
            "Technical": 2,
            "Operational": 4,
        },
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def founder_type_from_scores(scores: dict) -> str:
    return max(scores, key=scores.get)


def calc_founder_fit(founder_scores: dict, category: str | None) -> int:
    base = sum(founder_scores.values()) / 4.0
    bonus = 0.0

    if category == "Education":
        bonus = (founder_scores["Creative"] + founder_scores["Operational"]) / 2 * 0.1
    elif category == "PublicSector":
        bonus = (founder_scores["Business"] + founder_scores["Operational"]) / 2 * 0.1
    elif category == "Workforce":
        bonus = (founder_scores["Business"] + founder_scores["Creative"]) / 2 * 0.1
    elif category == "Aging":
        bonus = founder_scores["Operational"] * 0.1
    elif category == "ESG":
        bonus = founder_scores["Technical"] * 0.1
    elif category == "Healthcare":
        bonus = (founder_scores["Technical"] + founder_scores["Operational"]) / 2 * 0.1
    elif category == "Security":
        bonus = founder_scores["Technical"] * 0.1
    elif category == "Content":
        bonus = founder_scores["Creative"] * 0.1
    elif category == "Data":
        bonus = founder_scores["Technical"] * 0.1

    fit_score = min(100, max(0, int((base + bonus) * 20)))
    return fit_score


def opportunity_score(demand_strength: int, fit_score: int, competition: str) -> int:
    comp_map = {"Low": 90, "Medium": 70, "High": 50}
    competition_score = comp_map.get(competition, 60)

    score = int((demand_strength * 15) + (fit_score * 0.4) + (competition_score * 0.2))
    return min(100, max(0, score))


def simulate_venture(
    price: int,
    marketing_budget: int,
    team_size: int,
    cac: int,
    ltv: int,
    policy_risk: int,
) -> dict:
    # 단순 MVP용 시뮬레이션 로직
    monthly_revenue = max(0, (ltv * 40) - (cac * 15) + (price * 8))
    burn_rate = (team_size * 300) + marketing_budget + (policy_risk * 100)
    runway = max(1, int((10000 / max(burn_rate, 1)) * 12))
    survival_probability = max(5, min(95, int((monthly_revenue / max(burn_rate, 1)) * 100)))

    risk_score = min(100, int((cac * 0.2) + (policy_risk * 6) + (team_size * 4)))
    pmf_signal = max(10, min(100, int((ltv / max(cac, 1)) * 35)))

    return {
        "monthly_revenue": int(monthly_revenue),
        "burn_rate": int(burn_rate),
        "runway": int(runway),
        "survival_probability": int(survival_probability),
        "risk_score": int(risk_score),
        "pmf_signal": int(pmf_signal),
    }


def make_cashflow_df(revenue: int, burn_rate: int) -> pd.DataFrame:
    months = list(range(1, 13))
    cash = 10000
    balances = []

    for month in months:
        cash = cash + revenue - burn_rate
        balances.append(cash)

    return pd.DataFrame({"Month": months, "Cash Balance": balances})


def make_scenario_df(base_inputs: dict) -> pd.DataFrame:
    scenarios = {
        "Base": base_inputs,
        "Best": {
            **base_inputs,
            "cac": max(10, int(base_inputs["cac"] * 0.8)),
            "ltv": int(base_inputs["ltv"] * 1.2),
            "policy_risk": max(1, base_inputs["policy_risk"] - 1),
        },
        "Worst": {
            **base_inputs,
            "cac": int(base_inputs["cac"] * 1.25),
            "ltv": max(50, int(base_inputs["ltv"] * 0.85)),
            "policy_risk": min(10, base_inputs["policy_risk"] + 2),
        },
    }

    rows = []
    for name, params in scenarios.items():
        result = simulate_venture(
            price=params["price"],
            marketing_budget=params["marketing_budget"],
            team_size=params["team_size"],
            cac=params["cac"],
            ltv=params["ltv"],
            policy_risk=params["policy_risk"],
        )
        rows.append(
            {
                "Scenario": name,
                "Runway": result["runway"],
                "Survival Probability": result["survival_probability"],
                "Monthly Revenue": result["monthly_revenue"],
                "Burn Rate": result["burn_rate"],
                "Risk Score": result["risk_score"],
                "PMF Signal": result["pmf_signal"],
            }
        )
    return pd.DataFrame(rows)


def topic_ai_comment(row: pd.Series, fit_score: int) -> str:
    return (
        f"이 기회영역은 **{row['signal']}** 입니다. "
        f"수요 강도는 **{row['demand_strength']}**, 시간축은 **{row['horizon']}**, "
        f"경쟁 강도는 **{row['competition']}** 입니다. "
        f"현재 founder fit은 **{fit_score}/100** 수준으로 해석되며, "
        f"초기에는 큰 시장 전체를 노리기보다 세부 고객군을 좁혀 파일럿을 수행하는 전략이 적절합니다."
    )


def founder_ai_comment(founder_type: str, fit_score: int) -> str:
    if fit_score >= 80:
        level = "매우 높은 편"
    elif fit_score >= 65:
        level = "꽤 높은 편"
    elif fit_score >= 50:
        level = "보통 수준"
    else:
        level = "보완이 많이 필요"

    return (
        f"현재 founder type은 **{founder_type}** 성향이 강합니다. "
        f"선택한 기회영역과의 적합도는 **{fit_score}/100** 으로 {level}입니다. "
        f"아이디어 자체를 바꾸기보다, 부족한 역할을 팀 또는 파트너십으로 보완하는 전략이 더 현실적입니다."
    )


def simulation_ai_comment(result: dict) -> str:
    return (
        f"현재 시나리오에서 runway는 **{result['runway']}개월**, "
        f"생존확률은 **{result['survival_probability']}%**, PMF 신호는 **{result['pmf_signal']}점**입니다. "
        f"핵심 리스크는 **CAC와 정책/시장 변수**이며, "
        f"다음 단계에서는 마케팅비 확대보다 세그먼트 정교화와 전환율 개선 실험이 우선입니다."
    )


def get_selected_row(trends_df: pd.DataFrame) -> pd.Series | None:
    selected_signal = st.session_state.selected_opportunity
    if not selected_signal:
        return None
    matched = trends_df[trends_df["signal"] == selected_signal]
    if matched.empty:
        return None
    return matched.iloc[0]


# =========================================================
# Init
# =========================================================
init_session_state()
trends_df = load_trend_data()

# =========================================================
# Sidebar
# =========================================================
st.sidebar.title("🚀 Adaptive Startup Navigation")

page = st.sidebar.radio(
    "메뉴 선택",
    [
        "Home",
        "Topic Discovery",
        "Founder Fit",
        "Simulation Twin",
        "AI Action Room",
    ],
)

st.sidebar.markdown("---")
st.sidebar.write(f"**Project:** {st.session_state.project_name}")
st.sidebar.write(
    f"**Selected Opportunity:** {st.session_state.selected_opportunity or '없음'}"
)
st.sidebar.write(
    f"**Founder Type:** {founder_type_from_scores(st.session_state.founder_scores)}"
)

selected_row = get_selected_row(trends_df)
selected_category = selected_row["category"] if selected_row is not None else None
current_fit_score = calc_founder_fit(st.session_state.founder_scores, selected_category)

# =========================================================
# Home
# =========================================================
if page == "Home":
    st.title("Adaptive Startup Navigation")
    st.subheader("Startup Overview Dashboard")

    left, right = st.columns([1.2, 1])

    with left:
        st.session_state.project_name = st.text_input(
            "프로젝트명",
            value=st.session_state.project_name,
        )
        st.session_state.idea_desc = st.text_area(
            "아이디어 한 줄 설명",
            value=st.session_state.idea_desc,
            placeholder="예: AI 기반 재교육 플랫폼 / 공공 교육용 AI 도구 / 디지털 트윈 기반 창업 의사결정 지원",
            height=120,
        )
        market_options = ["B2C", "B2B", "B2G", "Hybrid"]
        current_market = st.session_state.market_type
        market_index = market_options.index(current_market) if current_market in market_options else 1
        st.session_state.market_type = st.selectbox(
            "목표 시장",
            market_options,
            index=market_index,
        )

    with right:
        selected_competition = selected_row["competition"] if selected_row is not None else "Medium"
        selected_demand = int(selected_row["demand_strength"]) if selected_row is not None else 4
        home_opp_score = opportunity_score(selected_demand, current_fit_score, selected_competition)

        st.markdown("### 현재 상태 요약")
        c1, c2 = st.columns(2)
        c1.metric("Opportunity Score", f"{home_opp_score}")
        c2.metric("Founder Fit", f"{current_fit_score}")
        c1.metric("Risk Level", "Medium")
        c2.metric("Runway Estimate", "9개월")

        st.info("Recommended Next Action: 트렌드 탐색 후, 선택한 기회영역을 시뮬레이션으로 보내세요.")

    st.markdown("---")
    st.markdown("### 빠른 시작")
    c1, c2, c3 = st.columns(3)
    with c1:
        st.button("트렌드 탐색 시작", use_container_width=True)
    with c2:
        st.button("Founder 진단 시작", use_container_width=True)
    with c3:
        st.button("시뮬레이션 시작", use_container_width=True)

    st.markdown("---")
    st.markdown("### 현재 선택된 기회영역 요약")
    if selected_row is not None:
        opp_score = opportunity_score(
            int(selected_row["demand_strength"]),
            current_fit_score,
            str(selected_row["competition"]),
        )
        st.success(
            f"**{selected_row['signal']}** | Category: {selected_row['category']} | "
            f"Fit: {current_fit_score}/100 | Opportunity Score: {opp_score}/100"
        )
    else:
        st.warning("아직 선택된 기회영역이 없습니다. Topic Discovery에서 하나를 선택하세요.")

# =========================================================
# Topic Discovery
# =========================================================
elif page == "Topic Discovery":
    st.title("Future-Led Topic Discovery")
    st.caption("미래 신호를 바탕으로 기회영역을 탐색합니다.")

    col1, col2 = st.columns(2)
    with col1:
        category_filter = st.multiselect(
            "산업 카테고리 선택",
            options=sorted(trends_df["category"].dropna().unique().tolist()),
            default=sorted(trends_df["category"].dropna().unique().tolist()),
        )
    with col2:
        horizon_filter = st.multiselect(
            "시간축 선택",
            options=sorted(trends_df["horizon"].dropna().unique().tolist()),
            default=sorted(trends_df["horizon"].dropna().unique().tolist()),
        )

    filtered_df = trends_df[
        trends_df["category"].isin(category_filter) &
        trends_df["horizon"].isin(horizon_filter)
    ].copy()

    st.markdown("### 미래 신호 목록")
    st.dataframe(filtered_df, use_container_width=True, height=260)

    st.markdown("### Opportunity Cards")
    if filtered_df.empty:
        st.warning("선택한 필터에 해당하는 데이터가 없습니다.")
    else:
        for idx, row in filtered_df.iterrows():
            row_fit_score = calc_founder_fit(st.session_state.founder_scores, row["category"])
            row_opp_score = opportunity_score(
                int(row["demand_strength"]),
                row_fit_score,
                str(row["competition"]),
            )

            with st.container(border=True):
                left, right = st.columns([3, 1])

                with left:
                    st.markdown(f"## {row['signal']}")
                    st.write(row["description"])
                    m1, m2, m3 = st.columns(3)
                    m1.metric("Demand Strength", row["demand_strength"])
                    m2.metric("Founder Fit", row_fit_score)
                    m3.metric("Opportunity Score", row_opp_score)

                    st.write(f"**Category:** {row['category']}")
                    st.write(f"**Time Horizon:** {row['horizon']}")
                    st.write(f"**Competition:** {row['competition']}")

                    st.success(topic_ai_comment(row, row_fit_score))

                with right:
                    if st.button("선택하기", key=f"select_{idx}", use_container_width=True):
                        st.session_state.selected_opportunity = row["signal"]
                        st.success(f"{row['signal']} 선택됨")
                        st.rerun()

    if st.session_state.selected_opportunity:
        st.info(f"현재 선택된 기회영역: {st.session_state.selected_opportunity}")

# =========================================================
# Founder Fit
# =========================================================
elif page == "Founder Fit":
    st.title("Founder–Idea Fit Diagnosis")
    st.caption("창업자 성향과 선택한 기회영역의 적합도를 진단합니다.")

    st.markdown("### Founder Capability Input")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        creative = st.slider("Creative", 1, 5, st.session_state.founder_scores["Creative"])
    with c2:
        business = st.slider("Business", 1, 5, st.session_state.founder_scores["Business"])
    with c3:
        technical = st.slider("Technical", 1, 5, st.session_state.founder_scores["Technical"])
    with c4:
        operational = st.slider("Operational", 1, 5, st.session_state.founder_scores["Operational"])

    st.session_state.founder_scores = {
        "Creative": creative,
        "Business": business,
        "Technical": technical,
        "Operational": operational,
    }

    founder_type = founder_type_from_scores(st.session_state.founder_scores)
    selected_row = get_selected_row(trends_df)
    selected_category = selected_row["category"] if selected_row is not None else None
    fit_score = calc_founder_fit(st.session_state.founder_scores, selected_category)

    st.markdown("---")
    left, right = st.columns([1, 1.3])

    with left:
        radar_df = pd.DataFrame(
            {
                "Capability": ["Creative", "Business", "Technical", "Operational"],
                "Score": [creative, business, technical, operational],
            }
        )
        fig = px.line_polar(
            radar_df,
            r="Score",
            theta="Capability",
            line_close=True,
        )
        fig.update_traces(fill="toself")
        fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
        st.plotly_chart(fig, use_container_width=True)

    with right:
        st.metric("Founder Type", founder_type)
        st.metric("Founder–Idea Fit", f"{fit_score}/100")

        st.markdown("### 진단 결과")
        st.write("**강점**")
        st.write("- 교육/콘텐츠/기획 기반 실행 가능성")
        st.write("- 운영 및 협업 구조화 능력")
        st.write("- 창의적 문제 정의 가능")

        st.write("**보완 필요**")
        st.write("- 기술 구현 파트너 또는 no-code 빌더 필요 가능")
        st.write("- 초기 B2B/B2G 세일즈 설계 보완 필요")

        st.write("**추천 팀 보완**")
        st.write("- Technical partner")
        st.write("- B2B/B2G partnership advisor")

        st.info(founder_ai_comment(founder_type, fit_score))

    if selected_row is None:
        st.warning("아직 선택된 기회영역이 없습니다. Topic Discovery에서 먼저 하나를 선택하세요.")
    else:
        st.success(f"현재 선택된 기회영역: {selected_row['signal']} ({selected_row['category']})")

# =========================================================
# Simulation Twin
# =========================================================
elif page == "Simulation Twin":
    st.title("Digital Twin Simulation Dashboard")
    st.caption("전략 레버를 조정하면서 venture-state를 비교합니다.")

    left, right = st.columns([1, 1.4])

    with left:
        st.markdown("### 전략 레버 조정")
        price = st.slider("가격 전략", 1, 20, 8)
        marketing_budget = st.slider("월 마케팅 예산", 100, 3000, 800, step=100)
        team_size = st.slider("팀 규모", 1, 10, 3)
        cac = st.slider("CAC", 10, 300, 80, step=10)
        ltv = st.slider("LTV", 50, 1000, 300, step=50)
        policy_risk = st.slider("정책/규제 쇼크", 1, 10, 4)

        base_inputs = {
            "price": price,
            "marketing_budget": marketing_budget,
            "team_size": team_size,
            "cac": cac,
            "ltv": ltv,
            "policy_risk": policy_risk,
        }

        result = simulate_venture(**base_inputs)

    with right:
        m1, m2, m3 = st.columns(3)
        m1.metric("Runway", f"{result['runway']}개월")
        m2.metric("Survival Probability", f"{result['survival_probability']}%")
        m3.metric("PMF Signal", f"{result['pmf_signal']}")

        m4, m5, m6 = st.columns(3)
        m4.metric("Monthly Revenue", f"{result['monthly_revenue']}")
        m5.metric("Burn Rate", f"{result['burn_rate']}")
        m6.metric("Risk Score", f"{result['risk_score']}")

        cashflow_df = make_cashflow_df(
            revenue=result["monthly_revenue"],
            burn_rate=result["burn_rate"],
        )
        fig_line = px.line(
            cashflow_df,
            x="Month",
            y="Cash Balance",
            title="12-Month Cash Balance Projection",
            markers=True,
        )
        fig_line.update_layout(margin=dict(l=20, r=20, t=50, b=20))
        st.plotly_chart(fig_line, use_container_width=True)

        risk_df = pd.DataFrame(
            {
                "Risk Type": ["Market", "Team", "Financial", "Policy"],
                "Score": [
                    min(100, int(cac * 0.3)),
                    min(100, int(team_size * 10)),
                    min(100, result["risk_score"]),
                    min(100, int(policy_risk * 10)),
                ],
            }
        )
        fig_bar = px.bar(
            risk_df,
            x="Risk Type",
            y="Score",
            title="Risk Heatmap (Simplified)",
        )
        fig_bar.update_layout(margin=dict(l=20, r=20, t=50, b=20))
        st.plotly_chart(fig_bar, use_container_width=True)

        st.info(simulation_ai_comment(result))

    st.markdown("---")
    st.markdown("### Scenario Comparison")
    scenario_df = make_scenario_df(base_inputs)
    st.dataframe(scenario_df, use_container_width=True)

    fig_compare = px.bar(
        scenario_df,
        x="Scenario",
        y=["Survival Probability", "PMF Signal"],
        barmode="group",
        title="Scenario Comparison",
    )
    fig_compare.update_layout(margin=dict(l=20, r=20, t=50, b=20))
    st.plotly_chart(fig_compare, use_container_width=True)

# =========================================================
# AI Action Room
# =========================================================
elif page == "AI Action Room":
    st.title("AI Founder Assistant")
    st.caption("질문 → 해석 → 추천 → 다음 액션으로 연결합니다.")

    st.markdown("### 현재 프로젝트 컨텍스트")
    st.write(f"**Project:** {st.session_state.project_name}")
    st.write(f"**Idea:** {st.session_state.idea_desc if st.session_state.idea_desc else '아직 없음'}")
    st.write(
        f"**Selected Opportunity:** "
        f"{st.session_state.selected_opportunity if st.session_state.selected_opportunity else '아직 없음'}"
    )
    st.write(f"**Founder Type:** {founder_type_from_scores(st.session_state.founder_scores)}")

    st.markdown("---")
    st.markdown("### AI 대화창")

    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    user_input = st.chat_input("질문을 입력하세요. 예: 지금 B2G로 가는 게 좋을까?")
    if user_input:
        st.session_state.chat_history.append({"role": "user", "content": user_input})

        response_text = (
            f"질문: **{user_input}**\n\n"
            "현재 시스템 기준으로 보면,\n"
            "1. 선택한 기회영역과 founder fit을 먼저 확인하고\n"
            "2. simulation 결과에서 runway와 CAC를 함께 보며\n"
            "3. 그 다음에 B2B/B2G 우선순위를 결정하는 것이 좋습니다.\n\n"
            "추천 다음 액션:\n"
            "- 고객 인터뷰 5건 설계\n"
            "- 초기 파일럿 세그먼트 1개만 선택\n"
            "- 2주 단위 지표 실험 설계"
        )
        st.session_state.chat_history.append({"role": "assistant", "content": response_text})
        st.rerun()

    st.markdown("---")
    st.markdown("### 빠른 액션 생성")
    c1, c2, c3 = st.columns(3)

    with c1:
        if st.button("고객 인터뷰 질문 생성", use_container_width=True):
            st.success(
                "1) 지금 가장 불편한 문제는 무엇인가요?\n"
                "2) 현재 어떤 방식으로 해결하고 있나요?\n"
                "3) 비용을 지불할 의향이 있나요?\n"
                "4) 어떤 기능이 가장 중요하다고 느끼나요?\n"
                "5) 도입 시 가장 큰 장애물은 무엇인가요?"
            )

    with c2:
        if st.button("Validation Plan 생성", use_container_width=True):
            st.success(
                "2주 Validation Plan\n"
                "- Day 1~3: 고객 세그먼트 정의\n"
                "- Day 4~7: 인터뷰 5~10건 수행\n"
                "- Day 8~10: 핵심 pain point 재정리\n"
                "- Day 11~14: MVP 가설 수정"
            )

    with c3:
        if st.button("Founder Memo 생성", use_container_width=True):
            st.info(
                "Founder Memo\n"
                "- 현재 아이디어는 초기 기회영역으로 유효함\n"
                "- 다만 실행 리스크는 기술/세일즈 구조에 있음\n"
                "- 다음 단계는 시장 검증과 팀 보완의 병행이 필요함"
            )
