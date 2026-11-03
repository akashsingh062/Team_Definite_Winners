import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "@better-auth/utils/password";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careerbridge-ai";

async function seed() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("careerbridge-ai");

  const defaultPassword = "Password123!";
  const hashedPassword = await hashPassword(defaultPassword);

  // 1. Seed or update Demo Student: student@careerbridge.ai
  const studentEmail = "student@careerbridge.ai";
  let studentUser = await db.collection("user").findOne({ email: studentEmail });
  if (!studentUser) {
    const studentId = new ObjectId();
    await db.collection("user").insertOne({
      _id: studentId,
      name: "Alex Rivera",
      email: studentEmail,
      emailVerified: true,
      role: "student",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await db.collection("account").insertOne({
      _id: new ObjectId(),
      userId: studentId,
      accountId: studentId.toString(),
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Created student account: ${studentEmail} (Password: ${defaultPassword})`);
    studentUser = await db.collection("user").findOne({ email: studentEmail });
  } else {
    // Update password so it's guaranteed
    await db.collection("account").updateOne(
      { userId: studentUser._id, providerId: "credential" },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`ℹ️ Updated student password: ${studentEmail} -> ${defaultPassword}`);
  }

  // Ensure student profile exists for student@careerbridge.ai
  if (studentUser) {
    const existingProfile = await db.collection("student_profiles").findOne({ userId: studentUser._id.toString() });
    if (!existingProfile) {
      await db.collection("student_profiles").insertOne({
        _id: new ObjectId(),
        userId: studentUser._id.toString(),
        personalInfo: {
          fullName: "Alex Rivera",
          email: studentEmail,
          phoneNumber: "+1 (555) 234-5678",
          location: "San Francisco, CA",
        },
        academicInfo: {
          collegeName: "California Institute of Technology",
          degree: "B.Tech / B.S.",
          branch: "Computer Science and AI",
          currentAcademicYear: "4th Year",
          graduationYear: 2026,
          cgpa: 8.95,
        },
        skills: [
          { id: "sk1", name: "TypeScript", category: "Programming languages", proficiency: "Advanced" },
          { id: "sk2", name: "React", category: "Frontend technologies", proficiency: "Advanced" },
          { id: "sk3", name: "Node.js", category: "Backend technologies", proficiency: "Advanced" },
          { id: "sk4", name: "Python", category: "Programming languages", proficiency: "Intermediate" },
          { id: "sk5", name: "MongoDB", category: "Databases", proficiency: "Advanced" },
          { id: "sk6", name: "Docker", category: "Cloud & DevOps", proficiency: "Intermediate" },
        ],
        projects: [
          {
            id: "proj1",
            title: "CareerBridge AI Platform",
            description: "AI-driven talent matching and skill verification system using Next.js and Gemini.",
            technologies: ["React", "TypeScript", "Node.js", "MongoDB"],
            githubUrl: "https://github.com/example/careerbridge",
          },
          {
            id: "proj2",
            title: "Distributed Task Pipeline",
            description: "High-throughput asynchronous queuing microservice with Redis and Node.js.",
            technologies: ["Node.js", "Redis", "TypeScript"],
            githubUrl: "https://github.com/example/pipeline",
          },
        ],
        careerPreferences: {
          preferredJobRole: "Full Stack Software Engineer",
          preferredEmploymentType: "Full-time",
          workPreference: "Hybrid",
          preferredLocation: "Bengaluru / Remote",
          expectedStipend: "₹45,000/mo",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Created student profile for ${studentEmail}`);
    }
  }

  // 2. Seed or update Demo Admin: admin@careerbridge.ai
  const adminEmail = "admin@careerbridge.ai";
  let adminUser = await db.collection("user").findOne({ email: adminEmail });
  if (!adminUser) {
    const adminId = new ObjectId();
    await db.collection("user").insertOne({
      _id: adminId,
      name: "System Administrator",
      email: adminEmail,
      emailVerified: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await db.collection("account").insertOne({
      _id: new ObjectId(),
      userId: adminId,
      accountId: adminId.toString(),
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Created admin account: ${adminEmail} (Password: ${defaultPassword})`);
  } else {
    await db.collection("user").updateOne(
      { _id: adminUser._id },
      { $set: { role: "admin", updatedAt: new Date() } }
    );
    await db.collection("account").updateOne(
      { userId: adminUser._id, providerId: "credential" },
      { $set: { password: hashedPassword, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`ℹ️ Updated admin password & role: ${adminEmail} -> ${defaultPassword}`);
  }

  // 3. Ensure akash@gmail.com has known password Akash@123 OR Password123!
  // Let's set password to Akash@123 (matching what they used)
  const akashEmail = "akash@gmail.com";
  const akashUser = await db.collection("user").findOne({ email: akashEmail });
  if (akashUser) {
    const akashHash = await hashPassword("Akash@123");
    await db.collection("account").updateOne(
      { userId: akashUser._id, providerId: "credential" },
      { $set: { password: akashHash, updatedAt: new Date() } }
    );
    console.log(`✅ Verified akash@gmail.com with password: Akash@123`);
  }

  await client.close();
  console.log("Seeding complete!");
}

seed().catch(console.error);

