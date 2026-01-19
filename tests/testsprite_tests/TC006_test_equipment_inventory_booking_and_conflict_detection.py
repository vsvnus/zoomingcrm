import requests
from datetime import datetime, timedelta
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    # Assuming Bearer token needed; replace 'your_token_here' with actual token if required.
    "Authorization": "Bearer your_token_here"
}


def test_equipment_inventory_booking_and_conflict_detection():
    equipment_id = None
    booking_id_1 = None
    booking_id_2 = None
    try:
        # Step 1: Create Equipment
        equipment_payload = {
            "name": f"Test Camera {uuid.uuid4()}",
            "type": "Camera",
            "brand": "TestBrand",
            "model": "X1000",
            "serial_number": f"SN-{uuid.uuid4()}",
            "purchase_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "maintenance_due_date": (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d"),
            "status": "Available",
            "notes": "Automated test equipment"
        }
        r = requests.post(
            f"{BASE_URL}/api/equipments",
            json=equipment_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Failed to create equipment: {r.text}"
        equipment = r.json()
        equipment_id = equipment.get("id")
        assert equipment_id is not None

        # Define overlapping booking periods
        booking_start_1 = datetime.utcnow() + timedelta(days=1)
        booking_end_1 = booking_start_1 + timedelta(days=2)

        booking_start_2 = booking_start_1 + timedelta(days=1)  # Overlaps with booking 1
        booking_end_2 = booking_start_2 + timedelta(days=2)

        # Step 2: Create first booking (should succeed)
        booking_payload_1 = {
            "equipment_id": equipment_id,
            "user_id": "test-user-1",  # Assuming user id is required for booking
            "start_date": booking_start_1.strftime("%Y-%m-%dT%H:%M:%S"),
            "end_date": booking_end_1.strftime("%Y-%m-%dT%H:%M:%S"),
            "purpose": "Video shoot test 1"
        }
        r = requests.post(
            f"{BASE_URL}/api/equipment-bookings",
            json=booking_payload_1,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert r.status_code == 201, f"Failed to create first booking: {r.text}"
        booking_1 = r.json()
        booking_id_1 = booking_1.get("id")
        assert booking_id_1 is not None

        # Step 3: Attempt conflicting second booking (should fail conflict detection)
        booking_payload_2 = {
            "equipment_id": equipment_id,
            "user_id": "test-user-2",
            "start_date": booking_start_2.strftime("%Y-%m-%dT%H:%M:%S"),
            "end_date": booking_end_2.strftime("%Y-%m-%dT%H:%M:%S"),
            "purpose": "Video shoot test 2 - conflicting"
        }
        r = requests.post(
            f"{BASE_URL}/api/equipment-bookings",
            json=booking_payload_2,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        # Expecting a conflict error code, usually 409 Conflict or 400 with conflict message
        assert r.status_code in (400, 409), "Double booking conflict was not detected"
        response_json = r.json()
        conflict_detected = (
            "conflict" in response_json.get("message", "").lower() or
            "double booking" in response_json.get("message", "").lower()
        )
        assert conflict_detected, f"Conflict message not detected in response: {r.text}"

        # Step 4: Check maintenance tracking for equipment
        r = requests.get(
            f"{BASE_URL}/api/equipments/{equipment_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Failed to retrieve equipment for maintenance check: {r.text}"
        equipment_details = r.json()
        maintenance_due_date_str = equipment_details.get("maintenance_due_date")
        assert maintenance_due_date_str is not None, "Maintenance due date missing"
        maintenance_due_date = datetime.strptime(maintenance_due_date_str, "%Y-%m-%d")
        assert maintenance_due_date > datetime.utcnow(), "Maintenance due date is not in the future"

        # Step 5: ROI analysis and calendar availability visualization endpoint check
        # Assume endpoint /api/equipments/{id}/roi returns ROI and availability data
        r = requests.get(
            f"{BASE_URL}/api/equipments/{equipment_id}/roi",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert r.status_code == 200, f"Failed to retrieve ROI and availability data: {r.text}"
        roi_data = r.json()
        assert "roi" in roi_data, "ROI value missing in ROI data"
        assert "calendar_availability" in roi_data, "Calendar availability missing in ROI data"
        # Verify calendar_availability format and that the equipment is booked on booked dates
        calendar = roi_data["calendar_availability"]
        assert isinstance(calendar, list), "Calendar availability should be a list"
        # At least one booked period should match booking 1 dates
        booked_periods = [
            (datetime.strptime(period["start_date"], "%Y-%m-%dT%H:%M:%S"),
             datetime.strptime(period["end_date"], "%Y-%m-%dT%H:%M:%S"))
            for period in calendar if period.get("booked", False)
        ]
        overlaps_found = any(
            (booking_start_1 <= end and booking_end_1 >= start)
            for (start, end) in booked_periods
        )
        assert overlaps_found, "Booked period not reflected in calendar availability"

    finally:
        # Cleanup created bookings
        if booking_id_1:
            try:
                r = requests.delete(
                    f"{BASE_URL}/api/equipment-bookings/{booking_id_1}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
            except Exception:
                pass
        if booking_id_2:
            try:
                requests.delete(
                    f"{BASE_URL}/api/equipment-bookings/{booking_id_2}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
            except Exception:
                pass
        # Cleanup created equipment
        if equipment_id:
            try:
                r = requests.delete(
                    f"{BASE_URL}/api/equipments/{equipment_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_equipment_inventory_booking_and_conflict_detection()
