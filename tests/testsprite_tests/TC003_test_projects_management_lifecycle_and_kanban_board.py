import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# For authentication - assuming a login endpoint and token-based auth
AUTH_EMAIL = "testuser@example.com"
AUTH_PASSWORD = "TestPass123!"

def authenticate():
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": AUTH_EMAIL, "password": AUTH_PASSWORD},
        timeout=TIMEOUT
    )
    resp.raise_for_status()
    token = resp.json().get("access_token")
    assert token, "Authentication failed: access_token missing"
    return token

def test_projects_management_lifecycle_and_kanban_board():
    token = authenticate()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    created_client_id = None
    created_freelancer_id = None
    created_equipment_id = None
    created_project_id = None

    # Create a client (required for project)
    try:
        client_payload = {
            "name": "Test Client " + str(uuid.uuid4()),
            "contact_email": "client@example.com",
            "company_name": "Test Company LLC",
            "notes": "Automated test client"
        }
        r_client = requests.post(
            f"{BASE_URL}/api/clients",
            headers=headers,
            json=client_payload,
            timeout=TIMEOUT
        )
        r_client.raise_for_status()
        client_data = r_client.json()
        created_client_id = client_data.get("id")
        assert created_client_id, "Client creation failed, no ID returned"

        # Create equipment
        equipment_payload = {
            "name": "Camera Equipment " + str(uuid.uuid4()),
            "type": "Camera",
            "serial_number": "SN-" + str(uuid.uuid4()),
            "maintenance_due": None,
            "notes": "Automated test equipment"
        }
        r_equipment = requests.post(
            f"{BASE_URL}/api/equipments",
            headers=headers,
            json=equipment_payload,
            timeout=TIMEOUT
        )
        r_equipment.raise_for_status()
        equipment_data = r_equipment.json()
        created_equipment_id = equipment_data.get("id")
        assert created_equipment_id, "Equipment creation failed, no ID returned"

        # Create freelancer
        freelancer_payload = {
            "name": "Test Freelancer " + str(uuid.uuid4()),
            "email": "freelance@example.com",
            "skills": ["Video Editing", "Photography"],
            "rates": {"hourly": 50},
            "availability": [],
            "ratings": 4.5,
            "notes": "Automated test freelancer"
        }
        r_freelancer = requests.post(
            f"{BASE_URL}/api/freelancers",
            headers=headers,
            json=freelancer_payload,
            timeout=TIMEOUT
        )
        r_freelancer.raise_for_status()
        freelancer_data = r_freelancer.json()
        created_freelancer_id = freelancer_data.get("id")
        assert created_freelancer_id, "Freelancer creation failed, no ID returned"

        # Create project with multiple shooting and delivery dates, Kanban status, team allocation, equipment booking, freelancer assignment
        project_payload = {
            "name": "Test Project " + str(uuid.uuid4()),
            "client_id": created_client_id,
            "description": "Automated test project lifecycle",
            "shooting_dates": [
                "2026-02-01T09:00:00Z",
                "2026-02-05T09:00:00Z"
            ],
            "delivery_dates": [
                "2026-02-20T17:00:00Z"
            ],
            "kanban_stage": "Lead",
            "team_allocation": [
                {
                    "freelancer_id": created_freelancer_id,
                    "role": "Editor"
                }
            ],
            "equipment_bookings": [
                {
                    "equipment_id": created_equipment_id,
                    "start_date": "2026-02-01T08:00:00Z",
                    "end_date": "2026-02-02T20:00:00Z"
                }
            ],
            "notes": "Test project with full lifecycle and Kanban management"
        }
        r_project = requests.post(
            f"{BASE_URL}/api/projects",
            headers=headers,
            json=project_payload,
            timeout=TIMEOUT
        )
        r_project.raise_for_status()
        project_data = r_project.json()
        created_project_id = project_data.get("id")
        assert created_project_id, "Project creation failed, no ID returned"

        # Validate project details correctness
        assert project_data.get("name") == project_payload["name"]
        assert project_data.get("client_id") == created_client_id
        assert set(project_data.get("shooting_dates", [])) == set(project_payload["shooting_dates"])
        assert set(project_data.get("delivery_dates", [])) == set(project_payload["delivery_dates"])
        assert project_data.get("kanban_stage") == "Lead"
        team = project_data.get("team_allocation", [])
        assert any(mem.get("freelancer_id") == created_freelancer_id for mem in team)
        equipment_bookings = project_data.get("equipment_bookings", [])
        assert any(eq.get("equipment_id") == created_equipment_id for eq in equipment_bookings)

        # Advance Kanban board stage to "Shooting"
        kanban_update_payload = {"kanban_stage": "Shooting"}
        r_update_kanban = requests.put(
            f"{BASE_URL}/api/projects/{created_project_id}/kanban",
            headers=headers,
            json=kanban_update_payload,
            timeout=TIMEOUT
        )
        r_update_kanban.raise_for_status()
        updated_kanban = r_update_kanban.json()
        assert updated_kanban.get("kanban_stage") == "Shooting"

        # Add a new shooting date and verify update
        new_shooting_date = "2026-02-10T09:00:00Z"
        add_shooting_payload = {
            "shooting_dates": project_data["shooting_dates"] + [new_shooting_date]
        }
        r_update_dates = requests.put(
            f"{BASE_URL}/api/projects/{created_project_id}/dates",
            headers=headers,
            json=add_shooting_payload,
            timeout=TIMEOUT
        )
        r_update_dates.raise_for_status()
        updated_dates = r_update_dates.json()
        assert new_shooting_date in updated_dates.get("shooting_dates", [])

        # Conflict detection: Try to book equipment overlapping an existing booking for same equipment (should fail)
        conflicting_booking_payload = {
            "equipment_bookings": [
                {
                    "equipment_id": created_equipment_id,
                    "start_date": "2026-02-01T18:00:00Z",
                    "end_date": "2026-02-03T10:00:00Z"
                }
            ]
        }
        r_conflict = requests.post(
            f"{BASE_URL}/api/equipments/{created_equipment_id}/bookings",
            headers=headers,
            json=conflicting_booking_payload["equipment_bookings"][0],
            timeout=TIMEOUT
        )
        # We expect a conflict error - either HTTP 409 Conflict or 400 with error message
        if r_conflict.status_code == 201 or r_conflict.status_code == 200:
            # No conflict detected, but we expect one here - fail the test
            assert False, "Equipment booking conflict not detected"
        else:
            # Error expected; check message
            assert r_conflict.status_code in (400, 409)
            error_resp = r_conflict.json()
            msg = error_resp.get("error") or error_resp.get("message") or ""
            assert "conflict" in msg.lower() or "overlap" in msg.lower()

        # Assign another freelancer with notification validation (simulate notification by checking response)
        another_freelancer_payload = {
            "name": "Test Freelancer 2 " + str(uuid.uuid4()),
            "email": "freelance2@example.com",
            "skills": ["Sound Engineering"],
            "rates": {"hourly": 60},
            "availability": [],
            "ratings": 4.7,
            "notes": "Automated test freelancer 2"
        }
        r_freelancer2 = requests.post(
            f"{BASE_URL}/api/freelancers",
            headers=headers,
            json=another_freelancer_payload,
            timeout=TIMEOUT
        )
        r_freelancer2.raise_for_status()
        freelancer2_data = r_freelancer2.json()
        freelancer2_id = freelancer2_data.get("id")
        assert freelancer2_id, "Second freelancer creation failed"

        # Allocate second freelancer to project
        allocation_payload = {
            "freelancer_id": freelancer2_id,
            "role": "Sound Engineer"
        }
        r_allocate = requests.post(
            f"{BASE_URL}/api/projects/{created_project_id}/team",
            headers=headers,
            json=allocation_payload,
            timeout=TIMEOUT
        )
        r_allocate.raise_for_status()
        alloc_resp = r_allocate.json()
        assert alloc_resp.get("freelancer_id") == freelancer2_id
        # If notifications are returned in response, verify presence
        if "notification" in alloc_resp:
            notif = alloc_resp["notification"]
            assert "freelancer assigned" in notif.get("message", "").lower()

        # Fetch Kanban board visualization for this project and assert stages present
        r_kanban = requests.get(
            f"{BASE_URL}/api/projects/{created_project_id}/kanban",
            headers=headers,
            timeout=TIMEOUT
        )
        r_kanban.raise_for_status()
        kanban_data = r_kanban.json()

        assert isinstance(kanban_data.get("stages"), list)
        assert any(stage.get("name") == "Lead" or stage.get("name") == "Shooting" for stage in kanban_data.get("stages"))

    finally:
        # Cleanup created data in reverse order where dependency matters
        if created_project_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/projects/{created_project_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
            except Exception:
                pass
        if created_freelancer_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/freelancers/{created_freelancer_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
            except Exception:
                pass
        # The second freelancer created during test also remove if present
        try:
            if 'freelancer2_id' in locals():
                requests.delete(
                    f"{BASE_URL}/api/freelancers/{freelancer2_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
        except Exception:
            pass
        if created_equipment_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/equipments/{created_equipment_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
            except Exception:
                pass
        if created_client_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/clients/{created_client_id}",
                    headers=headers,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_projects_management_lifecycle_and_kanban_board()