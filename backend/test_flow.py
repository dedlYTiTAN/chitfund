import requests
import time

BASE_URL = "http://127.0.0.1:8000"
USER_ID = "00000000-0000-0000-0000-000000000000"

def test_flow():
    print("--- STARTING END-TO-END FLOW TEST ---")
    
    # 1. Fetch initial portfolio
    print("\n1. Fetching initial portfolio...")
    r = requests.get(f"{BASE_URL}/portfolio/{USER_ID}")
    portfolio = r.json()
    print("Portfolio:", portfolio)
    
    # 2. Simulate clicking 'Deposit' and submitting 5000 INR
    print("\n2. Simulating 'Deposit' button click for 5000 INR...")
    r = requests.post(f"{BASE_URL}/deposits/webhook", json={
        "user_id": USER_ID,
        "amount": 5000
    })
    print("Deposit Response:", r.json())
    
    # 3. Verify portfolio after deposit
    print("\n3. Verifying portfolio updates...")
    r = requests.get(f"{BASE_URL}/portfolio/{USER_ID}")
    portfolio = r.json()
    print("Portfolio:", portfolio)
    assert portfolio['total_principal'] >= 5000, "Deposit failed to update principal!"
    
    # 4. Simulate clicking 'Simulate +30 Days'
    print("\n4. Simulating 'Simulate +30 Days' button click...")
    r = requests.post(f"{BASE_URL}/dev/run-accruals")
    print("Accrual Response:", r.json())
    
    # 5. Verify interest was accrued
    print("\n5. Verifying interest accrual...")
    r = requests.get(f"{BASE_URL}/portfolio/{USER_ID}")
    portfolio = r.json()
    print("Portfolio:", portfolio)
    assert portfolio['available_to_withdraw'] >= 50, "Interest was not accrued correctly!"
    
    # 6. Simulate clicking 'Withdraw' to withdraw 50 INR (interest only)
    print("\n6. Simulating 'Withdraw' button click for 50 INR (Interest)...")
    r = requests.post(f"{BASE_URL}/withdrawals/request", json={
        "user_id": USER_ID,
        "amount": 50
    })
    print("Withdraw Response:", r.json())
    assert "payout_link" in r.json(), "Payout link was not generated!"
    
    # 7. Fast forward 6 months to unlock principal
    print("\n7. Fast forwarding 6 months (clicking Simulate 6 times)...")
    for _ in range(6):
        requests.post(f"{BASE_URL}/dev/run-accruals")
    
    # 8. Verify principal is unlocked
    print("\n8. Verifying principal is unlocked...")
    r = requests.get(f"{BASE_URL}/portfolio/{USER_ID}")
    portfolio = r.json()
    print("Portfolio:", portfolio)
    # Available to withdraw should include the 5000 principal plus the accrued interest
    assert portfolio['available_to_withdraw'] >= 5000, "Principal was not unlocked!"
    
    # 9. Simulate clicking 'Withdraw' to withdraw the unlocked principal
    print("\n9. Simulating 'Withdraw' button click for unlocked 5000 INR...")
    r = requests.post(f"{BASE_URL}/withdrawals/request", json={
        "user_id": USER_ID,
        "amount": 5000
    })
    print("Withdraw Response:", r.json())
    assert "payout_link" in r.json(), "Payout link was not generated for principal!"
    
    print("\n--- ALL TESTS PASSED! BUTTONS ARE WORKING PROPERLY ---")

if __name__ == "__main__":
    test_flow()
