import * as React from "react";
import Link from "next/link";
import { User, MapPin, Mail, Award, Edit3, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IStudentProfile } from "@/types/student";

export interface ProfileOverviewCardProps {
  user: {
    name: string;
    email: string;
  };
  profile: IStudentProfile | null;
}

export function ProfileOverviewCard({
  user,
  profile,
}: ProfileOverviewCardProps) {
  const displayName = profile?.personalInfo?.fullName || user.name || "Student Candidate";
  const displayEmail = profile?.personalInfo?.email || user.email;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-bold">{displayName}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {profile?.careerPreferences?.preferredJobRole || "Student & Technology Candidate"}
          </p>
        </div>
        <Link href="/profile">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{displayEmail}</span>
          </div>
          {profile?.academicInfo?.collegeName && (
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>{profile.academicInfo.collegeName}</span>
            </div>
          )}
          {profile?.careerPreferences?.preferredLocation && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{profile.careerPreferences.preferredLocation}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            <span>Verified Student Account</span>
          </div>
        </div>

        {/* Highlighted Skills */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Top Registered Skills</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.slice(0, 6).map((skill) => (
                <Badge key={skill.id} variant="indigo">
                  {skill.name} ({skill.proficiency})
                </Badge>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                No skills listed yet. Add skills to increase profile completion.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
