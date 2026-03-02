import requests

payload = {
    "tenure": 6,
    "spend": 150,
    "calls": 5,
    "customer_value": 260
}

r = requests.post(
    "http://localhost:8000/uplift/llm/uplift-strategy",
    json=payload
)

print(r.json())
