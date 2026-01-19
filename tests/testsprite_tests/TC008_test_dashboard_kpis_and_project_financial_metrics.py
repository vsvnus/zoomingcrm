import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_dashboard_kpis_and_project_financial_metrics():
    url = f"{BASE_URL}/dashboard"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to dashboard endpoint failed: {e}"

    if not response.content:
        assert False, "Dashboard endpoint returned empty response"

    try:
        data = response.json()
    except Exception as e:
        assert False, f"Response is not valid JSON: {e}"

    # Validate main dashboard sections existence
    assert "kpis" in data, "Missing KPIs section in dashboard response"
    assert isinstance(data["kpis"], dict), "KPIs should be a dictionary"

    assert "recentProjects" in data, "Missing recentProjects section in dashboard response"
    assert isinstance(data["recentProjects"], list), "recentProjects should be a list"

    assert "shootingSchedules" in data, "Missing shootingSchedules section in dashboard response"
    assert isinstance(data["shootingSchedules"], list), "shootingSchedules should be a list"

    assert "financialMetrics" in data, "Missing financialMetrics section in dashboard response"
    assert isinstance(data["financialMetrics"], dict), "financialMetrics should be a dictionary"

    # Basic KPI content validation
    kpis = data["kpis"]
    required_kpis = ["totalProjects", "activeProjects", "completedProjects", "overdueProjects"]
    for kpi in required_kpis:
        assert kpi in kpis, f"Missing KPI key: {kpi}"
        assert isinstance(kpis[kpi], (int, float)), f"KPI {kpi} should be a number"

    # Recent projects content validation
    recent_projects = data["recentProjects"]
    for project in recent_projects:
        assert isinstance(project, dict), "Each recent project should be a dictionary"
        assert "id" in project, "Project missing 'id'"
        assert "name" in project, "Project missing 'name'"
        assert "status" in project, "Project missing 'status'"
        assert "shootingDates" in project, "Project missing 'shootingDates'"
        assert isinstance(project["shootingDates"], list), "'shootingDates' should be a list"

    # Shooting schedules content validation
    shooting_schedules = data["shootingSchedules"]
    for schedule in shooting_schedules:
        assert isinstance(schedule, dict), "Each shooting schedule should be a dictionary"
        assert "projectId" in schedule, "Schedule missing 'projectId'"
        assert "date" in schedule, "Schedule missing 'date'"
        assert "location" in schedule, "Schedule missing 'location'"

    # Financial metrics validation
    financial_metrics = data["financialMetrics"]
    required_fin_metrics = ["totalRevenue", "totalExpenses", "netProfit", "outstandingReceivables", "outstandingPayables"]
    for metric in required_fin_metrics:
        assert metric in financial_metrics, f"Missing financial metric: {metric}"
        assert isinstance(financial_metrics[metric], (int, float)), f"Financial metric {metric} should be a number"

test_dashboard_kpis_and_project_financial_metrics()
