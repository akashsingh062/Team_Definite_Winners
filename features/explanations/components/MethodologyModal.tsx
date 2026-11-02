"use client";

import * as React from "react";
import { X, ShieldCheck, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMethodologyInfo } from "@/types/explanation";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  methodology?: IMethodologyInfo | null;
}

export function MethodologyModal({
  isOpen,
  onClose,
  methodology,
}: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Transparent Matching Methodology & Fairness
              </h3>
              <p className="text-[11px] text-slate-500">
                Scoring Version: {methodology?.scoringVersion || "v1.0-stage4"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Overview */}
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
            <p className="font-bold text-xs text-indigo-950">
              Deterministic Mathematical Engine
            </p>
            <p className="text-slate-700 leading-relaxed">
              {methodology?.methodologyOverview ||
                "CareerBridge AI uses an audited deterministic formula. Match scores are mathematically computed from verified profile data and employer requirements. AI models generate explanatory text but are strictly forbidden from modifying scores."}
            </p>
          </div>

          {/* Factor Weights Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Scoring Factors & Exact Weights (Sum = 100%)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {(methodology?.factors || [
                { name: "Required Technical Skills", weight: 40, description: "Mandatory core competencies" },
                { name: "Preferred Technical Skills", weight: 15, description: "Bonus value-add technologies" },
                { name: "Projects & Practical Experience", weight: 15, description: "Portfolio code proof & tenure" },
                { name: "Education & Eligibility", weight: 10, description: "Degree, branch, CGPA" },
                { name: "Career Role Alignment", weight: 10, description: "Target role congruence" },
                { name: "Work Mode & Location", weight: 5, description: "Remote/Hybrid/Onsite alignment" },
                { name: "Compensation Alignment", weight: 5, description: "Stipend/salary compatibility" },
              ]).map((f) => (
                <div key={f.name} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800">{f.name}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                  </div>
                  <span className="font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs shrink-0">
                    {f.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fairness Guarantees */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Fairness & Responsible AI Invariants
            </h4>
            <ul className="space-y-1.5 pl-5 list-disc text-slate-700 leading-relaxed">
              {(methodology?.fairnessGuarantees || [
                "Pedigree Neutrality: University rankings and college brands are completely omitted from calculation formulas.",
                "Socioeconomic Blindness: Demographics (gender, religion, caste, income) are never evaluated.",
                "Non-Punitive Data Policy: Missing optional profile information receives neutral baseline points rather than zero penalties.",
              ]).map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-slate-500">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>System Limitations & Disclaimer</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This score represents mathematical alignment between your profile and posted requirements. It is not a hiring guarantee or probability of selection. Independent human recruiters make all employment decisions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button
            size="sm"
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-900 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

