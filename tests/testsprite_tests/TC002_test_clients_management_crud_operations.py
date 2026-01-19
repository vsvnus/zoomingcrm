import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    # Include Authorization header or other headers here if auth is required
    # "Authorization": "Bearer YOUR_AUTH_TOKEN"
}

def test_clients_management_crud_operations():
    client_id = None
    created_client = None
    try:
        # --- CREATE a new client ---
        create_payload = {
            "name": "Test Client " + str(uuid.uuid4()),
            "company": {
                "name": "Test Company Inc.",
                "industry": "Audiovisual",
                "website": "https://testcompany.example.com",
                "address": "1234 Studio Ave, Film City"
            },
            "contact_info": {
                "email": "contact@testclient.example.com",
                "phone": "+1234567890",
                "mobile": "+1987654321",
                "fax": "+1234567899"
            },
            "notes": "Initial test client record for CRUD testing."
        }
        create_resp = requests.post(
            f"{BASE_URL}/clients",
            json=create_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Expected 201 Created, got {create_resp.status_code}"
        try:
            created_client = create_resp.json()
        except Exception:
            assert False, "Create client response is not valid JSON"
        assert "id" in created_client, "Created client response missing 'id'"
        client_id = created_client["id"]

        # --- RETRIEVE the created client ---
        get_resp = requests.get(
            f"{BASE_URL}/clients/{client_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Expected 200 OK on GET, got {get_resp.status_code}"
        try:
            client_data = get_resp.json()
        except Exception:
            assert False, "Get client response is not valid JSON"
        # Validate returned data matches creation input (partial match due to server defaults)
        assert client_data["name"] == create_payload["name"]
        assert client_data["company"]["name"] == create_payload["company"]["name"]
        assert client_data["contact_info"]["email"] == create_payload["contact_info"]["email"]
        assert client_data["notes"] == create_payload["notes"]

        # --- UPDATE the client ---
        update_payload = {
            "name": create_payload["name"] + " Updated",
            "company": {
                "name": "Test Company LLC",
                "industry": "Film Production",
                "website": "https://updatedcompany.example.com",
                "address": "4321 Cinema Blvd, Movie Town"
            },
            "contact_info": {
                "email": "updatedcontact@testclient.example.com",
                "phone": "+1098765432",
                "mobile": "+1209876543",
                "fax": "+1098765400"
            },
            "notes": "Updated client record for CRUD testing."
        }
        update_resp = requests.put(
            f"{BASE_URL}/clients/{client_id}",
            json=update_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Expected 200 OK on update, got {update_resp.status_code}"
        try:
            updated_client = update_resp.json()
        except Exception:
            assert False, "Update client response is not valid JSON"
        assert updated_client["name"] == update_payload["name"]
        assert updated_client["company"]["name"] == update_payload["company"]["name"]
        assert updated_client["contact_info"]["email"] == update_payload["contact_info"]["email"]
        assert updated_client["notes"] == update_payload["notes"]

        # --- DELETE the client ---
        delete_resp = requests.delete(
            f"{BASE_URL}/clients/{client_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert delete_resp.status_code == 204, f"Expected 204 No Content on delete, got {delete_resp.status_code}"

        # --- VERIFY deletion by attempting to GET client ---
        get_deleted_resp = requests.get(
            f"{BASE_URL}/clients/{client_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_deleted_resp.status_code == 404, f"Expected 404 Not Found after delete, got {get_deleted_resp.status_code}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    finally:
        # Clean up in case delete step did not succeed
        if client_id:
            try:
                requests.delete(f"{BASE_URL}/clients/{client_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

test_clients_management_crud_operations()
