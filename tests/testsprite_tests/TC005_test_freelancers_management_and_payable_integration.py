import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    # Add Authorization headers here if authentication is needed, e.g.
    # "Authorization": "Bearer <token>",
}

def test_freelancers_management_and_payable_integration():
    freelancer_id = None
    project_id = None
    financial_txn_id = None

    try:
        # 1. Create a new freelancer with rating, custom rates, and availability calendar
        freelancer_payload = {
            "name": "Test Freelancer " + str(uuid.uuid4()),
            "email": f"freelancer_{uuid.uuid4().hex[:8]}@example.com",
            "rating": 4.5,
            "custom_rate": 150.0,
            "availability": [
                {"date": "2026-02-01", "available": True},
                {"date": "2026-02-02", "available": False},
                {"date": "2026-02-03", "available": True}
            ],
            "skills": ["Video Editing", "Color Grading"]
        }
        resp = requests.post(f"{BASE_URL}/api/freelancers", json=freelancer_payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Failed to create freelancer: {resp.text}"
        freelancer = resp.json()
        freelancer_id = freelancer.get("id")
        assert freelancer_id, "Freelancer ID missing in response"
        assert freelancer["rating"] == 4.5
        assert abs(freelancer["custom_rate"] - 150.0) < 0.01
        assert len(freelancer["availability"]) == 3

        # 2. Create a new project to allocate freelancer to
        project_payload = {
            "name": "Test Project " + str(uuid.uuid4()),
            "description": "Project to test freelancer allocation",
            "shooting_dates": ["2026-03-10", "2026-03-12"],
            "delivery_dates": ["2026-03-20"],
            "teams": [],
            "equipment_bookings": []
        }
        resp = requests.post(f"{BASE_URL}/api/projects", json=project_payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Failed to create project: {resp.text}"
        project = resp.json()
        project_id = project.get("id")
        assert project_id, "Project ID missing in response"

        # 3. Allocate freelancer to project with a custom rate, verify allocation response
        allocation_payload = {
            "freelancer_id": freelancer_id,
            "project_id": project_id,
            "custom_rate": 160.0,
            "allocation_dates": ["2026-03-10", "2026-03-12"]
        }
        resp = requests.post(f"{BASE_URL}/api/freelancer-allocations", json=allocation_payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Failed to allocate freelancer: {resp.text}"
        allocation = resp.json()
        allocation_id = allocation.get("id")
        assert allocation_id, "Allocation ID missing in response"
        assert abs(allocation["custom_rate"] - 160.0) < 0.01
        assert allocation["freelancer_id"] == freelancer_id
        assert allocation["project_id"] == project_id

        # 4. Check freelancer rating can be updated
        update_rating_payload = {"rating": 4.8}
        resp = requests.put(f"{BASE_URL}/api/freelancers/{freelancer_id}", json=update_rating_payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to update freelancer rating: {resp.text}"
        updated_freelancer = resp.json()
        assert abs(updated_freelancer["rating"] - 4.8) < 0.01

        # 5. Verify availability calendar update
        updated_availability = [
            {"date": "2026-02-01", "available": False},
            {"date": "2026-02-02", "available": True}
        ]
        resp = requests.patch(f"{BASE_URL}/api/freelancers/{freelancer_id}/availability", json=updated_availability, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to update freelancer availability: {resp.text}"
        avail_resp = resp.json()
        assert any(d["available"] is False for d in avail_resp), "Availability update failed"

        # 6. Validate automatic payable financial transaction integration triggered by allocation
        resp = requests.get(f"{BASE_URL}/api/financial-transactions?filter=freelancer_allocation_id:eq:{allocation_id}", headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to get financial transactions: {resp.text}"
        transactions = resp.json()
        assert isinstance(transactions, list), "Financial transactions response invalid"
        assert len(transactions) > 0, "No financial transactions created for freelancer allocation"
        financial_txn_id = transactions[0].get("id")
        assert transactions[0]["type"] == "payable"
        assert abs(float(transactions[0]["amount"])) > 0

        # 7. Retrieve freelancer detail including ratings, custom rate, availability, allocations, and linked payables
        resp = requests.get(f"{BASE_URL}/api/freelancers/{freelancer_id}?include=allocations,payables", headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to retrieve freelancer details: {resp.text}"
        freelancer_detail = resp.json()
        assert "allocations" in freelancer_detail, "Allocations missing in freelancer detail"
        assert any(a["id"] == allocation_id for a in freelancer_detail["allocations"])
        assert "payables" in freelancer_detail
        assert any(p["id"] == financial_txn_id for p in freelancer_detail["payables"])

    finally:
        # Cleanup: Delete allocation, project, freelancer, and financial transaction if exist
        if financial_txn_id:
            requests.delete(f"{BASE_URL}/api/financial-transactions/{financial_txn_id}", headers=HEADERS, timeout=TIMEOUT)
        if project_id:
            requests.delete(f"{BASE_URL}/api/projects/{project_id}", headers=HEADERS, timeout=TIMEOUT)
        if freelancer_id:
            requests.delete(f"{BASE_URL}/api/freelancers/{freelancer_id}", headers=HEADERS, timeout=TIMEOUT)
        # Assuming deletion of allocations is handled via freelancer or project cleanup or not allowed directly

test_freelancers_management_and_payable_integration()