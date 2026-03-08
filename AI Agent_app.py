import streamlit as st
import pandas as pd
import plotly.express as px
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# =========================================================
# Page configuration
# =========================================================
st.set_page_config(
    page_title="Adaptive Startup Navigation System",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded",
)

# =========================================================
# Data loading
# =========================================================
@st.cache_data
def load_trend_data() -> pd.DataFrame:
    base_path = Path(__file__).parent
    csv_path = base_path / "data" / "trends.csv"

    if not csv_path.exists():
        st.error(f"Trend dataset not found: {csv_path}")
        st.stop()

    return pd.read_csv(csv_path)


# =========================================================
# Session state
# =========================================================
def init_session_state() -> None:
    defaults = {
        "project_name": "Adaptive Startup Navigation",
        "idea_description": "",
        "market_type": "B2B",
        "selected_opportunity": None,
        "chat_history": [],
        "founder_scores": {
            "Creative": 4,
            "Business": 3,
            "Technical": 2,
            "Operational": 4,
        },
        "ai_opportunity_brief": "",
        "ai_simulation_brief": "",
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


# =========================================================
# OpenAI helpers
# =========================================================
def ai_is_available() -> bool:
    return OpenAI is not None and "OPENAI_API_KEY" in st.secrets


def get_openai_client():
    if not ai_is_available():
        return None
    return OpenAI(api_key=st.secrets["OPENAI_API_KEY"])


def get_openai_model() -> str:
    return st.secrets.get("OPENAI_MODEL", "gpt-5.2")


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Uses OpenAI Responses API through the official Python client.
    Falls back gracefully if secrets are not configured.
    """
    if not ai_is_available():
        return (
            "AI features are currently running in fallback mode. "
            "Add OPENAI_API_KEY to Streamlit secrets to enable the live AI agent."
        )

    try:
        client = get_openai_client()
        response = client.responses.create(
            model=get_openai_model(),
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        text = getattr(response, "output_text", None)
        if text:
            return text.strip()
        return "The AI agent returned an empty response."
    except Exception as e:
        return f"AI agent error: {e}"


# =========================================================
# Core scoring logic
# =========================================================
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
    elif category == "Manufacturing":
        bonus = (founder_scores["Technical"] + founder_scores["Operational"]) / 2 * 0.1
    elif category == "Logistics":
        bonus = (founder_scores["Business"] + founder_scores["Operational"]) / 2 * 0.1

    return min(100, max(0, int((base + bonus) * 20)))


def get_market_alignment(category: str, market_type: str) -> int:
    market_map = {
        "Education": {"B2C": 85, "B2B": 80, "B2G": 90, "Hybrid": 88},
        "Workforce": {"B2C": 60, "B2B": 95, "B2G": 75, "Hybrid": 85},
        "PublicSector": {"B2C": 30, "B2B": 60, "B2G": 100, "Hybrid": 80},
        "Healthcare": {"B2C": 80, "B2B": 85, "B2G": 70, "Hybrid": 82},
        "Aging": {"B2C": 85, "B2B": 65, "B2G": 80, "Hybrid": 82},
        "ESG": {"B2C": 40, "B2B": 95, "B2G": 75, "Hybrid": 78},
        "Manufacturing": {"B2C": 20, "B2B": 100, "B2G": 50, "Hybrid": 72},
        "Logistics": {"B2C": 50, "B2B": 95, "B2G": 55, "Hybrid": 78},
        "Security": {"B2C": 65, "B2B": 90, "B2G": 80, "Hybrid": 82},
        "Content": {"B2C": 95, "B2B": 60, "B2G": 40, "Hybrid": 72},
        "Data": {"B2C": 50, "B2B": 90, "B2G": 70, "Hybrid": 78},
    }
    return market_map.get(category, {}).get(market_type, 60)


def get_competition_score(competition: str) -> int:
    comp_map = {"Low": 100, "Medium": 70, "High": 40}
    return comp_map.get(competition, 60)


def calc_founder_fit_by_category(founder_scores: dict, category: str) -> int:
    weights = {
        "Education": {"Creative": 0.30, "Business": 0.20, "Technical": 0.15, "Operational": 0.35},
        "Workforce": {"Creative": 0.20, "Business": 0.35, "Technical": 0.15, "Operational": 0.30},
        "PublicSector": {"Creative": 0.10, "Business": 0.30, "Technical": 0.15, "Operational": 0.45},
        "Healthcare": {"Creative": 0.10, "Business": 0.20, "Technical": 0.35, "Operational": 0.35},
        "Aging": {"Creative": 0.20, "Business": 0.15, "Technical": 0.20, "Operational": 0.45},
        "ESG": {"Creative": 0.10, "Business": 0.30, "Technical": 0.35, "Operational": 0.25},
        "Manufacturing": {"Creative": 0.05, "Business": 0.20, "Technical": 0.45, "Operational": 0.30},
        "Logistics": {"Creative": 0.05, "Business": 0.25, "Technical": 0.30, "Operational": 0.40},
        "Security": {"Creative": 0.05, "Business": 0.20, "Technical": 0.50, "Operational": 0.25},
        "Content": {"Creative": 0.45, "Business": 0.20, "Technical": 0.15, "Operational": 0.20},
        "Data": {"Creative": 0.10, "Business": 0.20, "Technical": 0.45, "Operational": 0.25},
    }

    cat_weights = weights.get(
        category,
        {"Creative": 0.25, "Business": 0.25, "Technical": 0.25, "Operational": 0.25},
    )

    weighted_sum = 0.0
    for key, weight in cat_weights.items():
        weighted_sum += founder_scores.get(key, 3) * weight

    return int((weighted_sum / 5) * 100)


def calculate_opportunity_score(row, founder_scores: dict, market_type: str) -> dict:
    demand_score = int(row["demand_strength"]) * 20
    founder_fit_score = calc_founder_fit_by_category(founder_scores, row["category"])
    market_alignment_score = get_market_alignment(row["category"], market_type)
    competition_score = get_competition_score(row["competition"])

    total_score = int(
        0.35 * demand_score
        + 0.35 * founder_fit_score
        + 0.20 * market_alignment_score
        + 0.10 * competition_score
    )

    return {
        "signal": row["signal"],
        "category": row["category"],
        "description": row["description"],
        "horizon": row["horizon"],
        "competition": row["competition"],
        "demand_score": demand_score,
        "founder_fit_score": founder_fit_score,
        "market_alignment_score": market_alignment_score,
        "competition_score": competition_score,
        "opportunity_score": total_score,
    }


def rank_opportunities(trends_df: pd.DataFrame, founder_scores: dict, market_type: str) -> pd.DataFrame:
    results = []
    for _, row in trends_df.iterrows():
        results.append(calculate_opportunity_score(row, founder_scores, market_type))

    return pd.DataFrame(results).sort_values(
        by="opportunity_score",
        ascending=False
    ).reset_index(drop=True)


def explain_opportunity_rule_based(row: dict) -> str:
    return (
        f"**{row['signal']}** is attractive because it combines "
        f"strong demand ({row['demand_score']}/100), "
        f"founder alignment ({row['founder_fit_score']}/100), and "
        f"market compatibility ({row['market_alignment_score']}/100). "
        f"This suggests a promising opportunity space in the **{row['category']}** domain "
        f"over the **{row['horizon']}** horizon."
    )


# =========================================================
# Venture-state simulation
# =========================================================
def simulate_venture(
    price: int,
    marketing_budget: int,
    team_size: int,
    cac: int,
    ltv: int,
    policy_risk: int,
) -> dict:
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


# =========================================================
# AI prompts
# =========================================================
def build_founder_context() -> str:
    scores = st.session_state.founder_scores
    return (
        f"Founder scores:\n"
        f"- Creative: {scores['Creative']}\n"
        f"- Business: {scores['Business']}\n"
        f"- Technical: {scores['Technical']}\n"
        f"- Operational: {scores['Operational']}\n"
        f"Founder type: {founder_type_from_scores(scores)}\n"
        f"Target market: {st.session_state.market_type}\n"
        f"Project name: {st.session_state.project_name}\n"
        f"Idea description: {st.session_state.idea_description or 'N/A'}"
    )


def build_opportunity_brief(top3_df: pd.DataFrame) -> str:
    rows = []
    for i, (_, row) in enumerate(top3_df.iterrows(), start=1):
        rows.append(
            f"{i}. {row['signal']} | category={row['category']} | "
            f"opportunity_score={row['opportunity_score']} | demand={row['demand_score']} | "
            f"founder_fit={row['founder_fit_score']} | market_fit={row['market_alignment_score']} | "
            f"competition_score={row['competition_score']} | horizon={row['horizon']}"
        )
    return "\n".join(rows)


def generate_ai_opportunity_analysis(top3_df: pd.DataFrame) -> str:
    system_prompt = (
        "You are a venture strategy professor and AI startup analyst. "
        "Interpret ranked opportunity spaces for an early-stage startup founder. "
        "Be specific, strategic, and concise. "
        "Return markdown with these sections: "
        "1) Best Opportunity, 2) Why It Fits This Founder, 3) Key Risks, 4) Recommended First Experiment."
    )
    user_prompt = (
        f"{build_founder_context()}\n\n"
        f"Top ranked opportunities:\n{build_opportunity_brief(top3_df)}\n\n"
        "Please interpret these results and recommend the best next move."
    )
    return call_llm(system_prompt, user_prompt)


def generate_ai_simulation_analysis(base_inputs: dict, result: dict, scenario_df: pd.DataFrame) -> str:
    system_prompt = (
        "You are an AI venture simulation interpreter. "
        "Analyze startup simulation outputs and explain what strategic adjustments matter most. "
        "Return markdown with these sections: "
        "1) Interpretation, 2) Primary Risk Driver, 3) What to Change First, 4) 2-Week Action Plan."
    )
    user_prompt = (
        f"{build_founder_context()}\n\n"
        f"Simulation inputs: {base_inputs}\n"
        f"Base result: {result}\n\n"
        f"Scenario comparison table:\n{scenario_df.to_string(index=False)}\n\n"
        "Interpret the venture-state results for an early-stage founder."
    )
    return call_llm(system_prompt, user_prompt)


def generate_ai_chat_reply(user_input: str) -> str:
    selected_opportunity = st.session_state.selected_opportunity or "None selected"
    system_prompt = (
        "You are an AI Startup Advisor inside an academic research prototype. "
        "You help founders make better early-stage decisions. "
        "Be concrete, analytical, and practical. "
        "Prefer short paragraphs and action steps."
    )
    user_prompt = (
        f"{build_founder_context()}\n"
        f"Selected opportunity: {selected_opportunity}\n\n"
        f"Founder question: {user_input}\n\n"
        "Answer as a startup strategy advisor."
    )
    return call_llm(system_prompt, user_prompt)


# =========================================================
# Utility
# =========================================================
def get_selected_row(trends_df: pd.DataFrame):
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
    "Navigation",
    [
        "Home",
        "Opportunity Discovery",
        "Founder Fit",
        "Digital Twin Simulation",
        "AI Advisor",
    ],
)

st.sidebar.markdown("---")
st.sidebar.write(f"**Project:** {st.session_state.project_name}")
st.sidebar.write(f"**Selected Opportunity:** {st.session_state.selected_opportunity or 'None'}")
st.sidebar.write(f"**Founder Type:** {founder_type_from_scores(st.session_state.founder_scores)}")
st.sidebar.write(f"**AI Mode:** {'Live' if ai_is_available() else 'Fallback'}")

selected_row = get_selected_row(trends_df)
selected_category = selected_row["category"] if selected_row is not None else None
current_fit_score = calc_founder_fit(st.session_state.founder_scores, selected_category)

# =========================================================
# Home
# =========================================================
if page == "Home":
    st.title("Adaptive Startup Navigation System")
    st.subheader("AI Agent + Venture Digital Twin Prototype")

    st.markdown(
        """
        This prototype demonstrates an **AI-assisted startup decision support system**.
        It combines:
        - **Future-led opportunity discovery**
        - **Founder capability profiling**
        - **Digital twin-style venture-state simulation**
        - **AI strategic interpretation**
        """
    )

    left, right = st.columns([1.2, 1])

    with left:
        st.session_state.project_name = st.text_input(
            "Project Name",
            value=st.session_state.project_name,
        )
        st.session_state.idea_description = st.text_area(
            "Startup Idea Description",
            value=st.session_state.idea_description,
            placeholder="Example: AI-enabled reskilling platform for SMEs / GovTech analytics tool / AI startup navigation platform",
            height=120,
        )
        market_options = ["B2C", "B2B", "B2G", "Hybrid"]
        current_market = st.session_state.market_type
        market_index = market_options.index(current_market) if current_market in market_options else 1
        st.session_state.market_type = st.selectbox(
            "Target Market",
            market_options,
            index=market_index,
        )

    with right:
        selected_competition = selected_row["competition"] if selected_row is not None else "Medium"
        selected_demand = int(selected_row["demand_strength"]) if selected_row is not None else 4
        home_opp_score = int(
            0.5 * current_fit_score
            + 0.3 * (selected_demand * 20)
            + 0.2 * get_competition_score(selected_competition)
        )

        st.markdown("### Current Status")
        c1, c2 = st.columns(2)
        c1.metric("Opportunity Score", f"{home_opp_score}")
        c2.metric("Founder Fit", f"{current_fit_score}")
        c1.metric("Risk Level", "Medium")
        c2.metric("Runway Estimate", "9 months")

        st.info("Recommended next step: identify a top opportunity, test founder alignment, then run venture-state simulation.")

    st.markdown("---")
    if selected_row is not None:
        st.success(
            f"Selected opportunity: **{selected_row['signal']}** | "
            f"Category: {selected_row['category']} | "
            f"Founder Fit: {current_fit_score}/100"
        )
    else:
        st.warning("No opportunity has been selected yet. Start in Opportunity Discovery.")

# =========================================================
# Opportunity Discovery
# =========================================================
elif page == "Opportunity Discovery":
    st.title("Future-Led Opportunity Discovery")
    st.caption("The AI Opportunity Ranking Engine prioritizes opportunity spaces using demand, founder fit, market alignment, and competition.")

    col1, col2 = st.columns(2)
    with col1:
        category_filter = st.multiselect(
            "Filter by Category",
            options=sorted(trends_df["category"].dropna().unique().tolist()),
            default=sorted(trends_df["category"].dropna().unique().tolist()),
        )
    with col2:
        horizon_filter = st.multiselect(
            "Filter by Horizon",
            options=sorted(trends_df["horizon"].dropna().unique().tolist()),
            default=sorted(trends_df["horizon"].dropna().unique().tolist()),
        )

    filtered_df = trends_df[
        trends_df["category"].isin(category_filter) &
        trends_df["horizon"].isin(horizon_filter)
    ].copy()

    st.markdown("### Trend Dataset")
    st.dataframe(filtered_df, use_container_width=True, height=240)

    if filtered_df.empty:
        st.warning("No trend signals match the current filters.")
    else:
        ranked_df = rank_opportunities(
            filtered_df,
            st.session_state.founder_scores,
            st.session_state.market_type,
        )

        st.markdown("### Top 3 Ranked Opportunities")
        top3 = ranked_df.head(3)

        for idx, row in top3.iterrows():
            with st.container(border=True):
                left, right = st.columns([3, 1])

                with left:
                    st.markdown(f"## #{idx+1} {row['signal']}")
                    st.write(f"**Category:** {row['category']}")
                    st.write(f"**Description:** {row['description']}")
                    st.write(f"**Horizon:** {row['horizon']}")
                    st.write(f"**Competition Level:** {row['competition']}")

                    c1, c2, c3, c4 = st.columns(4)
                    c1.metric("Opportunity Score", row["opportunity_score"])
                    c2.metric("Demand", row["demand_score"])
                    c3.metric("Founder Fit", row["founder_fit_score"])
                    c4.metric("Market Fit", row["market_alignment_score"])

                    st.success(explain_opportunity_rule_based(row))

                with right:
                    if st.button("Select", key=f"top_{idx}", use_container_width=True):
                        st.session_state.selected_opportunity = row["signal"]
                        st.success(f"{row['signal']} selected.")
                        st.rerun()

        st.markdown("---")
        st.markdown("### Full Ranking Table")
        st.dataframe(
            ranked_df[
                [
                    "signal",
                    "category",
                    "horizon",
                    "opportunity_score",
                    "demand_score",
                    "founder_fit_score",
                    "market_alignment_score",
                    "competition_score",
                ]
            ],
            use_container_width=True,
            height=320,
        )

        st.markdown("---")
        st.markdown("### AI Opportunity Analyst")
        if st.button("Generate AI Interpretation", use_container_width=False):
            with st.spinner("The AI agent is interpreting the top-ranked opportunities..."):
                st.session_state.ai_opportunity_brief = generate_ai_opportunity_analysis(top3)

        if st.session_state.ai_opportunity_brief:
            st.markdown(st.session_state.ai_opportunity_brief)

# =========================================================
# Founder Fit
# =========================================================
elif page == "Founder Fit":
    st.title("Founder Capability Profile")
    st.caption("This module estimates founder–opportunity alignment based on capability structure.")

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        creative = st.slider("Creative Capability", 1, 5, st.session_state.founder_scores["Creative"])
    with c2:
        business = st.slider("Business Capability", 1, 5, st.session_state.founder_scores["Business"])
    with c3:
        technical = st.slider("Technical Capability", 1, 5, st.session_state.founder_scores["Technical"])
    with c4:
        operational = st.slider("Operational Capability", 1, 5, st.session_state.founder_scores["Operational"])

    st.session_state.founder_scores = {
        "Creative": creative,
        "Business": business,
        "Technical": technical,
        "Operational": operational,
    }

    founder_label = founder_type_from_scores(st.session_state.founder_scores)
    selected_row = get_selected_row(trends_df)
    selected_category = selected_row["category"] if selected_row is not None else None
    fit_score = calc_founder_fit(st.session_state.founder_scores, selected_category)

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
        st.metric("Founder Type", founder_label)
        st.metric("Founder–Opportunity Fit", f"{fit_score}/100")

        st.markdown("### Interpretation")
        st.write("- Stronger creative and operational profiles tend to support education/content-oriented ventures.")
        st.write("- Higher business and operational scores support B2B/B2G execution capacity.")
        st.write("- Lower technical depth may suggest a need for a technical cofounder or prototyping partner.")

        if selected_row is not None:
            st.info(
                f"The currently selected opportunity is **{selected_row['signal']}** in **{selected_row['category']}**. "
                f"Estimated fit: **{fit_score}/100**."
            )
        else:
            st.warning("No opportunity selected yet.")

# =========================================================
# Digital Twin Simulation
# =========================================================
elif page == "Digital Twin Simulation":
    st.title("Venture Digital Twin Simulation")
    st.caption("This module simulates venture-state consequences under alternative strategic assumptions.")

    left, right = st.columns([1, 1.4])

    with left:
        st.markdown("### Strategic Inputs")
        price = st.slider("Price Strategy", 1, 20, 8)
        marketing_budget = st.slider("Monthly Marketing Budget", 100, 3000, 800, step=100)
        team_size = st.slider("Team Size", 1, 10, 3)
        cac = st.slider("Customer Acquisition Cost", 10, 300, 80, step=10)
        ltv = st.slider("Customer Lifetime Value", 50, 1000, 300, step=50)
        policy_risk = st.slider("Regulatory Risk", 1, 10, 4)

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
        m1.metric("Runway", f"{result['runway']} months")
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
            title="Risk Heatmap",
        )
        fig_bar.update_layout(margin=dict(l=20, r=20, t=50, b=20))
        st.plotly_chart(fig_bar, use_container_width=True)

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

    st.markdown("---")
    st.markdown("### AI Simulation Interpreter")
    if st.button("Interpret Simulation with AI", use_container_width=False):
        with st.spinner("The AI agent is interpreting simulation outcomes..."):
            st.session_state.ai_simulation_brief = generate_ai_simulation_analysis(
                base_inputs, result, scenario_df
            )

    if st.session_state.ai_simulation_brief:
        st.markdown(st.session_state.ai_simulation_brief)

# =========================================================
# AI Advisor
# =========================================================
elif page == "AI Advisor":
    st.title("AI Startup Advisor")
    st.caption("A context-aware AI founder assistant for strategy, validation, and next-step planning.")

    st.markdown("### Current Project Context")
    st.write(f"**Project:** {st.session_state.project_name}")
    st.write(f"**Idea:** {st.session_state.idea_description or 'N/A'}")
    st.write(f"**Selected Opportunity:** {st.session_state.selected_opportunity or 'None'}")
    st.write(f"**Founder Type:** {founder_type_from_scores(st.session_state.founder_scores)}")
    st.write(f"**Target Market:** {st.session_state.market_type}")

    st.markdown("---")
    st.markdown("### Chat with the AI Advisor")

    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    user_input = st.chat_input("Ask a strategic startup question")
    if user_input:
        st.session_state.chat_history.append({"role": "user", "content": user_input})

        with st.spinner("The AI advisor is thinking..."):
            response_text = generate_ai_chat_reply(user_input)

        st.session_state.chat_history.append({"role": "assistant", "content": response_text})
        st.rerun()

    st.markdown("---")
    st.markdown("### Quick Actions")
    c1, c2, c3 = st.columns(3)

    with c1:
        if st.button("Generate Interview Questions", use_container_width=True):
            prompt = (
                "Create 5 customer interview questions for validating an early-stage startup idea. "
                "Make them specific, open-ended, and useful for discovering pain points."
            )
            st.markdown(call_llm("You are a startup research assistant.", prompt))

    with c2:
        if st.button("Generate 2-Week Validation Plan", use_container_width=True):
            prompt = (
                f"{build_founder_context()}\n\n"
                "Create a practical 2-week validation plan for this founder and startup idea."
            )
            st.markdown(call_llm("You are a lean startup coach.", prompt))

    with c3:
        if st.button("Generate Founder Memo", use_container_width=True):
            prompt = (
                f"{build_founder_context()}\n\n"
                "Write a concise founder memo summarizing opportunity, risks, and next actions."
            )
            st.markdown(call_llm("You are a venture strategy memo assistant.", prompt))
