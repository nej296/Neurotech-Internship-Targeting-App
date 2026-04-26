import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { genAI } from "@/lib/gemini";
import type { SkillEntry } from "@/types";

function formatSkills(json: string): string {
  try {
    const skills: SkillEntry[] = JSON.parse(json);
    return skills.map((s) => `${s.skill} (${s.level}/5)`).join(", ");
  } catch {
    return json;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body as { companyId: string };

    if (!companyId) {
      return Response.json(
        { error: "companyId is required." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not set. Add it to .env.local." },
        { status: 500 }
      );
    }

    const [company, profile, projects] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.profile.findUnique({ where: { id: "singleton" } }),
      prisma.project.findMany(),
    ]);

    if (!company) {
      return Response.json({ error: "Company not found." }, { status: 404 });
    }

    if (!profile || !profile.resumeText.trim()) {
      return Response.json(
        {
          error:
            "Profile is empty. Go to /profile and paste your resume before generating a pitch.",
        },
        { status: 400 }
      );
    }

    // Filter projects relevant to this company's lane
    const relevantProjects = projects.filter((p) => {
      if (!p.relevantTo) return false;
      return p.relevantTo
        .split(",")
        .map((s) => s.trim())
        .includes(company.lane);
    });

    const systemPrompt = `Write a 3-4 sentence "why me" paragraph connecting this specific candidate's background to this specific company's work.

Rules:
- No generic enthusiasm language ("I'm passionate about…", "I'm excited to…", "I would love to…").
- Lead with the candidate's most relevant concrete project or skill.
- Reference one specific thing about the company (their product, a paper, their approach).
- End with what the candidate would contribute, not what they'd learn.
- Plain text only. No bullet points, no headers, no preamble like "Here's your paragraph:".
- This paragraph will be pasted directly into a cover letter — write it in first person.`;

    const projectSection =
      relevantProjects.length > 0
        ? relevantProjects
            .map(
              (p) =>
                `- ${p.name} (${p.status}): ${p.description}${p.githubUrl ? ` [${p.githubUrl}]` : ""}`
            )
            .join("\n")
        : "(no projects tagged for this lane)";

    const userMessage = `## CANDIDATE

### Education
${profile.educationText || "(not provided)"}

### Skills
${formatSkills(profile.skillsJson)}

### Resume
${profile.resumeText}

### Relevant Projects
${projectSection}

---

## TARGET COMPANY
Name: ${company.name}
Industry: ${company.lane}
Typical roles: ${company.rolesHiredBs}
${company.notes ? `Context: ${company.notes}` : ""}
Career page: ${company.careerPageUrl}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent({
      systemInstruction: systemPrompt,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 400,
      },
    });

    const responseText = response.response.text();

    if (!responseText) {
      return Response.json(
        { error: "Empty response from AI model." },
        { status: 502 }
      );
    }

    // Strip any accidental preamble
    let whyMe = responseText.trim();
    whyMe = whyMe.replace(/^["']|["']$/g, "");
    whyMe = whyMe.replace(
      /^Here(?:'s| is) (?:your |the |a )?(?:paragraph|pitch)[:\s]*/i,
      ""
    );

    // Save to company
    await prisma.company.update({
      where: { id: companyId },
      data: { whyMe },
    });

    return Response.json({ whyMe });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("generate-pitch error:", message);
    return Response.json(
      { error: `Pitch generation failed: ${message}` },
      { status: 500 }
    );
  }
}
