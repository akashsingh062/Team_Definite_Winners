"use client";

import React, { useState } from "react";
import {
  Plus,
  X,
  Sparkles,
  RotateCcw,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatIfSkillSelectorProps {
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  selectedHypotheticalSkills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  onAddAllMissingRequired: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function WhatIfSkillSelector({
  missingRequiredSkills,
  missingPreferredSkills,
  selectedHypotheticalSkills,
  onAddSkill,
  onRemoveSkill,
  onAddAllMissingRequired,
  onReset,
  disabled,
}: WhatIfSkillSelectorProps) {
  const [customInput, setCustomInput] = useState("");

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onAddSkill(customInput.trim());
    setCustomInput("");
  };

  const availableSuggestions = [
    ...missingRequiredSkills,
    ...missingPreferredSkills,
  ].filter(
    (skill) =>
      !selectedHypotheticalSkills.some(
        (sel) => sel.toLowerCase() === skill.toLowerCase()
      )
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Hypothetical Skill Experimentation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select skills you plan to learn to simulate alignment improvements in real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {missingRequiredSkills.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddAllMissingRequired}
              disabled={disabled || missingRequiredSkills.every((s) => selectedHypotheticalSkills.includes(s))}
              className="text-xs h-8"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              <span>Add All Required</span>
            </Button>
          )}

          {selectedHypotheticalSkills.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={disabled}
              className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Currently Added Hypothetical Skills */}
      <div>
        <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Simulated Skills ({selectedHypotheticalSkills.length})
        </span>

        {selectedHypotheticalSkills.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 bg-slate-50/50">
            No hypothetical skills added yet. Click suggestions below or type a skill to run the simulator.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedHypotheticalSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs animate-in fade-in-50"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill)}
                  className="hover:bg-indigo-200/60 p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Remove hypothetical skill"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Missing Skills from Selected Role */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
            Recommended Skills for this Career
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.slice(0, 10).map((skill, idx) => {
              const isReq = missingRequiredSkills.includes(skill);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAddSkill(skill)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isReq
                      ? "bg-rose-50/60 border-rose-200 text-rose-800 hover:bg-rose-100"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Plus className="h-3 w-3" />
                  <span>{skill}</span>
                  {isReq && <span className="text-2xs text-rose-500 font-bold ml-0.5">(Req)</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Skill Input */}
      <form onSubmit={handleAddCustom} className="pt-2 flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Type any technology or tool (e.g., Docker, GraphQL, Kubernetes)..."
          className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          disabled={disabled}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={disabled || !customInput.trim()}
          className="h-9 px-3.5"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>Add Skill</span>
        </Button>
      </form>
    </div>
  );
}

