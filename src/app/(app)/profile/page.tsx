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
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-surface p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Signal Source
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your skills, education, and resume — used by the fit analyzer and pitch generator.
        </p>
      </div>
      <ProfileEditor profile={data} />
    </div>
  );
}
