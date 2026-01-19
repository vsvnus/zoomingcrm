import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH_TOKEN = None  # Set this to a valid token if authentication is required


def get_headers():
    headers = {
        "Content-Type": "application/json",
    }
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    return headers


def create_proposal():
    url = f"{BASE_URL}/proposals"
    payload = {
        "title": "Test Proposal for Financial System",
        "clientId": 1,
        "items": [
            {"description": "Video Editing", "quantity": 1, "unitPrice": 1000},
            {"description": "Sound Mixing", "quantity": 1, "unitPrice": 500}
        ],
        "optionals": [
            {"description": "Extra Revisions", "quantity": 1, "unitPrice": 200}
        ],
        "paymentSchedules": [
            {"percentage": 50, "dueDate": "2026-02-01"},
            {"percentage": 50, "dueDate": "2026-03-01"}
        ],
        "portfolioVideos": ["https://portfolio.example.com/video1"],
        "status": "draft"
    }
    resp = requests.post(url, json=payload, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()["id"]


def accept_proposal(proposal_id):
    url = f"{BASE_URL}/proposals/{proposal_id}/accept"
    resp = requests.post(url, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def create_freelancer():
    url = f"{BASE_URL}/freelancers"
    payload = {
        "name": "Test Freelancer",
        "email": "freelancer@example.com",
        "rate": 100,
        "availability": ["2026-02-01", "2026-02-15"],
        "rating": 4.5
    }
    resp = requests.post(url, json=payload, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()["id"]


def allocate_freelancer(proposal_id, freelancer_id):
    url = f"{BASE_URL}/freelancer_allocations"
    payload = {
        "proposalId": proposal_id,
        "freelancerId": freelancer_id,
        "rate": 100
    }
    resp = requests.post(url, json=payload, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()["id"]


def get_transactions():
    url = f"{BASE_URL}/financial/transactions"
    resp = requests.get(url, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def get_accounts_receivable():
    url = f"{BASE_URL}/financial/accounts_receivable"
    resp = requests.get(url, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def get_accounts_payable():
    url = f"{BASE_URL}/financial/accounts_payable"
    resp = requests.get(url, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def get_cashflow_dashboard():
    url = f"{BASE_URL}/financial/cashflow_dashboard"
    resp = requests.get(url, headers=get_headers(), timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def delete_resource(endpoint, resource_id):
    url = f"{BASE_URL}/{endpoint}/{resource_id}"
    resp = requests.delete(url, headers=get_headers(), timeout=TIMEOUT)
    # It's okay if deletion fails in cleanup, so no raise_for_status here


def test_financial_system_transactions_and_dashboard():
    try:
        # Step 1: Create a proposal
        proposal_id = create_proposal()

        # Step 2: Accept the proposal to trigger accounts receivable creation
        accept_data = accept_proposal(proposal_id)
        assert accept_data.get("status") == "accepted", "Proposal acceptance failed"

        # Step 3: Create a freelancer
        freelancer_id = create_freelancer()

        # Step 4: Allocate freelancer to proposal to trigger payable transactions
        allocation_id = allocate_freelancer(proposal_id, freelancer_id)
        assert allocation_id is not None, "Freelancer allocation failed"

        # Step 5: Validate financial transactions include receivable and payable
        transactions = get_transactions()
        receivables = get_accounts_receivable()
        payables = get_accounts_payable()
        assert isinstance(transactions, list), "Transactions should be a list"
        assert any(t.get("proposalId") == proposal_id for t in transactions), "No transactions for proposal found"
        assert any(r.get("proposalId") == proposal_id for r in receivables), "No accounts receivable for proposal"
        assert any(p.get("freelancerId") == freelancer_id for p in payables), "No accounts payable for freelancer"

        # Step 6: Validate cash flow dashboard metrics presence
        dashboard = get_cashflow_dashboard()
        assert "total_inflow" in dashboard, "Dashboard missing total_inflow"
        assert "total_outflow" in dashboard, "Dashboard missing total_outflow"
        assert isinstance(dashboard.get("cash_balance"), (int, float)), "Invalid cash balance format"

    finally:
        # Cleanup resources
        if 'allocation_id' in locals():
            delete_resource("freelancer_allocations", allocation_id)
        if 'freelancer_id' in locals():
            delete_resource("freelancers", freelancer_id)
        if 'proposal_id' in locals():
            delete_resource("proposals", proposal_id)


test_financial_system_transactions_and_dashboard()
