import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-token-for-test"  # Replace with valid token if required

headers = {
    "Authorization": AUTH_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

ORGANIZATION_ID = str(uuid.uuid4())  # Dummy organization ID for multi-tenancy scoping

def test_proposals_builder_and_financial_integration():
    # Helper function to create proposal with required data
    def create_proposal(client_id):
        proposal_payload = {
            "title": "Test Proposal " + str(uuid.uuid4()),
            "client_id": client_id,
            "items": [
                {"description": "Video Production Service", "quantity": 1, "unit_price": 5000},
                {"description": "Editing Service", "quantity": 1, "unit_price": 2000}
            ],
            "optionals": [
                {"description": "Extra Drone Shots", "quantity": 1, "unit_price": 500}
            ],
            "payment_schedules": [
                {"installment": 1, "percentage": 50},
                {"installment": 2, "percentage": 50}
            ],
            "portfolio_videos": [
                {"url": "https://youtu.be/dQw4w9WgXcQ", "description": "Embedded Portfolio Video"}
            ],
            "public_sharing": True
        }
        return proposal_payload

    # Helper to create a client needed for the proposal
    client_payload = {
        "name": "Test Client " + str(uuid.uuid4()),
        "email": "client+" + str(uuid.uuid4())[:8] + "@example.com",
        "company": "Test Company",
        "notes": "Created for proposal builder test"
    }

    client_id = None
    proposal_id = None
    try:
        # Create client
        client_resp = requests.post(
            f"{BASE_URL}/api/clients",
            json=client_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert client_resp.status_code == 201, f"Client creation failed: {client_resp.text}"
        client_data = client_resp.json()
        client_id = client_data.get("id")
        assert client_id is not None, "Client ID is missing in response"

        # Create proposal with the client_id
        proposal_payload = create_proposal(client_id)

        proposal_resp = requests.post(
            f"{BASE_URL}/api/proposals",
            json=proposal_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert proposal_resp.status_code == 201, f"Proposal creation failed: {proposal_resp.text}"
        proposal_data = proposal_resp.json()
        proposal_id = proposal_data.get("id")
        assert proposal_id is not None, "Proposal ID is missing in creation response"

        # Verify proposal totals calculation & payment schedule validation
        # Fetch the proposal back to validate saved data & totals
        get_proposal_resp = requests.get(
            f"{BASE_URL}/api/proposals/{proposal_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_proposal_resp.status_code == 200, f"Failed to fetch proposal: {get_proposal_resp.text}"
        fetched_proposal = get_proposal_resp.json()

        # Validate items
        assert "items" in fetched_proposal and len(fetched_proposal["items"]) == 2, "Proposal items count mismatch"
        assert "optionals" in fetched_proposal and len(fetched_proposal["optionals"]) == 1, "Proposal optionals count mismatch"
        assert abs(sum(item["quantity"]*item["unit_price"] for item in fetched_proposal["items"])
                   + sum(opt["quantity"]*opt["unit_price"] for opt in fetched_proposal["optionals"])
                   - fetched_proposal.get("total", 0)) < 0.01, "Proposal total calculation mismatch"

        # Validate payment schedules sums to <= 100%
        payment_percent_sum = sum(sch["percentage"] for sch in fetched_proposal.get("payment_schedules", []))
        assert payment_percent_sum <= 100, "Payment schedule percentage sum exceeds 100%"

        # Validate embedded portfolio videos present
        assert "portfolio_videos" in fetched_proposal and len(fetched_proposal["portfolio_videos"]) == 1, "Portfolio videos missing"

        # Validate public sharing link presence
        public_token = fetched_proposal.get("public_token")
        assert (fetched_proposal.get("public_sharing") is True) and (public_token is not None), "Public sharing or token missing"

        # Simulate client accessing public sharing link and accepting proposal
        public_proposal_resp = requests.get(
            f"{BASE_URL}/api/proposals/public/{public_token}",
            headers={"Accept": "application/json"},
            timeout=TIMEOUT
        )
        assert public_proposal_resp.status_code == 200, "Accessing public proposal link failed"

        # Accept the proposal (simulate client acceptance)
        accept_resp = requests.post(
            f"{BASE_URL}/api/proposals/{proposal_id}/accept",
            headers=headers,
            timeout=TIMEOUT
        )
        assert accept_resp.status_code == 200, f"Proposal acceptance failed: {accept_resp.text}"

        # Verify financial transaction created after acceptance
        fin_tx_resp = requests.get(
            f"{BASE_URL}/api/financeiro/transactions?proposal_id={proposal_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        assert fin_tx_resp.status_code == 200, "Failed to fetch financial transactions"
        transactions = fin_tx_resp.json()
        assert isinstance(transactions, list) and len(transactions) > 0, "No financial transaction created upon proposal acceptance"

    finally:
        # Cleanup: delete proposal and client if created
        if proposal_id:
            requests.delete(
                f"{BASE_URL}/api/proposals/{proposal_id}",
                headers=headers,
                timeout=TIMEOUT
            )
        if client_id:
            requests.delete(
                f"{BASE_URL}/api/clients/{client_id}",
                headers=headers,
                timeout=TIMEOUT
            )


test_proposals_builder_and_financial_integration()