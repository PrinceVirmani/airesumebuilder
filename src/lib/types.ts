import { Prisma } from "@prisma/client";
import { ResumeVlaues } from "./validation";

export interface EditorFormProps {
    resumeData: ResumeVlaues;
    setResumeData: (data: ResumeVlaues) => void;
}

export const resumeDataInclude = {
    WorkExperience: true,
    Education: true,
} satisfies Prisma.ResumeInclude

export type ResumeServerData = Prisma.ResumeGetPayload<{
    include: typeof resumeDataInclude
}>