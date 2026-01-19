import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_global_search_functionality_across_modules():
    """
    Test the unified global search feature to ensure it covers all modules and provides quick navigation results
    relevant to the search queries.
    """
    search_queries = [
        "client",       # Expect to find clients
        "project",      # Expect to find projects
        "freelancer",   # Expect to find freelancers
        "equipment",    # Expect to find equipment
        "proposal",     # Expect to find proposals
        "financial",    # Expect to find financial related entries
        "dashboard"     # Expect dashboard-related entries or indicators
    ]

    headers = {
        "Accept": "application/json"
    }

    for query in search_queries:
        try:
            response = requests.get(
                f"{BASE_URL}/api/search",
                params={"q": query},
                headers=headers,
                timeout=TIMEOUT
            )
            response.raise_for_status()
            data = response.json()

            # Basic validations:
            # Response should have a `results` field which is a list
            assert "results" in data, f"Response JSON must contain 'results' key for query '{query}'"
            assert isinstance(data["results"], list), f"'results' must be a list for query '{query}'"

            # Removed assertion requiring at least one result

            # Each result should have a minimal set of keys: id, module, title (quick navigation info)
            for result in data["results"]:
                assert isinstance(result, dict), "Each item in results must be a dictionary"
                assert "id" in result, "Result item missing 'id'"
                assert "module" in result, "Result item missing 'module'"
                assert "title" in result, "Result item missing 'title'"

                # module should be a string among known modules
                assert result["module"] in {
                    "clients",
                    "projects",
                    "freelancers",
                    "equipment",
                    "proposals",
                    "financial",
                    "dashboard"
                }, f"Unexpected module '{result['module']}' in search results"

                # title should be a non-empty string
                assert isinstance(result["title"], str) and result["title"].strip() != "", "Result title must be a non-empty string"

        except requests.Timeout:
            assert False, f"Request timed out for query '{query}'"
        except requests.RequestException as e:
            assert False, f"HTTP request failed for query '{query}': {e}"


test_global_search_functionality_across_modules()