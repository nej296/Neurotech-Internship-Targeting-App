import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { anthropic } from "@/lib/anthropic";
import type { FitAnalysisResult, SkillEntry } from "@/types";

function extractJson(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlock) return codeBlock[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

function formatSkills(json: string): string {
  try {
    const skills: SkillEntry[] = JSON.parse(json);
    return skills.map((s) => `- ${s.skill} (${s.level}/5)`).join("\n");
  } catch {
    return json;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, jdText, applicationId } = body as {
      companyId: string;
      jdText: string;
      applicationId?: string;
    };

    if (!companyId || !jdText) {
      return Response.json(
        { error: "companyId and jdText are required." },
        { status: 400 }
      );
    }

    const [company, profile] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.profile.findUnique({ where: { id: "singleton" } }),
    ]);

    if (!company) {
      return Response.json({ error: "Company not found." }, { status: 404 });
    }

    if (!profile || !profile.resumeText.trim()) {
      return Response.json(
        {
          error:
            "Profile is empty. Go to /profile and paste your resume before running fit analysis.",
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a hiring analyst. Compare the candidate's profile to the job description. Return JSON only with this exact schema:

{
  "fitScore": <number 0-100>,
  "matchedRequirements": [<string>, ...],
  "gaps": [<string>, ...],
  "recommendedActions": [<string>, ...],
  "oneLineSummary": "<string>"
}

Rules:
- Be honest, not encouraging. A 40/100 is not "great" — say what it is.
- fitScore: 0 = completely unqualified, 100 = perfect match. Most undergrads score 30-60.
- matchedRequirements: list specific JD requirements the candidate clearly meets, referencing their actual experience.
- gaps: list specific JD requirements the candidate does NOT meet. Be concrete ("needs 2+ years of C++ — candidate shows only Python") not vague ("could improve technical skills").
- recommendedActions: 2-4 specific things the candidate could do before applying to close gaps (a project, a course, a certification, reaching out to someone).
- oneLineSummary: one sentence overall assessment.

Return valid JSON only. No markdown, no commentary, no preamble.`;

    const userMessage = `## CANDIDATE PROFILE

### Education
${profile.educationText || "(not provided)"}

### Skills
${formatSkills(profile.skillsJson)}

### Resume
${profile.resumeText}

---

## TARGET COMPANY
Name: ${company.name}
Industry: ${company.lane}
Typical roles: ${company.rolesHiredBs}
${company.notes ? `Notes: ${company.notes}` : ""}

---

## JOB DESCRIPTION
${jdText}`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5-20250514",
      max_tokens: 1500,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!responseText) {
      return Response.json(
        { error: "Empty response from AI model." },
        { status: 502 }
      );
    }

    const jsonStr = extractJson(responseText);
    let result: FitAnalysisResult;

    try {
      result = JSON.parse(jsonStr);
    } catch {
      return Response.json(
        {
          error: "Failed to parse AI response as JSON.",
          raw: responseText,
        },
        { status: 502 }
      );
    }

    // Validate required fields
    if (
      typeof result.fitScore !== "number" ||
      !Array.isArray(result.matchedRequirements) ||
      !Array.isArray(result.gaps) ||
      !Array.isArray(result.recommendedActions) ||
      typeof result.oneLineSummary !== "string"
    ) {
      return Response.json(
        {
          error: "AI response missing required fields.",
          raw: responseText,
        },
        { status: 502 }
      );
    }

    // Save to application if applicationId provided
    if (applicationId) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          fitAnalysisJson: JSON.stringify(result),
          jdText,
          lastActivityAt: new Date(),
        },
      });
    }

    return Response.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("analyze-fit error:", message);
    return Response.json(
      { error: `AI analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
