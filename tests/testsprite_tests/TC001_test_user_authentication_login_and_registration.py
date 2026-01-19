import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_user_authentication_login_and_registration():
    # Data for user registration
    registration_data = {
        "email": "testuser_auth@test.com",
        "password": "TestPass123!",
        "initialCapital": 10000,
        "role": "user"
    }
    headers = {"Content-Type": "application/json"}

    user_id = None
    token = None

    try:
        # Register a new user
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=registration_data, headers=headers, timeout=TIMEOUT)
        assert reg_response.status_code == 201, f"Registration failed: {reg_response.text}"
        reg_json = reg_response.json()
        assert "id" in reg_json, "User ID missing in registration response"
        assert reg_json.get("email") == registration_data["email"], "Registered email mismatch"
        user_id = reg_json["id"]
        assert "role" in reg_json and reg_json["role"] == registration_data["role"], "User role mismatch on registration"

        # Attempt login with the same credentials
        login_data = {
            "email": registration_data["email"],
            "password": registration_data["password"]
        }
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data, headers=headers, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_json = login_response.json()
        assert "token" in login_json, "Authentication token not returned on login"
        token = login_json["token"]

        # Access a protected resource with token to verify role-based access control
        auth_headers = {
            "Authorization": f"Bearer {token}"
        }
        # Endpoint that requires authentication and role-check, e.g. user profile
        profile_response = requests.get(f"{BASE_URL}/api/auth/profile", headers=auth_headers, timeout=TIMEOUT)
        assert profile_response.status_code == 200, f"Accessing profile failed: {profile_response.text}"
        profile_json = profile_response.json()
        assert profile_json.get("email") == registration_data["email"], "Profile email mismatch"
        assert profile_json.get("role") == registration_data["role"], "Profile role mismatch"

        # Verify login failure with incorrect password
        invalid_login_data = {
            "email": registration_data["email"],
            "password": "WrongPass123!"
        }
        invalid_login_response = requests.post(f"{BASE_URL}/api/auth/login", json=invalid_login_data, headers=headers, timeout=TIMEOUT)
        assert invalid_login_response.status_code == 401 or invalid_login_response.status_code == 400, "Invalid login did not fail properly"

        # Verify registration failure with existing email
        duplicate_reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=registration_data, headers=headers, timeout=TIMEOUT)
        assert duplicate_reg_response.status_code == 409 or duplicate_reg_response.status_code == 400, "Duplicate registration did not fail properly"

    finally:
        # Clean up: delete the test user if created
        if user_id and token:
            try:
                del_headers = {
                    "Authorization": f"Bearer {token}"
                }
                del_response = requests.delete(f"{BASE_URL}/api/auth/users/{user_id}", headers=del_headers, timeout=TIMEOUT)
                assert del_response.status_code in [200, 204], f"Failed to delete test user: {del_response.text}"
            except Exception:
                pass


test_user_authentication_login_and_registration()