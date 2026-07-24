async function test() {
  console.log("=== Testing General Enquiry ===");
  let res = await fetch("http://localhost:5001/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "General Tester",
      email: "general@example.com",
      message: "Testing general enquiry"
    })
  });
  let data = await res.json();
  console.log("General Status:", res.status);
  console.log("General Data:", data);

  console.log("\n=== Testing Product Enquiry (svc-008) ===");
  res = await fetch("http://localhost:5001/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Product Tester",
      email: "product@example.com",
      message: "Testing product enquiry",
      serviceId: "svc-008"
    })
  });
  data = await res.json();
  console.log("Product Status:", res.status);
  console.log("Product Data:", data);
}

test();
