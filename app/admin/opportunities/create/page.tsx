"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminPortalLayout } from "@/components/layout/AdminPortalLayout";
import { OpportunityForm } from "@/features/opportunity/components/OpportunityForm";
import { OpportunityFormData } from "@/features/opportunity/schemas/opportunitySchema";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (formData: OpportunityFormData) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to create opportunity");
      }

      toast.success("Opportunity created successfully!");
      router.push("/admin/opportunities");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while creating the opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/admin/opportunities"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Catalog
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create New Opportunity
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish or draft a verified campus opportunity. Fields are structured for algorithmic fairness and explainability.
          </p>
        </div>

        {/* Opportunity Form */}
        <OpportunityForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Create Opportunity"
        />
      </div>
    </AdminPortalLayout>
  );
}
