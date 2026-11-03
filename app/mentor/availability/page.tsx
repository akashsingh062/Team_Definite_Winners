"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { IMentorProfile } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Calendar, CheckCircle2, Save, Loader2 } from "lucide-react";

export default function MentorAvailabilityPage() {
  const [availability, setAvailability] = useState({
    isAcceptingRequests: true,
    maxActiveMentees: 5,
    weeklyHours: 4,
    preferredDays: ["Saturday", "Sunday"],
    timezone: "Asia/Kolkata",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadProfile() {
      try {
        const res = await fetch("/api/mentor/profile");
        const data = await res.json();
        if (!ignore && data.success && data.data?.availability) {
          setAvailability({
            isAcceptingRequests: data.data.availability.isAcceptingRequests ?? true,
            maxActiveMentees: data.data.availability.maxActiveMentees ?? 5,
            weeklyHours: data.data.availability.weeklyHours ?? 4,
            preferredDays: data.data.availability.preferredDays || ["Saturday", "Sunday"],
            timezone: data.data.availability.timezone || "Asia/Kolkata",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleDay = (day: string) => {
    if (availability.preferredDays.includes(day)) {
      setAvailability({
        ...availability,
        preferredDays: availability.preferredDays.filter((d) => d !== day),
      });
    } else {
      setAvailability({
        ...availability,
        preferredDays: [...availability.preferredDays, day],
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(false);
    try {
      const res = await fetch("/api/mentor/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(availability),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Availability & Capacity
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Define when you are open for mentorship sessions and how many mentees you can advise.
        </p>
      </div>

      {savedMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Availability preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          {/* Accepting toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Accepting Mentorship Requests
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                When enabled, your profile allows students to submit new 1-on-1 requests.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={availability.isAcceptingRequests}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    isAcceptingRequests: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Numbers: weekly hours & max mentees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Advisory Hours
              </label>
              <Input
                type="number"
                min={1}
                max={40}
                value={availability.weeklyHours}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    weeklyHours: Number(e.target.value),
                  })
                }
                className="text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Estimated hours per week dedicated to mentoring.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Active Mentees
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={availability.maxActiveMentees}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    maxActiveMentees: Number(e.target.value),
                  })
                }
                className="text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Concurrent active mentorship relationships.
              </span>
            </div>
          </div>

          {/* Preferred Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred Days of the Week
            </label>
            <div className="flex flex-wrap gap-2">
              {allDays.map((day) => {
                const isSelected = availability.preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Timezone
            </label>
            <select
              value={availability.timezone}
              onChange={(e) =>
                setAvailability({ ...availability, timezone: e.target.value })
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1" />
                Save Availability
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
