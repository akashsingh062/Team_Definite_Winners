"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminPortalLayout } from "@/components/layout/AdminPortalLayout";
import { OpportunityForm } from "@/features/opportunity/components/OpportunityForm";
import { OpportunityFormData } from "@/features/opportunity/schemas/opportunitySchema";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [initialData, setInitialData] = React.useState<OpportunityFormData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadOpportunity() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/opportunities/${id}`);
        if (!res.ok) throw new Error("Failed to load opportunity");
        const json = await res.json();
        setInitialData(json.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load opportunity data");
      } finally {
        setIsLoading(false);
      }
    }

    loadOpportunity();
  }, [id]);

  const handleSubmit = async (formData: OpportunityFormData) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/opportunities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update opportunity");
      }

      toast.success("Opportunity updated successfully!");
      router.push(`/admin/opportunities/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save modifications");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href={`/admin/opportunities/${id}`}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Opportunity Details
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Edit Opportunity
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update opportunity criteria, compensation, or publication status.
          </p>
        </div>

        {/* Opportunity Edit Form */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading opportunity information...
          </div>
        ) : initialData ? (
          <OpportunityForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Update Opportunity"
            isEdit={true}
          />
        ) : (
          <div className="p-12 text-center text-sm text-slate-500">
            Opportunity could not be loaded.
          </div>
        )}
      </div>
    </AdminPortalLayout>
  );
}

