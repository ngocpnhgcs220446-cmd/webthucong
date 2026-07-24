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

  console.log("\n=== Testing Invalid Payload ===");
  res = await fetch("http://localhost:5001/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Missing Email"
    })
  });
  data = await res.json();
  console.log("Invalid Status:", res.status);
  console.log("Invalid Data:", data);
}

test();
