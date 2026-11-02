import { Metadata } from "next";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { StudentProfileForm } from "@/features/profile/components/StudentProfileForm";

export const metadata: Metadata = {
  title: "Student Profile Management",
  description: "Manage academic records, technical skills, projects, and career preferences.",
};

export default function ProfilePage() {
  return (
    <StudentPortalLayout>
      <StudentProfileForm />
    </StudentPortalLayout>
  );
}
