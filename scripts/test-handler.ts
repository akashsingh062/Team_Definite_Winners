import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { auth } from "../lib/auth";

async function main() {
  const req = new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
    body: JSON.stringify({
      email: "akash@gmail.com",
      password: "wrongpassword",
    }),
  });

  try {
    const res = await auth.handler(req);
    console.log("Handler status:", res.status);
    console.log("Handler body:", await res.text());
  } catch (err: any) {
    console.error("Handler error:", err);
  }
}

main().catch(console.error);
