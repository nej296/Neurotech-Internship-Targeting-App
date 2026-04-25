import { prisma } from "@/lib/db";
import ProfileEditor from "./ProfileEditor";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await prisma.profile.findUnique({
    where: { id: "singleton" },
  });

  const data = profile ?? {
    resumeText: "",
    skillsJson: "[]",
    educationText: "",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Your skills, education, and resume — used by the fit analyzer and pitch generator.
        </p>
      </div>
      <ProfileEditor profile={data} />
    </div>
  );
}
